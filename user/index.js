const UserRepository = require("../repository/UserRepository");
const UserService = require("./userService");

module.exports = UserService(UserRepository);
