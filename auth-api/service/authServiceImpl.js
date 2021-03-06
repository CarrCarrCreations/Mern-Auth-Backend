const bcrypt = require("bcryptjs");
const axios = require("axios");
const { Error } = require("../../error");
const {
  validateRegisterRequest,
  validateLoginRequest,
  generateAccessAndRefreshTokens,
} = require("./authServiceHelper");

const findUserById = (UserRepository) => async (id) => {
  const user = await UserRepository.findUserById(id)
    .then((user) => {
      return user;
    })
    .catch((error) => {
      throw error;
    });

  return {
    user: {
      id: user.id,
      email: user.email,
    },
  };
};

const registerUser = (UserRepository) => async (service, user) => {
  try {
    const { valid, message: errorMessage } = validateRegisterRequest(
      service,
      user
    );
    if (!valid) {
      throw Error(errorMessage);
    }

    const userExists = await UserRepository.findUserBy({
      field: "email",
      value: user.email,
    });
    if (userExists.length > 0)
      throw Error("An account with this email already exists.");

    switch (service) {
      case "google": {
        return await UserRepository.createUser(user.email)
          .then((_) => {
            return { message: "User registered successfully" };
          })
          .catch((error) => {
            throw error;
          });
      }
      case "native": {
        try {
          // Hash the password, NEVER save pure password in database
          const salt = await bcrypt.genSalt();

          await bcrypt.hash(
            user.password,
            salt,
            async (error, hashedPassword) => {
              if (error) throw error;

              await UserRepository.createUser(user.email, hashedPassword);
            }
          );

          return { message: "User registered successfully" };
        } catch (error) {
          throw error;
        }
      }
      default: {
        throw Error("Register service requested does not request");
      }
    }
  } catch (error) {
    throw error;
  }
};

const loginUser = (UserRepository, RefreshTokenRepository) => async (
  service,
  user
) => {
  try {
    const { valid, message: errorMessage } = validateLoginRequest(
      service,
      user
    );
    if (!valid) {
      throw Error(errorMessage);
    }

    const userExists = await UserRepository.findUserBy({
      field: "email",
      value: user.email,
    });
    if (!userExists[0])
      throw Error("An account with this email does not exist");
    foundUser = userExists[0];

    if (service == "native") {
      // Validate correct password is given
      const isMatch = await bcrypt.compare(user.password, foundUser.password);
      if (!isMatch)
        throw Error({
          status: 400,
          message: "Invalid Credentials",
        });
    }

    const { accessToken, refreshToken } = generateAccessAndRefreshTokens(
      foundUser._id
    );

    await RefreshTokenRepository.saveRefreshToken(foundUser._id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: foundUser._id,
        displayName: foundUser.displayName,
      },
    };
  } catch (error) {
    throw error;
  }
};

logoutUser = (RefreshTokenRepository) => async (uid) => {
  try {
    return await RefreshTokenRepository.deleteAllUserRefreshTokens(uid);
  } catch (error) {
    throw error;
  }
};

const getGoogleUser = async (code, redirect_uri) => {
  try {
    if (!code || !redirect_uri) throw "Missing required parameters";
    const googleAccessToken = await getGoogleAccessToken(code, redirect_uri);
    const userInfo = await getGoogleUserInfo(googleAccessToken);

    return userInfo;
  } catch (error) {
    throw error;
  }
};

const getGoogleUserInfo = async (access_token) => {
  const { data } = await axios({
    url: "https://www.googleapis.com/oauth2/v2/userinfo",
    method: "get",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      throw error;
    });

  // { id, email, given_name, family_name }
  return data;
};

const getGoogleAccessToken = async (code, redirectLocation) => {
  return await axios({
    url: `https://oauth2.googleapis.com/token`,
    method: "post",
    data: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: "http://localhost:3000/google/" + redirectLocation,
      grant_type: "authorization_code",
      code,
    },
  })
    .then(async (response) => {
      return response.data.access_token;
    })
    .catch((error) => {
      throw error;
    });
};

module.exports = (UserRepository, RefreshTokenRepository) => {
  return {
    findUserById: findUserById(UserRepository),
    register: registerUser(UserRepository),
    loginUser: loginUser(UserRepository, RefreshTokenRepository),
    logoutUser: logoutUser(UserRepository, RefreshTokenRepository),
  };
};
