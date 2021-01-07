const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const User = require("../repository/models/userModel");
const RefreshToken = require("../repository/models/refreshTokenModel");
const { register, login } = require("../service/AuthService");

router.post("/register", async (req, res) => {
  try {
    let { email, password, passwordCheck, displayName } = req.body;

    const registeredUser = await register(
      "native",
      email,
      password,
      passwordCheck,
      displayName
    );

    res.status(200).json(registeredUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await login("native", req.body.email, req.body.password);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.delete("/delete", auth, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user.id);
    res.json(deletedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/token", async (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);

  var userId = jwt.decode(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET)
    .id;

  // Check if refresh token actually exists otherwise throw unauthorized error
  // DB contains only active refresh tokens
  const matchedToken = await RefreshToken.findOne({
    uid: userId,
    refreshToken,
  });

  if (matchedToken) {
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET,
      (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = generateAccessToken(user.id);
        res.json(accessToken);
      }
    );
  } else return res.sendStatus(401);
});

router.post("/logout", auth, async (req, res) => {
  // Delete all refresh tokens for the user in the DB
  await RefreshToken.deleteMany({ uid: req.user.id }, (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

router.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    // If no token exists, return false
    if (!token) return res.json(false);

    // If token cannot be verified against JWT_SECRET return false
    const verified = jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);
    if (!verified) return res.json(false);

    // Verify that the userId exists in DB given in the JWT token
    const user = await User.findById(verified.id);
    if (!user) return res.json(false);

    return res.json(true);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/accessTokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    // If no token exists, return false
    if (!token) return res.json(false);

    // If token cannot be verified against JWT_SECRET return false
    const verified = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    if (!verified) return res.json(false);

    // Verify that the userId exists in DB given in the JWT token

    const user = await User.findById(verified.id);
    if (!user) return res.json(false);

    return res.json(true);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
