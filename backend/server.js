const express = require("express");
const morgan = require("morgan");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const morganFormat =
  process.env.NODE_ENV === "development" ? "dev" : "combined";
app.use(morgan(morganFormat));

app.use(express.static(path.join(__dirname, "..", "public")));

const port = process.env.PORT || 3000;
const server = http.createServer(app);
server.listen(port, () => console.log(`Listening on http://localhost:${port}`));

const io = new Server(server, {
  cors: {
    origin: "http://localhost:9000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("ping", (data) => {
    socket.emit("pong", data);
  });
});
