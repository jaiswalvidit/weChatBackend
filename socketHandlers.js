
// socketHandlers.js
const socketio = require("socket.io");
let activeUsers = [];

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
      activeUsers.push(userId);
      console.log(activeUsers); // For debugging
      io.emit('activeUsers', activeUsers); // Update all clients
    });

    socket.on("setup", (userData) => {
      // activeUsers.push({ user: userData._id, socketId: socket.id });
      console.log(`${userData._id} user connected`, socket.id);
      socket.join(userData._id);
      socket.emit("connected");
      // console.log(activeUsers, "active users");
      // io.emit("active users", activeUsers);
    });

    socket.on("join chat",(room) => {
      console.log(room,'joined');
      socket.join(room);
      console.log(socket.id, "Joined Room:", room);
    });

    socket.on("typing", (room) =>
    {
      console.log('typing',room)
      return socket.to(room).emit("typing")});
    socket.on("stop typing", (room) => socket.to(room).emit("stop typing"));

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
      const index = activeUsers.findIndex((user) => user.userId === userId);
      if (index !== -1) {
        activeUsers.splice(index, 1);
        io.emit("activeUsers", activeUsers);
      }
    });

    // socket.on('disconnect', () => {
    //   activeUsers = activeUsers.filter(u => u !== socket.id);
    //   io.emit('activeUsers', activeUsers); // Update all clients
    //   console.log('A user disconnected:', socket.id);
    // });
  });
};

module.exports = { init };
