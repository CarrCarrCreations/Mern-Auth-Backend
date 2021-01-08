const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const db = require("./repository/mongooseConfig");
require("dotenv").config();

// setup express
const app = express();
app.use(express.json());
app.use(cors());

const morgan = require("morgan");
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`The server has started on port: ${PORT}`);
});

db.connect();

// set morgan for routing
app.use(morgan("dev"));

// Setup routes
app.use("/", require("./routes/authRouter"));
app.use("/users", require("./routes/userRouter"));
app.use("/google", require("./routes/googleRouter"));

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
