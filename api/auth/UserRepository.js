const bcrypt = require("bcryptjs");
const User = require("./userModel");

const findUserById = async (id) => {
  const user = await User.findById(id, (err, res) => {
    if (err) throw err.message;
    return res;
  });

  return user;
};

const findUserByEmail = async (email) => {
  const user = await User.findOne({
    email: email,
  })
    .exec()
    .then((res) => {
      return res;
    })
    .catch((error) => {
      throw error;
    });

  return user;
};

const createUserWithEmail = async (email) => {
  const newUser = new User({
    email,
  });

  return await newUser.save();
};

const createNativeUser = async (email, passwordHash) => {
  //Save the user
  const newUser = new User({
    email,
    password: passwordHash,
  });

  const savedUser = await newUser
    .save()
    .then((user) => {
      return user;
    })
    .catch((error) => {
      throw error;
    });

  return savedUser;
};

const findByIdAndDelete = async (uid) => {
  const deletedUser = await User.findByIdAndDelete(uid, (err, res) => {
    if (err) throw err.message;
    return res;
  });
  return deletedUser;
};

const saveUser = async (service, user) => {
  const { email, password } = user;

  switch (service) {
    case "google": {
      const savedUser = await createUserWithEmail(email)
        .exec()
        .then((user) => {
          return user;
        })
        .catch((error) => {
          throw error;
        });

      return savedUser;
    }
    case "native": {
      try {
        // Hash the password, NEVER save pure password in database
        const salt = await bcrypt.genSalt();
        await bcrypt.hash(password, salt, (error, res) => {
          if (error) throw error;

          const savedUser = createNativeUser(email, res);
          return savedUser;
        });
        return { message: "User registered successfully" };
      } catch (error) {
        throw error;
      }
    }
    default: {
      throw "Register service requested does not request";
    }
  }
};

module.exports = {
  findUserById,
  findUserByEmail,
  createUserWithEmail,
  createNativeUser,
  findByIdAndDelete,
  saveUser,
};
