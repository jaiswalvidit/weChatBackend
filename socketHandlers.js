// socketHandlers.js
const socketio = require("socket.io");
let activeUsersSet = new Set();

const init = (server) => {
  const io = socketio(server, {
    pingTimeout: 60000,
    cors: {
      origin: "https://wechat-frontend-jet.vercel.app" 
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on('login', (userId) => {
      activeUsersSet.add(userId);
      updateActiveUsers(io);
    });

    socket.on("setup", (userData) => {
      activeUsersSet.add(userData._id);
      updateActiveUsers(io);
      console.log(`${userData._id} user connected`, socket.id);
      socket.join(userData._id);
      socket.emit("connected");
    });

    socket.on("join chat",(room) => {
      console.log(room,'joined');
      socket.join(room);
      console.log(socket.id, "Joined Room:", room);
    });

    socket.on("typing", (room) => {
      console.log('typing',room)
      return socket.to(room).emit("typing");
    });
    
    socket.on("stop typing", (room) => {
      socket.to(room).emit("stop typing");
    });

    socket.on("new message", (newMessageReceived) => {
      console.log(newMessageReceived,"data is");
      let users = newMessageReceived.messageId.users;
      console.log(newMessageReceived.messageId.admin,'admin')
      if(newMessageReceived.messageId.admin)
        users.push(newMessageReceived.messageId.admin)
      console.log(users);
      users.forEach(user => {
        if (user === newMessageReceived.senderId._id) return;
        socket.in(user).emit("message received", newMessageReceived);
      });
    });

    socket.on("logout", (userId) => {
      activeUsersSet.delete(userId);
      updateActiveUsers(io);
    });

    // Handle call related functionality
    socket.on('call', (data) => {
      console.log('call is made');
      console.log(data);

      // Here you can handle call initiation logic
      // For example, emit an event to the recipient(s) to notify them about the call
      socket.to(data.userId).emit('incoming call', { callerId: socket.id });
    });

    // socket.on('disconnect', () => {
    //   activeUsers = activeUsers.filter(u => u !== socket.id);
    //   io.emit('activeUsers', activeUsers); // Update all clients
    //   console.log('A user disconnected:', socket.id);
    // });
  });
};

const updateActiveUsers = (io) => {
  let activeUsers = [...activeUsersSet];
  io.emit('activeUsers', activeUsers); // Update all clients
};

module.exports = { init };
