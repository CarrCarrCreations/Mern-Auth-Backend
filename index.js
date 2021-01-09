const express = require("express");
const cors = require("cors");
const db = require("./repository/mongooseConfig");

const AuthRouter = require("./routes/authRouter");
const GoogleRouter = require("./routes/googleRouter");
const UserRouter = require("./routes/userRouter");

require("dotenv").config();

// setup express
const app = express();
app.use(express.json());
app.use(cors());

const morgan = require("morgan");
const PORT = process.env.PORT || 4000;

db.connect();

app.listen(PORT, () => {
  console.log(`The server has started on port: ${PORT}`);
});

// set morgan for routing
app.use(morgan("dev"));

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
