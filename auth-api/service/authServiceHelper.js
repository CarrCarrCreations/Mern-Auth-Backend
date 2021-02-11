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

const generateAccessAndRefreshTokens = (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  return {
    accessToken,
    refreshToken,
  };
};

const validateRegisterRequest = (service, user) => {
  const { email, password, passwordCheck } = user;

  switch (service) {
    case "google": {
      if (!email) {
        return { valid: false, message: "Not all fields have been entered" };
      }
    }
    case "native": {
      if (!email || !password || !passwordCheck) {
        return { valid: false, message: "Not all fields have been entered" };
      }

      if (password.length < 5) {
        return {
          valid: false,
          message: "The password needs to be at least 5 characters long",
        };
      }

      if (password != passwordCheck) {
        return {
          valid: false,
          message: "Enter the same password twice for verification",
        };
      }
      break;
    }
    default: {
      return {
        valid: false,
        message: "Registering service requested does not exist",
      };
    }
  }

  return { valid: true, message: "" };
};

const validateLoginRequest = (service, user) => {
  switch (service) {
    case "google": {
      if (!user.email)
        return { valid: false, message: "Not all fields have been entered" };
      break;
    }
    case "native": {
      if (!user.email || !user.password)
        return { valid: false, message: "Not all fields have been entered" };
      break;
    }
    default: {
      return {
        valid: false,
        message: "Login service requested does not request",
      };
    }
  }
  return { valid: true, message: "" };
};

module.exports = {
  validateRegisterRequest,
  validateLoginRequest,
  generateAccessToken,
  generateRefreshToken,
  generateAccessAndRefreshTokens,
};
