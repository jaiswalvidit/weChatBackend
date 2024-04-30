const socketio = require("socket.io");

let activeUsersMap = new Map();
const userToSocket = new Map();

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
      console.log(`${userId} connected`);
      updateActiveUsers(io);
    });

    socket.on("setup", (userData) => {
      socket.join(userData._id);
      console.log(`${userData._id} user connected`, socket.id);
      socket.emit("connected");
    });

    socket.on("typing", (group, userId) => {
      broadcastTyping(io, group, userId);
    });

    socket.on("stop typing", (group, userId) => {
      broadcastStopTyping(io, group, userId);
    });

    socket.on("call-user", (data) => {
      handleCallUser(io, socket, data);
    });

    socket.on("call-accepted", (data) => {
      handleCallAccepted(io, socket, data);
    });

    socket.on("new message", (newMessageReceived) => {
      handleNewMessage(io, newMessageReceived);
    });

    socket.on("logout", (userId) => {
      handleLogout(io, userId);
    });

    socket.on('disconnect', () => {
      handleDisconnect(io, socket.id);
    });
  });
};

const updateActiveUsers = (io) => {
  io.emit('activeUsers', Array.from(activeUsersMap.keys())); // Emit user IDs
};

const broadcastTyping = (io, group, userId) => {
  const { users, admin } = group;
  const list = userId;
  if (admin) {
    users.push(admin);
  }
  users.forEach(user => {
    if (user._id !== userId) {
      io.to(user._id).emit("typing", list);
    }
  });
};

const broadcastStopTyping = (io, group, userId) => {
  const { users, admin } = group;
  const list = userId;
  if (admin) {
    users.push(admin);
  }
  users.forEach(user => {
    if (user._id !== userId) {
      io.to(user._id).emit("stop typing", list);
    }
  });
};

const handleCallUser = (io, socket, data) => {
  const { emailId, offer } = data;
  const callerId = userToSocket.get(socket.id);
  const receiverId = activeUsersMap.get(emailId);
  if (receiverId) {
    io.to(receiverId).emit('incoming call', { from: callerId, offer });
  }
};

const handleCallAccepted = (io, socket, data) => {
  const { emailId, ans } = data;
  const callerId = userToSocket.get(socket.id);
  const receiverId = activeUsersMap.get(emailId);
  if (receiverId) {
    io.to(receiverId).emit('call-accepted', { from: callerId, ans });
  }
};

const handleNewMessage = (io, newMessageReceived) => {
  const { messageId, senderId } = newMessageReceived;
  let users = [...messageId.users];
  if (messageId.admin) {
    users.push(messageId.admin);
  }
  users.forEach(user => {
    if (user !== senderId._id) {
      io.to(user).emit("message received", newMessageReceived);
    }
  });
};

const handleLogout = (io, userId) => {
  activeUsersMap.delete(userId);
  updateActiveUsers(io);
};

const handleDisconnect = (io, socketId) => {
  // Remove user from activeUsersMap based on socket ID
  for (const [userId, userSocketId] of activeUsersMap.entries()) {
    if (userSocketId === socketId) {
      activeUsersMap.delete(userId);
      updateActiveUsers(io);
      break;
    }
  }
  console.log('User disconnected:', socketId);
};

module.exports = { init };
