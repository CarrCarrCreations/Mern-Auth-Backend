const bcrypt = require("bcryptjs");
const {
  findUserByEmail,
  createUserWithEmail,
  createNativeUser,
  findUserById,
} = require("../repository/UserRepository");

const findUser = async (id) => {
  const user = await findUserById(id);
  if (!user) throw "No user found for given ID";
  return {
    id: user._id,
    displayName: user.displayName,
  };
};

const createUser = async (user) => {
  const { service, email, password, passwordCheck } = user;

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
      return savedUser;
    }
    default: {
      throw "Register service requested does not request";
    }
  }
};

module.exports = {
  findUser,
  createUser,
};
