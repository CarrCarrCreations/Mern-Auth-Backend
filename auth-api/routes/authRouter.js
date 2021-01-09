const router = require("express").Router();
const auth = require("../../middleware/auth");
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

router.post("/login", async (req, res) => {
  try {
    let { service, email, password } = req.body;
    const user = await AuthService.loginUser(service, { email, password });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

router.get("/user", auth, async (req, res, next) => {
  try {
    const user = await AuthService.findUserById(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
