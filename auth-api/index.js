const UserRepository = require("./database/repo/UserRepository");
const RefreshTokenRepository = require("./database/repo/RefreshTokenRepository");
const AuthServiceImpl = require("./service/authServiceImpl");

module.exports = AuthServiceImpl(UserRepository, RefreshTokenRepository);
