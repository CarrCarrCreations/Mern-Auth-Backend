const RefreshToken = require("../models/refreshTokenModel");

const saveRefreshToken = async (uid, refreshToken) => {
  const newRt = new RefreshToken({
    uid,
    refreshToken: refreshToken,
  });

  await newRt
    .save()
    .then((response) => response)
    .catch((err) => {
      throw err.message;
    });
};

module.exports = {
  saveRefreshToken,
};
