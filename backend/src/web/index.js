// const socket = io("http://localhost:8787");

const hostBtn = document.getElementById("hostBtn");
const joinBtn = document.getElementById("joinBtn");
const code = document.querySelector(".code");
const textField = document.querySelector(".textField");
const nameField = document.querySelector(".nameField");
const toast = document.getElementById("toast");
const toastTitle = document.querySelector(".toast-title");
let randomCode;

hostBtn.addEventListener("click", () => {
  randomCode = Number(Math.random().toFixed(6) * 1000000);
  code.innerText = randomCode;
});

joinBtn.addEventListener("click", () => {
  if (code.innerText !== "--" || textField.value !== "") {
    if (nameField.value !== "") {
      window.location.href =
        "http://192.168.1.20:5500/src/web/home/home.html?roomId=" + code.innerText;
      localStorage.setItem("roomId", randomCode===undefined ? textField.value : randomCode);
      localStorage.setItem("playerName", nameField.value);
    } else {
      toast.showModal();
      toastTitle.innerText = "Please enter your name to join the game";
      setTimeout(() => {
        toast.close();
      }, 1500);
    }
  } else {
    toast.showModal();
    toastTitle.innerText = "Please enter a valid game code or host a game";
    setTimeout(() => {
      toast.close();
    }, 1500);
  }
});
