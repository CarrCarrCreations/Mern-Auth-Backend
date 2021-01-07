import {findUserById} from "../repository/UserRepository"

const findUserById = (id) => {
    const user = await findById(id);
    if(!user) throw "No user found for given ID"
    return {
        id: user._id,
        displayName: user.displayName,
      }
};

module.exports = {
  findUserById,
};
