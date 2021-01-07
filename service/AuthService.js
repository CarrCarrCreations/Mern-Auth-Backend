const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  findUserByEmail,
  createUserWithEmail,
  createNativeUser,
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

const login = async (service, email, password) => {
  try {
    // Validate
    switch (service) {
      case "google": {
        if (!email) throw "Not all fields have been entered";
        break;
      }
      case "native": {
        if (!email || !password) throw "Not all fields have been entered";
        break;
      }
      default: {
        throw "Login service requested does not request";
      }
    }

    const user = await findUserByEmail(email);
    if (!user) throw "Account does not exist";

    if (service == "native") {
      // Validate correct password is given
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({
          msg: "Invalid Credentials",
        });
    }

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

  // Save the new user
  switch (service) {
    case "google": {
      const savedUser = await createUserWithEmail(email, (err, user) => {
        if (err) throw err.message;
        return user;
      });

      return savedUser;
    }
    case "native": {
      // Hash the password, NEVER save pure password in database
      const salt = await bcrypt.genSalt();
      savedUser = await bcrypt.hash(
        password,
        salt,
        async (err, passwordHash) => {
          if (err) {
            throw err.message;
          }

          const nativeUser = createNativeUser(email, passwordHash);
          return nativeUser;
        }
      );
      console.log(savedUser);
      return savedUser;
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
