require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const connectToMongoDB = require("./db");
const socketHandlers = require("./socketHandlers");
const path = require("path");
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8003;
// console.log(PORT)
// console.log(process.env.mongoURL)
// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectToMongoDB();

// Serving the React app in production
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, 'client/build')));
//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
//   });
// } else {
  app.get("/", (req, res) => {
    res.send("API is running smoothly");
  });
// }

// Routes
app.use("/api", require("./routes/storeData"));
app.use("/api", require("./routes/route"));

// Socket.io setup
socketHandlers.init(server);

// Start the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
