import io from "socket.io-client";
import $ from "jquery";

// Todo: Usunąć ścieżkę w środowisku produkcyjnym
const socket = io("http://localhost:3000");

function showView(id) {
  $(".view").addClass("hidden");
  $(`#${id}`).removeClass("hidden");
}

function updatePlayerList(players) {
  const playerList = $("#playerlist");
  playerList.empty();

  players.forEach((nickname) => {
    const playerListItem = $("<li>");
    playerListItem.text(nickname);
    playerList.append(playerListItem);
  });
}

socket.on("request_login", () => {
  showView("view-login");
});

socket.on("show_player_list", (players) => {
  showView("view-playerlist");
  updatePlayerList(players);
});

socket.on("update_player_list", (players) => {
  updatePlayerList(players);
});

$("#btn-login").on("click", () => {
  const nickname = $("#nickname").val();
  if (nickname.length > 0) {
    socket.emit("login", nickname);
  }
});
