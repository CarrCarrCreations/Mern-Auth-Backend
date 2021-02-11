const saveRefreshToken = (generateRefreshToken) => async (
  uid,
  refreshToken
) => {
  const newRt = generateRefreshToken(uid, refreshToken);

  await newRt
    .save()
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

const findByIdAndRefreshToken = (RefreshTokenModel) => async (
  uid,
  refreshToken
) => {
  const token = await RefreshTokenModel.findOne(
    {
      uid,
      refreshToken,
    },
    (error, res) => {
      if (error) throw error;
      return res;
    }
  );

  return token;
};

const deleteAllUserRefreshTokens = (RefreshTokenModel) => async (uid) => {
  // Delete all refresh tokens for the user in the DB
  return await RefreshTokenModel.deleteMany({ uid: uid }, (error, res) => {
    if (error) throw err.message;
    return res;
  });
};

module.exports = (RefreshTokenModel, generateRefreshToken) => {
  return {
    saveRefreshToken: saveRefreshToken(generateRefreshToken),
    findByIdAndRefreshToken: findByIdAndRefreshToken(RefreshTokenModel),
    deleteAllUserRefreshTokens: deleteAllUserRefreshTokens(RefreshTokenModel),
  };
};
