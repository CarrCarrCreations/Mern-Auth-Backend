const RefreshToken = require("../model/refreshTokenModel");
const RefreshTokenRepositoryImpl = require("../repo/RefreshTokenRepositoryImpl");

const generateRefreshToken = (uid, refreshToken) => {
  return new RefreshToken({
    uid,
    refreshToken: refreshToken,
  });
};

module.exports = RefreshTokenRepositoryImpl(RefreshToken, generateRefreshToken);
