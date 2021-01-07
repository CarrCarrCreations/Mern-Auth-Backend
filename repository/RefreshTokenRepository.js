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

module.exports = {
  saveRefreshToken,
  findByIdAndRefreshToken,
};
