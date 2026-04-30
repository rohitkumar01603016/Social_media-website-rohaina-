


// const express = require("express")
// const connectDB = require('./config/db')
// const app = express();
// const users = require('./Routes/api/users')
// const chat = require('./Routes/api/chat')
// const posts = require("./Routes/api/posts")
// const message = require("./Routes/api/message")
// const story = require("./Routes/api/story")
// const dotenv = require("dotenv");
// const cors = require('cors');
// const bodyParser = require("body-parser");
// const passport = require("passport");
// const http = require('http');
// const socketio = require('socket.io');
// const errorHandler = require("./middleware/error");
// const server = http.createServer(app)
// const path = require("path");
// const fs = require("fs");
// const User = require("./Schema/User");
// require("./Schema/message");
// dotenv.config();


// const io = require("socket.io")(server, {
//   pingTimeout: 60000,
//   cors: {
//     origin: "http://localhost:3000",
//     // credentials: true,
//   },
// });

// const onlineUsers = new Map();

// const broadcastPresence = async (userId, isOnline) => {
//   const timestamp = new Date();

//   await User.findByIdAndUpdate(userId, {
//     isOnline,
//     lastSeen: timestamp,
//   });

//   io.emit("presence update", {
//     userId: userId.toString(),
//     isOnline,
//     lastSeen: timestamp.toISOString(),
//   });
// };



// // Bodyparser middleware
// app.use(
//   bodyParser.urlencoded({
//     extended: false,
//     limit: "12mb",
//   })
// );

// app.use(bodyParser.json({ limit: "12mb" }));

// app.use(cors({ origin: true }));
// // Passport middleware
// app.use(passport.initialize());
// // Passport config
// require('./config/password')(passport);

// // Routes
// app.use("/api/users", users);
// app.use("/api/post/", posts);
// app.use("/api/chat/", chat);
// app.use("/api/message/", message);
// app.use("/api/story/", story);


// io.on("connection", (socket) => {
//   console.log("User Connect")

//   socket.on("setup", async (userData) => {
//     socket.userId = userData.id;
//     socket.userName = userData.name || userData.email || "User";
//     socket.join(userData.id)
//     console.log(userData.id)

//     const currentSockets = onlineUsers.get(userData.id) || new Set();
//     const isFirstSocket = currentSockets.size === 0;
//     currentSockets.add(socket.id);
//     onlineUsers.set(userData.id, currentSockets);

//     if (isFirstSocket) {
//       await broadcastPresence(userData.id, true);
//     }

//     socket.emit("connected")
//   })

//   socket.on("join chat", (room) => {
//     socket.join(room)
//     console.log("User Join to ROOM :  " + room)
//   })

//   socket.on("typing", (room) =>
//     socket.in(room).emit("typing", {
//       userId: socket.userId,
//       name: socket.userName,
//     })
//   );
//   socket.on("stop typing", (room) =>
//     socket.in(room).emit("stop typing", {
//       userId: socket.userId,
//       name: socket.userName,
//     })
//   );
//   socket.on("new message", (newMessageRecieved) => {
//     var chat = newMessageRecieved.chat;

//     if (!chat.users) return console.log("chat.users not defined");

//     chat.users.forEach((user) => {
//       if (user._id == newMessageRecieved.sender._id) return;

//       socket.in(user._id).emit("message recieved", newMessageRecieved);
//     });
//   });

//   socket.on("delete message", (deletedMessage) => {
//     const chat = deletedMessage.chat;

//     if (!chat?.users) return;

//     chat.users.forEach((user) => {
//       socket.in(user._id).emit("message deleted", deletedMessage);
//     });
//   });

//   socket.on("disconnect", async () => {
//     if (!socket.userId) {
//       return;
//     }

//     const currentSockets = onlineUsers.get(socket.userId);

//     if (!currentSockets) {
//       return;
//     }

//     currentSockets.delete(socket.id);

//     if (currentSockets.size === 0) {
//       onlineUsers.delete(socket.userId);
//       await broadcastPresence(socket.userId, false);
//       return;
//     }

//     onlineUsers.set(socket.userId, currentSockets);
//   });

// })
// // --------------------------deployment------------------------------

// const __dirname1 = path.resolve();
// const frontendBuildPath = path.join(__dirname1, "FrontEnd", "build");
// const frontendIndexPath = path.join(frontendBuildPath, "index.html");
// const hasFrontendBuild = fs.existsSync(frontendIndexPath);

// if (process.env.NODE_ENV === "production" && hasFrontendBuild) {
//   app.use(express.static(frontendBuildPath));

//   app.get("*", (req, res) =>
//     res.sendFile(frontendIndexPath)
//   );
// } else {
//   app.get("/", (req, res) => {
//     if (process.env.NODE_ENV === "production" && !hasFrontendBuild) {
//       return res.status(200).send("API is running. FrontEnd build not found.");
//     }

//     res.send("API is running..");
//   });
// }

// // --------------------------deployment------------------------------

// app.use(errorHandler);

// const PORT = process.env.PORT || 4000;

// const startServer = async () => {
//   try {
//     await connectDB();
//     await User.updateMany({}, { isOnline: false });

//     server.listen(PORT, () => {
//       console.log("Server Work in ", PORT);
//     });
//   } catch (error) {
//     console.error(error.message);
//     process.exit(1);
//   }
// };

// startServer();


// 🔥 Load env FIRST
require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const app = express();

const users = require("./Routes/api/users");
const chat = require("./Routes/api/chat");
const posts = require("./Routes/api/posts");
const message = require("./Routes/api/message");
const story = require("./Routes/api/story");

const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
const http = require("http");
const socketio = require("socket.io");
const errorHandler = require("./middleware/error");
const path = require("path");
const fs = require("fs");

const User = require("./Schema/User");
require("./Schema/message");

// ✅ FIXED (passport spelling)
require("./config/passport")(passport);

const server = http.createServer(app);

// ✅ FIXED CORS (production safe)
const io = socketio(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*", // or your frontend URL
  },
});

const onlineUsers = new Map();

const broadcastPresence = async (userId, isOnline) => {
  try {
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
  } catch (err) {
    console.log("Presence error:", err.message);
  }
};

// 🔹 Middleware
app.use(
  bodyParser.urlencoded({
    extended: false,
    limit: "12mb",
  })
);

app.use(bodyParser.json({ limit: "12mb" }));

app.use(cors());

// Passport
app.use(passport.initialize());

// 🔹 Routes
app.use("/api/users", users);
app.use("/api/post", posts);
app.use("/api/chat", chat);
app.use("/api/message", message);
app.use("/api/story", story);

// 🔥 SOCKET.IO
io.on("connection", (socket) => {
  console.log("User Connected");

  socket.on("setup", async (userData) => {
    try {
      socket.userId = userData.id;
      socket.userName = userData.name || userData.email || "User";

      socket.join(userData.id);

      const currentSockets = onlineUsers.get(userData.id) || new Set();
      const isFirstSocket = currentSockets.size === 0;

      currentSockets.add(socket.id);
      onlineUsers.set(userData.id, currentSockets);

      if (isFirstSocket) {
        await broadcastPresence(userData.id, true);
      }

      socket.emit("connected");
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing", {
      userId: socket.userId,
      name: socket.userName,
    });
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing", {
      userId: socket.userId,
      name: socket.userName,
    });
  });

  socket.on("new message", (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;

    if (!chat.users) return;

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.on("delete message", (deletedMessage) => {
    const chat = deletedMessage.chat;
    if (!chat?.users) return;

    chat.users.forEach((user) => {
      socket.in(user._id).emit("message deleted", deletedMessage);
    });
  });

  socket.on("disconnect", async () => {
    try {
      if (!socket.userId) return;

      const currentSockets = onlineUsers.get(socket.userId);
      if (!currentSockets) return;

      currentSockets.delete(socket.id);

      if (currentSockets.size === 0) {
        onlineUsers.delete(socket.userId);
        await broadcastPresence(socket.userId, false);
      } else {
        onlineUsers.set(socket.userId, currentSockets);
      }
    } catch (err) {
      console.log(err);
    }
  });
});

// 🔥 DEPLOYMENT FIX
const __dirname1 = path.resolve();
const frontendBuildPath = path.join(__dirname1, "FrontEnd", "build");
const frontendIndexPath = path.join(frontendBuildPath, "index.html");

if (process.env.NODE_ENV === "production" && fs.existsSync(frontendIndexPath)) {
  app.use(express.static(frontendBuildPath));

  app.get("*", (req, res) => {
    res.sendFile(frontendIndexPath);
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

// 🔹 Error handler
app.use(errorHandler);

// 🔥 PORT FIX
const PORT = process.env.PORT || 4000;

// 🔥 START SERVER
const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB Connected");

    await User.updateMany({}, { isOnline: false });

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error.message);
    process.exit(1);
  }
};

startServer();