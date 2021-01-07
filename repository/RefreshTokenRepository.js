const RefreshToken = require("./models/refreshTokenModel");

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

const findByIdAndRefreshToken = async (uid, refreshToken) => {
  const token = await RefreshToken.findOne(
    {
      uid,
      refreshToken,
    },
    (err, res) => {
      if (err) throw err.message;
      return res;
    }
  );

  return token;
};

const deleteAllUserRefreshTokens = async (uid) => {
  // Delete all refresh tokens for the user in the DB
  return await RefreshToken.deleteMany({ uid: uid }, (err, res) => {
    if (err) throw err.message;
    return res;
  });
};

module.exports = {
  saveRefreshToken,
  findByIdAndRefreshToken,
  deleteAllUserRefreshTokens,
};
