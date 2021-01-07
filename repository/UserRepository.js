const User = require("./models/userModel");

const findUserByEmail = async (email) => {
  const user = await User.findOne(
    {
      email: email,
    },
    (err, res) => {
      if (err) throw err.message;
      return res;
    }
  );

  return user;
};

const createUserWithEmail = async (email) => {
  const newUser = new User({
    email,
  });

  return await newUser.save();
};

module.exports = {
  findUserByEmail,
  createUserWithEmail,
};
