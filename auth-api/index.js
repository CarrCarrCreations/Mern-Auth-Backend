const UserRepository = require("./database/repo/UserRepository");
const AuthServiceImpl = require("./service/authServiceImpl");

module.exports = AuthServiceImpl(UserRepository);
