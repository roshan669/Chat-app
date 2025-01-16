const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const userRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");

const app = express();
require("dotenv").config();

const server = http.createServer(app);

// var corsOptions = {
//   origin: 'https://chat-app-91lq.onrender.com',
//   optionsSuccessStatus: 200
// };

app.use(cors());
app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoutes);

mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log(err.message);
  });

const PORT = process.env.PORT || 5000; // Default to 5000 if PORT is not set
server.listen(PORT, () => {
  console.log(`Server Started at PORT ${PORT}`);
});

const io = socketIo(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
  transports: ["websocket"],
});

global.allOnlineUsers = new Set();

io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("add-user", (userId) => {
    global.onlineUsers.set(userId, socket.id);
    socket.data.userId = userId;
    console.log(`User ${userId} connected`);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = global.onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recive", data.msg);
    }
  });

  socket.on("disconnect", () => {
    const userId = socket.data.userId;
    if (userId) {
      global.onlineUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  });
});
