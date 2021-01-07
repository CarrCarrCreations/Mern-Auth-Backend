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

const register = async (service, email, password, passwordCheck) => {
  // Validate
  switch (service) {
    case "google": {
      if (!email) throw "Not all fields have been entered";
      break;
    }
    case "native": {
      if (!email || !password || !passwordCheck)
        throw "Not all fields have been entered";

      if (password.length < 5)
        throw "The password needs to be at least 5 characters long";

      if (password != passwordCheck)
        throw "Enter the same password twice for verification";
      break;
    }
    default: {
      throw "Register service requested does not request";
    }
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) throw "An account with this email already exists.";

  switch (service) {
    case "google": {
      const savedUser = await createUserWithEmail(email, (err, user) => {
        if (err) throw err.message;
        return user;
      });

      return savedUser;
    }
    case "native": {
      break;
    }
    default: {
      throw "Register service requested does not request";
    }
  }
};

module.exports = {
  login,
  register,
  generateAccessAndRefreshTokens,
};
