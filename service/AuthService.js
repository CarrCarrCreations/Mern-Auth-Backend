const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  findUserByEmail,
  createUserWithEmail,
  createNativeUser,
  findUserById,
} = require("../repository/UserRepository");
const {
  saveRefreshToken,
  findByIdAndRefreshToken,
  deleteAllUserRefreshTokens,
} = require("../repository/RefreshTokenRepository");

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

const deleteUser = async (uid) => {
  const deletedUser = await User.findByIdAndDelete(uid);
  return deletedUser;
};

const refreshAccessToken = async (refreshToken) => {
  if (refreshToken == null) return res.sendStatus(401);

  const userId = await jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_TOKEN_SECRET,
    (err, user) => {
      if (err) throw err.message;
      return user.id;
    }
  );

  // Check if refresh token actually exists otherwise throw unauthorized error
  // DB contains only active refresh tokens
  const matchedToken = await findByIdAndRefreshToken(userId, refreshToken);

  if (matchedToken) {
    const accessToken = generateAccessToken(userId);
    return accessToken;
  } else throw "No refresh token in database for current user";
};

const logout = async (uid) => {
  try {
    return await deleteAllUserRefreshTokens(uid);
  } catch (err) {
    throw err.message;
  }
};

const refreshTokenIsValid = async (refreshToken) => {
  // If no token exists, return false
  if (!refreshToken) return false;

  // If token cannot be verified against JWT_SECRET return false
  const verified = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_TOKEN_SECRET
  );
  if (!verified) return false;

  // Verify that the userId exists in DB given in the JWT token
  const user = await findUserById(verified.id);
  if (!user) return false;

  // Verify Refresh Token is in the active DB
  const matchedToken = await findByIdAndRefreshToken(verified.id, refreshToken);
  if (!matchedToken) return false;

  return true;
};

const accessTokenIsValid = async (accessToken) => {
  // If no token exists, return false
  if (!accessToken) return false;

  // If token cannot be verified against JWT_SECRET return false
  const verified = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET);
  if (!verified) return false;

  // Verify that the userId exists in DB given in the JWT token
  const user = await findUserById(verified.id);
  if (!user) return false;

  return true;
};

module.exports = {
  login,
  register,
  logout,
  generateAccessAndRefreshTokens,
  deleteUser,
  refreshAccessToken,
  refreshTokenIsValid,
  accessTokenIsValid,
};
