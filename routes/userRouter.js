const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const User = require("../models/userModel");

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
    const passwordHash = await bcrypt.hash(password, salt);

    //Save the user
    const newUser = new User({
      email,
      password: passwordHash,
      displayName,
    });
    const savedUser = await newUser.save();

    res.json(savedUser);
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

    // Create JWT. Store the UserID in the JWT to be used later
    // and include a secret password that only the developer knows
    // to verify that this token was not modified
    const access_token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_ACCESS_TOKEN_SECRET
    );

    res.json({
      access_token,
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

router.post("/tokenIsValid", async (req, res) => {
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

// Since we are using auth, we can get the userId from req.user
// This is how you get all information from the DB based on the currently
// logged in user
router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({
    id: user._id,
    displayName: user.displayName,
  });
});

module.exports = router;
