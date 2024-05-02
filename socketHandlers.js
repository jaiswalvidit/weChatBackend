const socketio = require("socket.io");
let activeUsersMap = new Map();

const init = (server) => {
  const io = socketio(server, {
    pingTimeout: 60000,
    cors: {
      origin: "https://wechat-frontend-jet.vercel.app",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected to socket.io", "Socket ID:", socket.id);

    socket.on('login', (userId) => {
      activeUsersMap.set(userId, socket.id);
      console.log(userId,'connected');
      console.log('connected');
      updateActiveUsers(io);
    });

    socket.on("setup", (userData) => {
      // activeUsersMap.set(userData._id, socket.id);
      // updateActiveUsers(io);
      socket.join(userData._id);  // userData._id is used as a room id here
      console.log(`${userData._id} user connected`, socket.id);
      socket.emit("connected");
    });

    socket.on("join chat", (room) => {
      socket.join(room);
      // RoomMembers.join()
      console.log(`${socket.id} joined room: ${room}`);
    
    });

    socket.on("typing", (group, userId) => {
      // console.log('groups',group);
      // console.log('users',group.group.users);
      const list=group.userId;
      const users = group.group.users; 
     
      if (group.group.admin) {
        users.push(group.group.admin);
      }
      // console.log('users',users);

      users.forEach(user => {
        if (user.name !== group.userId) {
          // console.log(list);
          io.to(user._id).emit("typing",list);

        }
      });
    });

    socket.on("stop typing", (group, userId) => {
      // console.log('groups',group);
      // console.log('users',group.group.users);
      const list=group.userId;
      const users = group.group.users; 
     
      if (group.group.admin) {

        users.push(group.group.admin);
      }
      // console.log('users',users);

      users.forEach(user => {
        if (user.name !== group.userId) {
          // console.log(list);
          io.to(user._id).emit("stop typing",list);

        }
      });
    });

    socket.on("new message", (newMessageReceived) => {
      console.log(newMessageReceived);
      let users = [...newMessageReceived.messageId.users]; // Clone to prevent mutation
      if (newMessageReceived.messageId.admin) {
        users.push(newMessageReceived.messageId.admin);
      }
      console.log(users);
      users.forEach(user => {
        if (user._id !== newMessageReceived.senderId._id) {
          io.to(user._id).emit("message received", newMessageReceived);
        }
      });
    });

    socket.on("logout", (userId) => {
      activeUsersMap.delete(userId);
      updateActiveUsers(io);
    });

    socket.on('call user', ({ userId, signal, selectedChat }) => {
      const callerSocketId = activeUsersMap.get(userId);
      if (callerSocketId) {
        io.to(callerSocketId).emit('incoming call', { signal, callerId: socket.id, details: selectedChat });
      }
    });

    socket.on('accept call', ({ signal, callerId }) => {
      io.to(callerId).emit('call accepted', { signal });
    });

    socket.on('end call', ({ userId }) => {
      const userSocketId = activeUsersMap.get(userId);
      if (userSocketId) {
        io.to(userSocketId).emit('call ended');
      }
    });

    socket.on('disconnect', () => {
      // Remove user from active users map based on socket ID
      for (let [userId, socketId] of activeUsersMap.entries()) {
        if (socketId === socket.id) {
          activeUsersMap.delete(userId);
          updateActiveUsers(io);
          break;
        }
      }
      console.log('User disconnected:', socket.id);
    });
  });
};

const updateActiveUsers = (io) => {
  io.emit('activeUsers', Array.from(activeUsersMap.keys())); // Only send user IDs
};

module.exports = { init };