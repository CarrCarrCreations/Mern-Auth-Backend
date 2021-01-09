const bcrypt = require("bcryptjs");
const User = require("./userModel");
const Error = require("../../error");

const findUserById = async (id) => {
  const user = await User.findById(id, (error, res) => {
    if (error) throw error;
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
  const deletedUser = await User.findByIdAndDelete(uid, (error, res) => {
    if (error) throw error;
    return res;
  });
  return deletedUser;
};

const saveUser = async (service, user) => {
  const { email, password } = user;

  switch (service) {
    case "google": {
      return await createUserWithEmail(email)
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
        await bcrypt.hash(password, salt, (error, hashedPassword) => {
          if (error) throw error;

          createNativeUser(email, hashedPassword);
        });
        return { message: "User registered successfully" };
      } catch (error) {
        throw error;
      }
    }
    default: {
      throw Error("Register service requested does not request");
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
