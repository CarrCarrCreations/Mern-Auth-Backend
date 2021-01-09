const bcrypt = require("bcryptjs");
const Error = require("../../../error");

const createUser = (newUserFn) => async (email, passwordHash) => {
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

const findUserBy = (User) => async ({ field, value }) => {
  const user = User.find()
    .where(field)
    .equals(value)
    .exec()
    .then((user) => {
      return user;
    })
    .catch((error) => {
      throw error;
    });
  return user;
};

const findUserByIdAndDelete = (User) => async (uid) => {
  const deletedUser = await User.findByIdAndDelete(uid, (error, res) => {
    if (error) throw error;
    return res;
  });
  return deletedUser;
};

module.exports = (User, newUserFn) => {
  return {
    findUserBy: findUserBy(User),
    findUserByIdAndDelete: findUserByIdAndDelete(User),
    createUser: createUser(newUserFn),
  };
};
