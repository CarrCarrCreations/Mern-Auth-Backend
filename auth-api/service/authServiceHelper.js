const validateRequest = (service, user) => {
  const { email, password, passwordCheck } = user;

  switch (service) {
    case "google": {
      if (!email) {
        return { valid: false, message: "Not all fields have been entered" };
      }
    }
    case "native": {
      if (!email || !password || !passwordCheck) {
        return { valid: false, message: "Not all fields have been entered" };
      }

      if (password.length < 5) {
        return {
          valid: false,
          message: "The password needs to be at least 5 characters long",
        };
      }

      if (password != passwordCheck) {
        return {
          valid: false,
          message: "Enter the same password twice for verification",
        };
      }
      break;
    }
    default: {
      return {
        valid: false,
        message: "Registering service requested does not exist",
      };
    }
  }

  return { valid: true, message: "" };
};

module.exports = {
  validateRequest,
};
