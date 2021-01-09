const UserRepository = require("../repository/UserRepository");
const UserService = require("../user/userService");

module.exports = UserService(UserRepository);
