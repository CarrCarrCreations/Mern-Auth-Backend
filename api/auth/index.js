const UserRepository = require("./UserRepository");
const AuthService = require("./authService");

module.exports = AuthService(UserRepository);
