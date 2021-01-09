const User = require("../model/userModel");
const UserRepositoryImpl = require("../repo/UserRepositoryImpl");

const newUserFn = (email, passwordHash) => {
  if (passwordHash)
    return new User({
      email,
      password: passwordHash,
    });
  else
    return new User({
      email,
    });
};

module.exports = UserRepositoryImpl(User, newUserFn);
