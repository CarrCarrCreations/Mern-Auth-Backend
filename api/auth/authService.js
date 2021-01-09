const findUser = (UserRepository) => async (id) => {
  const user = await UserRepository.findUserById(id, (err, res) => {
    if (err) throw err.message;
    return res;
  });

  return user;
};

module.exports = (UserRepository) => {
  return {
    findUser: findUser(UserRepository)(id),
  };
};
