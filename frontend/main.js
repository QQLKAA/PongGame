import io from "socket.io-client";
import $ from "jquery";

// Todo: Usunąć ścieżkę w środowisku produkcyjnym
const socket = io("http://localhost:3000");

let currentNickname = "";

function showView(id) {
  $(".view").addClass("hidden");
  $(`#${id}`).removeClass("hidden");
}

function updatePlayerList(players) {
  const playerList = $("#playerlist");
  playerList.empty();

  players.forEach((nickname) => {
    const playerListItem = $("<li>");

    const playerListItemNickname = $("<span>");
    playerListItemNickname.text(nickname);
    playerListItem.append(playerListItemNickname);

    if (nickname !== currentNickname) {
      const playerListItemChallenge = $("<button>Rzuć wyzwanie!</button>");
      playerListItemChallenge.on("click", () => {
        socket.emit("challenge", nickname);
      });
      playerListItem.append(playerListItemChallenge);
    }

    playerList.append(playerListItem);
  });
}

socket.on("request_login", () => {
  showView("view-login");
  $("#login-error").empty();
});

socket.on("show_login_error", (message) => {
  $("#login-error").text(message);
});

socket.on("show_player_list", (players) => {
  showView("view-playerlist");
  updatePlayerList(players);
});

socket.on("update_player_list", (players) => {
  updatePlayerList(players);
});

socket.on("update_challenge_list", (data) => {
  const sentChallenges = data.sent;
  const receivedChallenges = data.received;

  const sentChallengesList = $("#sentchallengelist");
  const receivedChallengesList = $("#receivedchallengelist");

  sentChallengesList.empty();
  sentChallenges.forEach((challenge) => {
    const item = $("<li>");
    item.text(`Wysłano wyzwanie do: ${challenge.targetPlayer}`);
    item.appendTo(sentChallengesList);
  });

  receivedChallengesList.empty();
  receivedChallenges.forEach((challenge) => {
    const item = $("<li>");
    item.text(`Odebrano wyzwanie od: ${challenge.sourcePlayer}`);
    item.appendTo(receivedChallengesList);
  });
});

$("#login-form").on("submit", (e) => {
  e.preventDefault();
  const nickname = $("#nickname").val();
  if (nickname.length > 0) {
    socket.emit("login", nickname);
    currentNickname = nickname;
  }
});
