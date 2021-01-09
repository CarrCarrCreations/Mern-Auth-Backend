const express = require("express");
const cors = require("cors");
const db = require("./repository/mongooseConfig");
const { v4: uuid4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const AuthRouter = require("./routes/authRouter");
const GoogleRouter = require("./routes/googleRouter");
const UserRouter = require("./routes/userRouter");

require("dotenv").config();

// setup express
const app = express();
app.use(express.json());
app.use(cors());

const morgan = require("morgan");

morgan.token("id", (req) => {
  return req.id;
});

morgan.token("param", (req) => {
  return "customToken";
});

const assignId = (req, res, next) => {
  req.id = uuid4();
  next();
};

app.use(assignId);

let accessLogStream = fs.createWriteStream(path.join(__dirname, "access_log"), {
  flags: "a",
});

app.use(morgan(":id :param :method :status :url 'HTTP/:http-version'"));
app.use(
  morgan(":id :param :method :status :url 'HTTP/:http-version'", {
    stream: accessLogStream,
  })
);

const PORT = process.env.PORT || 4000;

db.connect();

app.listen(PORT, () => {
  console.log(`The server has started on port: ${PORT}`);
});

// Setup routes
app.use("/", AuthRouter);
app.use("/users", UserRouter);
app.use("/google", GoogleRouter);

// endpoint not found response
app.use((req, res, next) => {
  const error = new Error("Not Found");
  res.status("404");
  next(error);
});

// Global error handler
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
