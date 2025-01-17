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

global.allOnlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("add-user", (userId) => {
    global.allOnlineUsers.set(userId, socket.id);
    console.log(`User ${userId} connected`);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = global.allOnlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recive", data.msg);
    }
  });

  socket.on("offline", (data) => {
    console.log(data.CU);
    const userId = data.CU;
    if (userId) {
      global.allOnlineUsers.delete(userId);
      console.log(`User ${userId} explicitly disconnected`);
    }
    console.log("allOnlineUsers after offline:", global.allOnlineUsers); // Debug log
  });
});
