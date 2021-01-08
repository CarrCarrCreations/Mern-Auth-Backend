const User = require("./models/userModel");

const findUserById = async (id) => {
  const user = await User.findById(id, (err, res) => {
    if (err) throw err.message;
    return res;
  });

  return user;
};

const findUserByEmail = async (email) => {
  const user = await User.findOne({
    email: email,
  })
    .exec()
    .then((res) => {
      return res;
    })
    .catch((error) => {
      throw error;
    });

  return user;
};

const createUserWithEmail = async (email) => {
  const newUser = new User({
    email,
  });

  return await newUser.save();
};

const createNativeUser = async (email, passwordHash) => {
  //Save the user
  const newUser = new User({
    email,
    password: passwordHash,
  });

  const savedUser = await newUser.save((err, res) => {
    if (err) throw err.message;
    return res;
  });

  return savedUser;
};

const findByIdAndDelete = async (uid) => {
  const deletedUser = await User.findByIdAndDelete(uid, (err, res) => {
    if (err) throw err.message;
    return res;
  });
  return deletedUser;
};

module.exports = {
  findUserById,
  findUserByEmail,
  createUserWithEmail,
  createNativeUser,
  findByIdAndDelete,
};
