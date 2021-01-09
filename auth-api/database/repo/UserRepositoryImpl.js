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

module.exports = (User, newUserFn) => {
  return {
    findUserById: findUserById(User),
    findUserByEmail: findUserByEmail(User),
    createUserWithEmail: createUserWithEmail(User),
    createNativeUser: createNativeUser(newUserFn),
    findByIdAndDelete: findByIdAndDelete(User),
  };
};
