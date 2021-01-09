const findUserById = (UserRepository) => async (id) => {
  const user = await UserRepository.findUserById(id, (err, res) => {
    if (err) throw err.message;
    return res;
  });

  return user;
};

const registerUser = (UserRepository) => (service, user) => {
  try {
    const {valid, messages} = validateRequest(service, user);
    if(!valid) throw messages

    const userExists = await UserRepository.findUserByEmail(email);
    if (userExists) throw "An account with this email already exists.";

    const savedUser = saveUser(service, user)
    return savedUser 

  } catch (error) {
    throw error;
  }
};

const validateRequest = (service, user) => {
  const { email, password, passwordCheck } = user;

  let valid = true;
  let messages = [];

  switch (service) {
    case "google": {
      if (!email)  {
        valid = false 
        messages.push("Not all fields have been entered");
        break;
      }
    }
    case "native": {
      if (!email || !password || !passwordCheck){
        valid = false
        messages.push("Not all fields have been entered")
        break;
      }

      if (password.length < 5)
      {
        valid = false
        messages.push("The password needs to be at least 5 characters long")
        break;
      }

      if (password != passwordCheck){
        valid = false
        messages.push("Enter the same password twice for verification")
        break;
      }
    }
    default: {
      valid = false
      message.push("Registering service requested does not exist")
      break;
    }
  }

  return ({valid, message})
};

const saveUser = (service, user) => {
  const { email, password } = user;

  switch (service) {
    case "google": {
      const savedUser = await createUserWithEmail(email, (err, user) => {
        if (err) throw err.message;
        return user;
      });

      return savedUser;
    }
    case "native": {
      // Hash the password, NEVER save pure password in database
      const salt = await bcrypt.genSalt();
      savedUser = await bcrypt.hash(
        password,
        salt,
        async (err, passwordHash) => {
          if (err) {
            throw err.message;
          }

          const nativeUser = createNativeUser(email, passwordHash);
          return nativeUser;
        }
      );
      return savedUser;
    }
    default: {
      throw "Register service requested does not request";
    }
  }
}

module.exports = (UserRepository) => {
  return {
    findUser: findUserById(UserRepository)(id),
    register: registerUser(UserRepository)(service, user),
  };
};
