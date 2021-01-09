const { Error } = require("../../error");

const findUserById = (UserRepository) => async (id) => {
  const user = await UserRepository.findUserById(id, (err, res) => {
    if (err) throw err.message;
    return res;
  });

  return user;
};

const registerUser = (UserRepository) => async (service, user) => {
  try {
    const { valid, message: errorMessage } = validateRequest(service, user);
    if (!valid) {
      throw Error(errorMessage, 400);
    }

    const userExists = await UserRepository.findUserByEmail(user.email);
    if (userExists) throw "An account with this email already exists.";

    const savedUserResponse = await UserRepository.saveUser(service, user);
    return savedUserResponse;
  } catch (error) {
    throw error;
  }
};

const validateRequest = (service, user) => {
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

module.exports = (UserRepository) => {
  return {
    findUser: findUserById(UserRepository),
    register: registerUser(UserRepository),
  };
};
