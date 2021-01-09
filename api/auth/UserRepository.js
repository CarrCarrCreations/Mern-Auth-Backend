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

  const savedUser = await newUser.save((err, res) => {
    if (err) throw err.message;
    return res;
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

const saveUser = (service, user) => {
  const { email, password } = user;

  switch (service) {
    case "google": {
      const savedUser = await createUserWithEmail(email)
      .exec()
      .then(user => {return user})
      .catch(error => {throw error})

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
}

module.exports = {
  findUserById,
  findUserByEmail,
  createUserWithEmail,
  createNativeUser,
  findByIdAndDelete,
  saveUser
};
