import express from "express";
import { Server } from "socket.io";
import http from "http";
// import path from "path";

const Port_No = 8787;

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms = {};

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  let currentRoom = null;

  // create room api
  socket.on("createRoom", (roomCode) => {
    if (!rooms[roomCode]) rooms[roomCode] = [];

    if (rooms[roomCode].length >= 2) {
      socket.emit("roomFull");
      return;
    }

    currentRoom = roomCode;

    if (rooms[currentRoom].includes(socket.id)) {
      socket.emit("waiting", "You already created this room");
      return;
    }

    rooms[roomCode].push(socket.id);

    socket.join(roomCode);

    if (rooms[roomCode].length === 2) {
      io.to(roomCode).emit("startGame");
    }

    // Notify everyone in room about the new player
    io.to(roomCode).emit("roomData", rooms[roomCode]);

    console.log(rooms);
  });


  // room join api 
  socket.on("joinRoom", (roomCode) => {
    if (!rooms[roomCode]) {
      socket.emit("error", "Room not found");
      return;
    }

    if (rooms[roomCode].includes(socket.id)) return;

    if (rooms[roomCode].length >= 2) {
      socket.emit("roomFull");
      return;
    }

    rooms[roomCode].push(socket.id);
    socket.join(roomCode);
    currentRoom = roomCode;

    // 🔥 start game only when 2 players
    if (rooms[roomCode].length === 2) {
      io.to(roomCode).emit("startGame");
    }
  });

  // send data api
  socket.on("send", (value) => {
    const { player } = value;

    if (currentRoom === null) return;

    let playerId = rooms[currentRoom][player];

    if (socket.id !== playerId) {
      socket.emit("invalid", "Not your turn");
      return;
    }

    // ✅ send only to current room
    io.to(currentRoom).emit("receive", value);
  });



  // socket disconnect logic
  socket.on("disconnect", () => {
    if (currentRoom && rooms[currentRoom]) {
      // ❌ remove socket.id from room
      rooms[currentRoom] = rooms[currentRoom].filter((id) => id !== socket.id);

      // 🔥 If room becomes empty → delete it
      if (rooms[currentRoom].length === 0) {
        delete rooms[currentRoom];
      } else {
        // ✅ notify remaining players
        io.to(currentRoom).emit("roomData", rooms[currentRoom]);
      }
    }
  });
});


// create get to show server is running perfect or not
app.get("/", (_, res) => {
  res.send({
    status: 200,
    message: `Your server is running port no : http://192.168.1.31:${Port_No} `,
  });
});

// const __dirname = path.resolve();

// app.use(express.static(path.join(__dirname,"../frontend/dist")));

// app.get((_, res) => {
//   res.sendFile(path.join(__dirname, "../frontend","dist","index.html"));
// });

server.listen(Port_No, "0.0.0.0", (err) => {
  if (err) throw err;
  console.log(`Your server is running on port no. ${Port_No}`);
});
