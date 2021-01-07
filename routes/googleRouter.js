const router = require("express").Router();
const { login, register } = require("../service/AuthService");
const {
  getGoogleUserInfo,
  getGoogleAccessToken,
} = require("../service/GoogleService");

router.post("/", async (req, res) => {
  try {
    // Code given by the Google Login Redirect to obtain an access token
    const code = req.body.code;

    // either login or register
    const redirectLocation = req.body.redirectLocation;

    const googleAccessToken = await getGoogleAccessToken(
      code,
      redirectLocation
    );
    const userInfo = await getGoogleUserInfo(googleAccessToken);

    res.status(200).json(userInfo);
  } catch (err) {
    res.status(500).json(err.message);
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
