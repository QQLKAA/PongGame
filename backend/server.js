const express = require("express");
const morgan = require("morgan");
const path = require("path");

const app = express();

const morganFormat =
  process.env.NODE_ENV === "development" ? "dev" : "combined";
app.use(morgan(morganFormat));

app.use(express.static(path.join(__dirname, "..", "public")));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on http://127.0.0.1:${port}`));
