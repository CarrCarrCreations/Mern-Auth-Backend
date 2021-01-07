const router = require("express").Router();
const { login, register } = require("../service/AuthService");
const { getGoogleUser } = require("../service/GoogleService");

// Code given by the Google Login Redirect to obtain an access token
// values: login, register
router.post("/", async (req, res) => {
  try {
    const googleUser = await getGoogleUser(
      req.body.code,
      req.body.redirectLocation
    );
    res.status(200).json(googleUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await login(req.body.email);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    const registeredUser = await register(req.body.email);
    res.status(200).json(registeredUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
