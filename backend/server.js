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

io.on("connection", (socket) => {
  socket.on("login", nickname => {
    socket.emit("show_player_list", [nickname]);
  });

  setTimeout(() => socket.emit("request_login"), 500);
});
