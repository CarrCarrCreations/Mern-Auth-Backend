const User = require("../model/userModel");
const UserRepositoryImpl = require("../repo/UserRepositoryImpl");

const newUserFn = (email, passwordHash) => {
  return new User({
    email,
    password: passwordHash,
  });
};

module.exports = UserRepositoryImpl(User, newUserFn);
