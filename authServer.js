const express = require("express");
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

// Setup routes
app.use("/users", require("./routes/authRouter"));
