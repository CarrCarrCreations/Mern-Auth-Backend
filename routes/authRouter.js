const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const User = require("../models/userModel");
const RefreshToken = require("../models/refreshTokenModel");

const generateAccessToken = (userID) => {
  return jwt.sign(
    {
      id: userID,
    },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: "50m" }
  );
};

const generateRefreshToken = (userID) => {
  //TODO save the refresh token to a refresh token DB
  return jwt.sign(
    {
      id: userID,
    },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

router.post("/register", async (req, res) => {
  try {
    let { email, password, passwordCheck, displayName } = req.body;

    // Validate
    if (!email || !password || !passwordCheck)
      return res.status(400).json({
        msg: "Not all fields have been entered",
      });

    if (password.length < 5)
      return res.status(400).json({
        msg: "The password needs to be at least 5 characters long",
      });

    if (password != passwordCheck)
      return res.status(400).json({
        msg: "Enter the same password twice for verification",
      });

    const existingUser = await User.findOne({
      email: email,
    });

    if (existingUser)
      return res.status(400).json({
        msg: "An account with this email already exists.",
      });

    if (!displayName) displayName = email;

    // Hash the password, NEVER save pure password in database
    const salt = await bcrypt.genSalt();
    await bcrypt.hash(password, salt, async (err, passwordHash) => {
      if (err) return res.json(err);

      //Save the user
      const newUser = new User({
        email,
        password: passwordHash,
        displayName,
      });

      const savedUser = await newUser.save();
      res.json(savedUser);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password)
      return res.status(400).json({
        msg: "Not all fields have been entered",
      });

    const user = await User.findOne({
      email: email,
    });

    // Check if user exists
    if (!user)
      return res.status(400).json({
        msg: "No account with this email has been registered",
      });

    // Validate correct password is given
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({
        msg: "Invalid Credentials",
      });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const salt = await bcrypt.genSalt();
    const resetTokenHashed = await bcrypt.hash(refreshToken, salt);

    const newRt = new RefreshToken({
      uid: user._id,
      refreshToken: resetTokenHashed,
    });

    const savedRt = await newRt.save();

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        displayName: user.displayName,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
  // DB that contains only refresh tokens
  const matchedTokens = await RefreshToken.find({ uid: userId });

  let matchedCounter = 0;
  matchedTokens.map(async (element) => {
    const response = bcrypt.compare(refreshToken, element.refreshToken);
    if (response) matchedCounter += 1;
  });

  if (matchedCounter > 0) {
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

router.delete("/logout", auth, async (req, res) => {
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
    console.log(err);
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
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
