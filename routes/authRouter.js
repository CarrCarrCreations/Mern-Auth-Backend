const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  register,
  login,
  deleteUser,
  logout,
  refreshAccessToken,
  refreshTokenIsValid,
  accessTokenIsValid,
} = require("../service/AuthService");

router.post("/register", async (req, res) => {
  try {
    let { email, password, passwordCheck, displayName } = req.body;

    const registeredUser = await register("native", {
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

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    const user = await login("native", email, password);

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.delete("/delete", auth, async (req, res) => {
  try {
    const deletedUser = await deleteUser(req.user.id);
    res.json(deletedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/token", async (req, res) => {
  try {
    const accessToken = await refreshAccessToken(req.body.token);

    return res.status(200).json(accessToken);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/logout", auth, async (req, res) => {
  try {
    const logoutResponse = await logout(req.user.id);

    res.status(200).json(logoutResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/tokenIsValid", async (req, res) => {
  try {
    const valid = await refreshTokenIsValid(req.header("x-auth-token"));

    return res.status(200).json(valid);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/accessTokenIsValid", async (req, res) => {
  try {
    const valid = await accessTokenIsValid(req.header("x-auth-token"));

    return res.status(200).json(valid);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
