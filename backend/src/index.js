import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";

const PORT = 8787;

const ROWS = 17;
const COLS = 8;

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// ===============================
// BOARD FUNCTIONS
// ===============================

function createBoard() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      count: 0,
      player: null,
    })),
  );
}

function getCapacity(row, col) {
  const corner =
    (row === 0 || row === ROWS - 1) && (col === 0 || col === COLS - 1);

  if (corner) return 2;

  const edge = row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1;

  if (edge) return 3;

  return 4;
}

function getNeighbours(row, col) {
  const cells = [];

  if (row > 0) cells.push([row - 1, col]);

  if (row < ROWS - 1) cells.push([row + 1, col]);

  if (col > 0) cells.push([row, col - 1]);

  if (col < COLS - 1) cells.push([row, col + 1]);

  return cells;
}

// Chain reaction

function explode(board, row, col, player) {
  board[row][col].count = 0;
  board[row][col].player = null;

  const neighbours = getNeighbours(row, col);

  neighbours.forEach(([r, c]) => {
    board[r][c].count++;

    board[r][c].player = player;

    if (board[r][c].count >= getCapacity(r, c)) {
      explode(board, r, c, player);
    }
  });
}

// ===============================
// WINNER CHECK
// ===============================

function checkWinner(board, moves) {
  // avoid instant win
  if (moves < 2) return null;

  let player0 = false;
  let player1 = false;

  board.forEach((row) => {
    row.forEach((cell) => {
      if (cell.player === 0) player0 = true;

      if (cell.player === 1) player1 = true;
    });
  });

  if (!player0) return 1;

  if (!player1) return 0;

  return null;
}

// ===============================
// ROOMS
// ===============================

const rooms = {};

// ===============================
// SOCKET
// ===============================

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  let currentRoom = null;

  // CREATE ROOM

  socket.on("createRoom", (roomCode) => {
    if (!rooms[roomCode]) {
      rooms[roomCode] = {
        players: [],

        board: createBoard(),

        turn: 0,

        moves: 0,

        winner: null,

        started: false,
      };
    }

    const room = rooms[roomCode];

    if (room.players.length >= 2) {
      socket.emit("roomFull");

      return;
    }

    room.players.push(socket.id);

    currentRoom = roomCode;

    socket.join(roomCode);

    const player = room.players.length - 1;

    socket.emit("playerAssigned", player);

    io.to(roomCode).emit("boardUpdate", room.board);

    console.log(rooms);
  });

  // JOIN ROOM

  socket.on("joinRoom", (roomCode) => {
    const room = rooms[roomCode];

    if (!room) {
      socket.emit("error", "Room not found");

      return;
    }

    if (room.players.length >= 2) {
      socket.emit("roomFull");

      return;
    }

    room.players.push(socket.id);

    currentRoom = roomCode;

    socket.join(roomCode);

    const player = room.players.length - 1;

    socket.emit("playerAssigned", player);

    room.started = true;

    io.to(roomCode).emit("gameStarted");

    io.to(roomCode).emit("turnChange", room.turn);

    io.to(roomCode).emit("boardUpdate", room.board);
  });

  // PLAYER MOVE

  socket.on("playerMove", (data) => {
    if (!currentRoom) return;

    const room = rooms[currentRoom];

    if (!room) return;

    const playerIndex = room.players.indexOf(socket.id);

    // player validation

    if (playerIndex !== data.player) {
      socket.emit("invalid", "Invalid player");

      return;
    }

    // turn validation

    if (room.turn !== playerIndex) {
      socket.emit("invalid", "Not your turn");

      return;
    }

    // cell validation

    if (data.row < 0 || data.row >= ROWS || data.col < 0 || data.col >= COLS)
      return;

    const cell = room.board[data.row][data.col];

    // opponent cell

    if (cell.player !== null && cell.player !== playerIndex) {
      socket.emit("invalid", "Opponent cell");

      return;
    }

    // add ball

    cell.count++;

    cell.player = playerIndex;

    // blast

    if (cell.count >= getCapacity(data.row, data.col)) {
      explode(room.board, data.row, data.col, playerIndex);
    }

    room.moves++;

    const winner = checkWinner(room.board, room.moves);

    if (winner !== null) {
      room.winner = winner;

      io.to(currentRoom).emit("gameOver", winner);

      return;
    }

    // update board

    io.to(currentRoom).emit("boardUpdate", room.board);

    // change turn

    room.turn = room.turn === 0 ? 1 : 0;

    io.to(currentRoom).emit("turnChange", room.turn);
  });

  // RESTART

  socket.on("restartGame", () => {
    if (!currentRoom) return;

    const room = rooms[currentRoom];

    room.board = createBoard();

    room.turn = 0;

    room.moves = 0;

    room.winner = null;

    io.to(currentRoom).emit("boardUpdate", room.board);

    io.to(currentRoom).emit("turnChange", 0);
  });

  // DISCONNECT

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);

    if (currentRoom && rooms[currentRoom]) {
      const room = rooms[currentRoom];

      room.players = room.players.filter((id) => id !== socket.id);

      io.to(currentRoom).emit("playerLeft");

      if (room.players.length === 0) {
        delete rooms[currentRoom];
      }
    }
  });
});

//  fontend

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// ===============================
// START SERVER
// ===============================

server.listen(PORT, () => {
  console.log(`Server running http://localhost:${PORT}`);
});
