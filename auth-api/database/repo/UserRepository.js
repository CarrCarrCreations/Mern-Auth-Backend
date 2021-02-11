const User = require("../model/userModel");
const UserRepositoryImpl = require("../repo/UserRepositoryImpl");

const newUserFn = (email, passwordHash) => {
  let creds = { email };
  if (passwordHash) creds = { ...creds, password: passwordHash };
  return new User(creds);
};

module.exports = UserRepositoryImpl(User, newUserFn);
