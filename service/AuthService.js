const jwt = require("jsonwebtoken");
const {
  findUserByEmail,
  createUserWithEmail,
} = require("../repository/UserRepository");
const { saveRefreshToken } = require("../repository/RefreshTokenRepository");

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

const register = async (email) => {
  // Validate
  if (!email) throw "Not all fields have been entered";

  const existingUser = await findUserByEmail(email);
  if (existingUser) throw "An account with this email already exists.";

  const savedUser = await createUserWithEmail(email, (err, user) => {
    if (err) throw err.message;
    return user;
  });

  return savedUser;
};

module.exports = {
  login,
  register,
};
