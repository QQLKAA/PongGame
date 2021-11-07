import io from "socket.io-client";

// Todo: Usunąć ścieżkę w środowisku produkcyjnym
const socket = io("http://localhost:3000");

const messages = document.getElementById("messages");
const btnPing = document.getElementById("btn-ping");
const inputData = document.getElementById("input-data");

socket.on("pong", (data) => {
  const li = document.createElement("li");
  li.innerText = data;
  messages.appendChild(li);
});

btnPing.addEventListener("click", (e) => {
  const data = inputData.value;
  socket.emit("ping", data);
});
