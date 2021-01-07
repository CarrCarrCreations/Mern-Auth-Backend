const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/refreshTokenModel");
const User = require("../models/userModel");

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

const generateAccessAndRefreshTokens = (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  return {
    accessToken,
    refreshToken,
  };
};

const saveRefreshToken = async (uid, refreshToken) => {
  const newRt = new RefreshToken({
    uid,
    refreshToken: refreshToken,
  });

  await newRt
    .save()
    .then((response) => response)
    .catch((err) => {
      throw err.message;
    });
};

const findUserByEmail = async (email) => {
  const user = await User.findOne(
    {
      email: email,
    },
    (err, res) => {
      if (err) throw err.message;
      return res;
    }
  );

  return user;
};

const login = async (email) => {
  try {
    // Validate
    if (!email) throw "Not all fields have been entered";

    const user = await findUserByEmail(email);
    if (!user) throw "Account does not exist";

    const { accessToken, refreshToken } = generateAccessAndRefreshTokens(
      user._id
    );

    await saveRefreshToken(user._id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        displayName: user.displayName,
      },
    };
  } catch (err) {
    throw err.message;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateAccessAndRefreshTokens,
  saveRefreshToken,
  findUserByEmail,
  login,
};
