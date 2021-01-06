const jwt = require("jsonwebtoken");

const generateAccessToken = (userID) => {
  return jwt.sign(
    {
      id: userID,
    },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: "50m" }
  );
};

const generateRefreshToken = (userID) => {
  return jwt.sign(
    {
      id: userID,
    },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
