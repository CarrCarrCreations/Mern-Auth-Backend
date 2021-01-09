const router = require("express").Router();
const AuthService = require("../../auth");

router.post("/register", async (req, res, next) => {
  try {
    let { service, email, password, passwordCheck, displayName } = req.body;

    const registeredUser = await AuthService.register(service, {
      email,
      password,
      passwordCheck,
      displayName,
    });

    res.status(200).json(registeredUser);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
