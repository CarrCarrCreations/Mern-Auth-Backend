const { findUserById } = require("../repository/UserRepository");

const findUser = async (id) => {
  const user = await findUserById(id);
  if (!user) throw "No user found for given ID";
  return {
    id: user._id,
    displayName: user.displayName,
  };
};

module.exports = {
  findUser,
};
