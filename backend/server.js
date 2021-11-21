const express = require("express");
const morgan = require("morgan");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

// Konfiguracja loggera w zależności od środowiska.
const morganFormat =
  process.env.NODE_ENV === "development" ? "dev" : "combined";
app.use(morgan(morganFormat));

// Express ma serwować pliki z katalogu public.
app.use(express.static(path.join(__dirname, "..", "public")));

// Ustawienie nasłuchiwania serwera.
const port = process.env.PORT || 3000;
const server = http.createServer(app);
server.listen(port, () => console.log(`Listening on http://localhost:${port}`));

// Tworzenie obiektu socket.io. Cors jest wymagany, by można było się łączyć z webpack-dev-server.
const io = new Server(server, {
  cors: {
    origin: "http://localhost:9000",
    methods: ["GET", "POST"],
  },
});

function getPlayerList() {
  const sockets = io.of("/").sockets;
  const playerList = [];
  sockets.forEach((socket) => {
    if (socket.nickname) {
      playerList.push(socket.nickname);
    }
  });
  return playerList;
}

function getPlayer(nickname) {
  const sockets = io.of("/").sockets;
  let result = null;
  sockets.forEach((socket) => {
    if (socket.nickname === nickname) {
      result = socket;
    }
  });
  return result;
}

class Challenge {
  constructor(sourcePlayer, targetPlayer) {
    this.sourcePlayer = sourcePlayer;
    this.targetPlayer = targetPlayer;
  }
}

io.on("connection", (socket) => {
  socket.on("login", (nickname) => {
    if (getPlayer(nickname) === null) {
      socket.nickname = nickname;
      socket.sentChallenges = [];
      socket.receivedChallenges = [];
      const playerList = getPlayerList();
      socket.emit("show_player_list", playerList);
      io.emit("update_player_list", playerList);
      socket.emit("update_challenge_list", {
        sent: socket.sentChallenges,
        received: socket.receivedChallenges,
      });
    } else {
      socket.emit(
        "show_login_error",
        `Użytkownik o nicku ${nickname} jest już zalogowany`
      );
    }
  });

  socket.on("challenge", (challengedNickname) => {
    let challengedPlayer = getPlayer(challengedNickname);
    if (challengedPlayer) {
      // Sprawdź, czy wyzwynie zostało już rzucone
      const equalChallenges = challengedPlayer.receivedChallenges.filter(
        (challenge) => challenge.sourcePlayer === socket.nickname
      );
      if (equalChallenges.length > 0) {
        // TODO: Może jakaś wiadomość z błędem?
        return;
      }

      // Utwórz wyzwanie i zapisz je w uchwytach graczy
      const challenge = new Challenge(
        socket.nickname,
        challengedPlayer.nickname
      );
      socket.sentChallenges.push(challenge);
      challengedPlayer.receivedChallenges.push(challenge);

      // Zaktualizuj listę wyzwań
      socket.emit("update_challenge_list", {
        sent: socket.sentChallenges,
        received: socket.receivedChallenges,
      });
      challengedPlayer.emit("update_challenge_list", {
        sent: challengedPlayer.sentChallenges,
        received: challengedPlayer.receivedChallenges,
      });
    }
  });

  socket.on("disconnect", () => {
    const playerList = getPlayerList();
    io.emit("update_player_list", playerList);
  });

  setTimeout(() => socket.emit("request_login"), 500);
});
