


const express = require("express")
const connectDB = require('./config/db')
const app = express();
const users = require('./Routes/api/users')
const chat = require('./Routes/api/chat')
const posts = require("./Routes/api/posts")
const message = require("./Routes/api/message")
const story = require("./Routes/api/story")
const dotenv = require("dotenv");
const cors = require('cors');
const passport = require("passport");
const http = require('http');
const errorHandler = require("./middleware/error");
const server = http.createServer(app)
const path = require("path");
const fs = require("fs");
const User = require("./Schema/User");
require("./Schema/message");
dotenv.config();


const io = require("socket.io")(server, {
  pingTimeout: 60000,
  transports: ["websocket", "polling"],
  cors: {
    origin: true,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

const onlineUsers = new Map();
const toRoomId = (value) => (value ? value.toString() : "");

const broadcastPresence = async (userId, isOnline) => {
  const timestamp = new Date();

  await User.findByIdAndUpdate(userId, {
    isOnline,
    lastSeen: timestamp,
  });

  io.emit("presence update", {
    userId: userId.toString(),
    isOnline,
    lastSeen: timestamp.toISOString(),
  });
};

app.use(
  express.urlencoded({
    extended: false,
    limit: "12mb",
  })
);

app.use(express.json({ limit: "12mb" }));

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
// Passport middleware
app.use(passport.initialize());
// Passport config
require('./config/password')(passport);

// Routes
app.use("/api/users", users);
app.use("/api/post/", posts);
app.use("/api/chat/", chat);
app.use("/api/message/", message);
app.use("/api/story/", story);


io.on("connection", (socket) => {
  console.log("User Connect")

  socket.on("setup", async (userData = {}) => {
    const userId = toRoomId(userData.id || userData._id);

    if (!userId) {
      socket.emit("socket error", { message: "User id is required" });
      return;
    }

    socket.userId = userId;
    socket.userName = userData.name || userData.email || "User";
    socket.join(userId)
    console.log(userId)

    const currentSockets = onlineUsers.get(userId) || new Set();
    const isFirstSocket = currentSockets.size === 0;
    currentSockets.add(socket.id);
    onlineUsers.set(userId, currentSockets);

    if (isFirstSocket) {
      try {
        await broadcastPresence(userId, true);
      } catch (error) {
        console.error("Could not broadcast online presence:", error.message);
      }
    }

    socket.emit("connected")
  })

  socket.on("join chat", (room) => {
    const roomId = toRoomId(room);

    if (!roomId) {
      return;
    }

    socket.join(roomId)
    console.log("User Join to ROOM :  " + roomId)
  })

  socket.on("typing", (room) => {
    const roomId = toRoomId(room);

    if (!roomId) {
      return;
    }

    socket.in(roomId).emit("typing", {
      userId: socket.userId,
      name: socket.userName,
    })
  });
  socket.on("stop typing", (room) => {
    const roomId = toRoomId(room);

    if (!roomId) {
      return;
    }

    socket.in(roomId).emit("stop typing", {
      userId: socket.userId,
      name: socket.userName,
    })
  });
  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      const recipientRoom = toRoomId(user._id || user.id || user);
      const senderId = toRoomId(newMessageRecieved.sender?._id || newMessageRecieved.sender?.id || newMessageRecieved.sender);

      if (!recipientRoom || recipientRoom === senderId) return;

      socket.in(recipientRoom).emit("message recieved", newMessageRecieved);
    });
  });

  socket.on("delete message", (deletedMessage) => {
    const chat = deletedMessage.chat;

    if (!chat?.users) return;

    chat.users.forEach((user) => {
      const recipientRoom = toRoomId(user._id || user.id || user);

      if (!recipientRoom) {
        return;
      }

      socket.in(recipientRoom).emit("message deleted", deletedMessage);
    });
  });

  socket.on("disconnect", async () => {
    if (!socket.userId) {
      return;
    }

    const currentSockets = onlineUsers.get(socket.userId);

    if (!currentSockets) {
      return;
    }

    currentSockets.delete(socket.id);

    if (currentSockets.size === 0) {
      onlineUsers.delete(socket.userId);
      try {
        await broadcastPresence(socket.userId, false);
      } catch (error) {
        console.error("Could not broadcast offline presence:", error.message);
      }
      return;
    }

    onlineUsers.set(socket.userId, currentSockets);
  });

})
// --------------------------deployment------------------------------

const __dirname1 = path.resolve();
const frontendBuildCandidates = [
  path.join(__dirname1, "FrontEnd", "dist"),
  path.join(__dirname1, "frontend", "dist"),
  path.join(__dirname1, "FrontEnd", "build"),
  path.join(__dirname1, "frontend", "build"),
];
const frontendBuildPath = frontendBuildCandidates.find((candidate) =>
  fs.existsSync(path.join(candidate, "index.html"))
) || frontendBuildCandidates[0];
const frontendIndexPath = path.join(frontendBuildPath, "index.html");
const hasFrontendBuild = fs.existsSync(frontendIndexPath);

if (process.env.NODE_ENV === "production" && hasFrontendBuild) {
  app.use(express.static(frontendBuildPath));

  app.get("*", (req, res) =>
    res.sendFile(frontendIndexPath)
  );
} else {
  app.get("/", (req, res) => {
    if (process.env.NODE_ENV === "production" && !hasFrontendBuild) {
      return res.status(200).send("API is running. frontend build not found.");
    }

    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();
    await User.updateMany({}, { isOnline: false });

    server.listen(PORT, () => {
      console.log("Server Work in ", PORT);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
