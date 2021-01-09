const router = require("express").Router();
const AuthService = require("..");

router.post("/register", async (req, res, next) => {
  try {
    let { service, email, password, passwordCheck, displayName } = req.body;

    const registeredUserResponse = await AuthService.register(service, {
      email,
      password,
      passwordCheck,
      displayName,
    });

    res.status(200).json(registeredUserResponse);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
