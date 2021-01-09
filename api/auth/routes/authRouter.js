const router = require("express").Router();
const AuthService = require("../../auth");

router.post("/register", async (req, res) => {
  try {
    let { email, password, passwordCheck, displayName } = req.body;

    const registeredUser = await AuthService.register("native", {
      email,
      password,
      passwordCheck,
      displayName,
    });

    res.status(200).json(registeredUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
