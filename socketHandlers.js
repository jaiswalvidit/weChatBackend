const socketio = require("socket.io");
let activeUsersSet = new Set();

const init = (server) => {
  const io = socketio(server, {
    pingTimeout: 60000,
    cors: {
      origin: "https://wechat-frontend-jet.vercel.app",
      methods: ["GET", "POST"],
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
      socket.join(userData._id);
      console.log(`${userData._id} user connected`, socket.id);
      socket.emit("connected");
    });

    socket.on("join chat", (room) => {
      socket.join(room);
      console.log(socket.id, "Joined Room:", room);
    });

    socket.on("typing", (room) => socket.to(room).emit("typing"));
    socket.on("stop typing", (room) => socket.to(room).emit("stop typing"));

    socket.on("new message", (newMessageReceived) => {
      let users = newMessageReceived.messageId.users;
      if (newMessageReceived.messageId.admin) {
        users.push(newMessageReceived.messageId.admin);
      }
      users.forEach(user => {
        if (user === newMessageReceived.senderId._id) return;
        socket.in(user).emit("message received", newMessageReceived);
      });
    });

    socket.on("logout", (userId) => {
      activeUsersSet.delete(userId);
      updateActiveUsers(io);
    });

    // Handling video call signaling
    socket.on('call user', ({ userId, signal, selectedChat }) => {
      console.log('Calling user', userId);
      console.log('signal', signal);
      socket.to(userId).emit('incoming call', { signal, callerId: socket.id, details:selectedChat });
    });

    socket.on('accept call', ({ signal, callerId }) => {
      console.log('Call accepted by', callerId);
      console.log('signal', signal);
      socket.to(callerId).emit('call accepted', { signal });
    });

    socket.on('end call', ({ userId }) => {
      socket.to(userId).emit('call ended');
    });

    // Handling disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Cleanup or user status updates can go here
    });
  });
};

const updateActiveUsers = (io) => {
  io.emit('activeUsers', [...activeUsersSet]); // Update all clients
};

module.exports = { init };
