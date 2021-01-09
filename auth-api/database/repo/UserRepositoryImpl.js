const bcrypt = require("bcryptjs");
const Error = require("../../../error");

const findUserById = (User) => async (id) => {
  const user = await User.findById(id, (error, res) => {
    if (error) throw error;
    return res;
  });

  return user;
};

const findUserByEmail = (User) => async (email) => {
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

const createUserWithEmail = (User) => async (email) => {
  const newUser = new User({
    email,
  });

  return await newUser.save();
};

const createNativeUser = (newUserFn) => async (email, passwordHash) => {
  const newUser = newUserFn(email, passwordHash);

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

const findByIdAndDelete = (User) => async (uid) => {
  const deletedUser = await User.findByIdAndDelete(uid, (error, res) => {
    if (error) throw error;
    return res;
  });
  return deletedUser;
};

const saveUser = (newUserFn) => async (service, user) => {
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
        createNativeUser(newUserFn)(email, password);
        await bcrypt.hash(password, salt, async (error, hashedPassword) => {
          if (error) throw error;

          await this.createNativeUser(email, hashedPassword);
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

module.exports = (User, newUserFn) => {
  return {
    findUserById: findUserById(User),
    findUserByEmail: findUserByEmail(User),
    createUserWithEmail: createUserWithEmail(User),
    createNativeUser: createNativeUser(newUserFn),
    findByIdAndDelete: findByIdAndDelete(User),
    saveUser: saveUser(newUserFn),
  };
};
