import io from "socket.io-client";

// Todo: Usunąć ścieżkę w środowisku produkcyjnym
const socket = io("http://localhost:3000");

const allViewIds = ["view-loading", "view-login", "view-playerlist"];

function addClass(el, className) {
  const classList = el.className.split(" ");
  if (classList.indexOf(className) === -1) {
    el.className = classList.concat(className).join(" ");
  }
}

function removeClass(el, className) {
  el.className = el.className
    .split(" ")
    .filter((name) => name !== className)
    .join(" ");
}

function showView(id) {
  allViewIds.forEach((id) => {
    addClass(document.getElementById(id), "hidden");
  });
  removeClass(document.getElementById(id), "hidden");
}

const btnLogin = document.getElementById("btn-login");

socket.on("request_login", () => {
  showView("view-login");
});

socket.on("show_player_list", (players) => {
  showView("view-playerlist");
  document.getElementById("playerlist").innerHTML = "";
  players.forEach((nickname) => {
    const li = document.createElement("li");
    li.innerText = nickname;
    document.getElementById("playerlist").appendChild(li);
  });
});

socket.on("update_player_list", (players) => {
  document.getElementById("playerlist").innerHTML = "";
  players.forEach((nickname) => {
    const li = document.createElement("li");
    li.innerText = nickname;
    document.getElementById("playerlist").appendChild(li);
  });
});

btnLogin.addEventListener("click", () => {
  const nickname = document.getElementById("nickname").value;
  if (nickname.length > 0) {
    socket.emit("login", nickname);
  }
});
