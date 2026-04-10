const socket = io("http://localhost:8787");

const dialog = document.getElementById("myDialog");
const toast = document.getElementById("toast");
const closeButton = document.getElementById("closeDialogButton");
const playerText = document.querySelector(".player");
const toastTitle = document.querySelector(".toast-title");
const restartButton = document.getElementById("restartButton");

const rows = 17;
const cols = 8;
const grid = document.getElementById("grid");

const roomId  = localStorage.getItem("roomId");
const playerName = localStorage.getItem("playerName");

socket.emit("createRoom", roomId, playerName);

socket.on("invalid",(messsage)=>{
    toast.showModal();
    toastTitle.innerText = messsage;
    setTimeout(() => {
      toast.close();
    }, 1500);
});


let board = [];
let currentPlayer = 0;
let totalPlayer = 2;

let hasPlayed = [false, false];
let isEliminate = [false, false];

// Create grid
for (let r = 0; r < rows; r++) {
  board[r] = [];

  for (let c = 0; c < cols; c++) {
    board[r][c] = { count: 0, player: null };

    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.row = r;
    cell.dataset.col = c;

    cell.addEventListener("click", () => {
      socket.emit("send", {
        row: r,
        col: c,
        player: currentPlayer,
      });
    });

    grid.appendChild(cell);
  }
}

// Cell limit logic
function getLimit(r, c) {
  let count = 0;

  if (r > 0) count++;
  if (r < rows - 1) count++;
  if (c > 0) count++;
  if (c < cols - 1) count++;

  return count;
}

// Update UI
function updateUI() {
  document.querySelectorAll(".cell").forEach((cell) => {
    const r = cell.dataset.row;
    const c = cell.dataset.col;
    const data = board[r][c];

    cell.innerHTML = "";

    if (data.count > 0) {
      for (let i = 0; i < data.count; i++) {
        const ball = document.createElement("div");
        ball.classList.add("ball");

        // Add layout class
        if (data.count === 1) ball.classList.add("ball-1");
        if (data.count === 2) ball.classList.add("ball-2");
        if (data.count === 3) ball.classList.add("ball-3");

        // Set color
        ball.style.background = getPlayerColor(data.player);

        cell.appendChild(ball);
      }
    }
  });
}

function getPlayerColor(player) {
  switch (player) {
    case 0:
      return "red";
    case 1:
      return "blue";
    default:
      return "black";
  }
}

function nextMove() {
  do {
    currentPlayer++;
    if (currentPlayer == totalPlayer) currentPlayer = 0;
  } while (isEliminate[currentPlayer]);
}

socket.on("receive", (data) => {
  const { row, col, player } = data;

  const cell = board[row][col];

  cell.count++;
  cell.player = player;

  nextMove();

  if (cell.count >= getLimit(row, col)) {
    blastFromServer(row, col, player);
  }
  updateUI();
});

function blastFromServer(r, c, player) {
  board[r][c] = { count: 0, player: null };

  const directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];

  directions.forEach(([dr, dc]) => {
    const nr = r + dr;
    const nc = c + dc;

    if (nr >= 0 && nc >= 0 && nr < rows && nc < cols) {
      const cell = board[nr][nc];

      cell.count++;
      cell.player = player;

      if (cell.count >= getLimit(nr, nc)) {
        blastFromServer(nr, nc, player);
      }
    }
  });
}
// Click handler
// function handleClick(r, c) {
//   if (isEliminate[currentPlayer]) return;
//   const cell = board[r][c];

//   if (cell.player == null || cell.player == currentPlayer) {
//     hasPlayed[currentPlayer] = true;

//     addBall(r, c);

//     checkUserEliminated();

//     checkWin();

//     nextMove();

//     updateUI();
//   } else {
//     toast.showModal();
//     toastTitle.textContent = `Player ${getPlayerColor(currentPlayer)}, it's your turn!`;
//     setTimeout(() => {
//       toast.close();
//     }, 800);
//   }
// }

// Add ball
function addBall(r, c) {
  const cell = board[r][c];

  // cell.count++;
  // cell.player = currentPlayer;

  if (cell.count >= getLimit(r, c)) {
    blastFromServer(r, c, cell.player);
  }
}

// Explosion logic
function blast(r, c) {
  board[r][c] = { count: 0, player: null };

  const directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];

  directions.forEach(([dr, dc]) => {
    const nr = r + dr;
    const nc = c + dc;

    if (nr >= 0 && nc >= 0 && nr < rows && nc < cols) {
      addBall(nr, nc);
    }
  });
}

function checkUserEliminated() {
  for (let i = 0; i < totalPlayer; i++) {
    if (!hasPlayed[i]) continue;

    let found = false;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c].player === i) {
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      isEliminate[i] = true;
    }
  }
}

function checkWin() {
  let activePlayers = 0;
  let winner = -1;

  for (let i = 0; i < totalPlayer; i++) {
    if (!isEliminate[i]) {
      activePlayers++;
      winner = i;
    }
  }

  if (activePlayers === 1) {
    setTimeout(() => {
      dialog.showModal();
      playerText.textContent = `Player ${winner + 1} wins!`;
    }, 800);
  }

  closeButton.addEventListener("click", () => {
    dialog.close();
  });
}
