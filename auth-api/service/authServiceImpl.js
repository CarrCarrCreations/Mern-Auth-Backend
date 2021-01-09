const bcrypt = require("bcryptjs");
const { Error } = require("../../error");
const {
  validateRegisterRequest,
  validateLoginRequest,
  generateAccessAndRefreshTokens,
} = require("./authServiceHelper");

const findUserById = (UserRepository) => async (id) => {
  const user = await UserRepository.findUserBy(
    {
      field: "_id",
      valid: id,
    },
    (error, res) => {
      if (error) throw error;
      return res;
    }
  );

  return user;
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

const loginUser = (UserRepository) => async (service, user) => {
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

    // await saveRefreshToken(user._id, refreshToken);

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

module.exports = (UserRepository) => {
  return {
    findUser: findUserById(UserRepository),
    register: registerUser(UserRepository),
    loginUser: loginUser(UserRepository),
  };
};
