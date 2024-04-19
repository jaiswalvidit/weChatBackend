// socketHandlers.js
const socketio = require("socket.io");
let activeUsers = [];

const init = (server) => {
  const io = socketio(server, {
    pingTimeout: 60000,
    cors: {
      origin: "https://wechat-frontend-jet.vercel.app", 
    },
  });
  

  io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
      activeUsers.push({ user: userData._id, socketId: socket.id });
      console.log(`${userData._id} user connected`, socket.id);
      socket.join(userData._id);
      socket.emit("connected");
      console.log(activeUsers, "active users");
      io.emit("active users", activeUsers);
    });

    socket.on("join chat",(room) => {
      console.log(room,'joined');
      socket.join(room);
      console.log(socket.id, "Joined Room:", room);
    });

    socket.on("typing", (room) => socket.to(room).emit("typing"));
    socket.on("stop typing", (room) => socket.to(room).emit("stop typing"));

    socket.on("new message", (newMessageReceived) => {
      console.log(newMessageReceived,"data is");
      let users = newMessageReceived.messageId.users;
      console.log(users);
      users.forEach(user => {
        if (user === newMessageReceived.senderId._id) return;
        socket.in(user).emit("message received", newMessageReceived);
      });
    });

    socket.on("disconnect", () => {
      activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
      console.log("USER DISCONNECTED");
      io.emit("active users", activeUsers);
    });
  });
};

module.exports = { init };
