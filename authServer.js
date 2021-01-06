const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// setup express
const app = express();
app.use(express.json());
app.use(cors());

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`The server has started on port: ${PORT}`);
});

// Setup mongoose
mongoose.connect(
  process.env.MONGODB_CONNECTION_STRING,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
  (err) => {
    if (err) throw err;
    console.log("MongoDB connection established.");
  }
);

// Setup routes
app.use("/", require("./routes/authRouter"));
app.use("/google", require("./routes/googleRouter"));
