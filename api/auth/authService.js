const findUserById = (UserRepository) => async (id) => {
  const user = await UserRepository.findUserById(id, (err, res) => {
    if (err) throw err.message;
    return res;
  });

  return user;
};

const registerUser = (UserRepository) => async (service, user) => {
  try {
    const { valid, messages } = validateRequest(service, user);
    if (!valid) throw messages;

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

  let valid = true;
  let messages = [];

  switch (service) {
    case "google": {
      if (!email) {
        valid = false;
        messages.push("Not all fields have been entered");
        break;
      }
    }
    case "native": {
      if (!email || !password || !passwordCheck) {
        valid = false;
        messages.push("Not all fields have been entered");
        break;
      }

      if (password.length < 5) {
        valid = false;
        messages.push("The password needs to be at least 5 characters long");
        break;
      }

      if (password != passwordCheck) {
        valid = false;
        messages.push("Enter the same password twice for verification");
        break;
      }
      break;
    }
    default: {
      valid = false;
      messages.push("Registering service requested does not exist");
      break;
    }
  }

  return { valid, messages };
};

module.exports = (UserRepository) => {
  return {
    findUser: findUserById(UserRepository),
    register: registerUser(UserRepository),
  };
};
