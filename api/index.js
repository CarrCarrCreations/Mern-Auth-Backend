const UserRepository = require("./database/repo/UserRepository");
const AuthService = require("./service/authService");

module.exports = AuthService(UserRepository);
