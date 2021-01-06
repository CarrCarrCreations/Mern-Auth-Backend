const router = require("express").Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");
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
  return jwt.sign(
    {
      id: userID,
    },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

const getGoogleUserInfo = async (access_token) => {
  const { data } = await axios({
    url: "https://www.googleapis.com/oauth2/v2/userinfo",
    method: "get",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  // { id, email, given_name, family_name }
  return data;
};

// Google will reroute users to this route after they login
router.post("/", async (req, res) => {
  // Capture the code used to create google access token
  // This token is needed for future requests for user name, email, etc.
  const code = req.body.code;

  // either login or register
  const redirectLocation = req.body.redirectLocation;

  await axios({
    url: `https://oauth2.googleapis.com/token`,
    method: "post",
    data: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: "http://localhost:3000/google/" + redirectLocation,
      grant_type: "authorization_code",
      code,
    },
  })
    .then(async (response) => {
      const userInfo = await getGoogleUserInfo(response.data.access_token);
      res.json(userInfo);
    })
    .catch((error) => {
      console.log(error.message);
      res.json(error.message);
    });
});

router.post("/login", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate
    if (!email)
      return res.status(400).json({
        msg: "Not all fields have been entered",
      });

    const user = await User.findOne({
      email: email,
    });

    // Check if user exists
    if (!user)
      return res.status(400).json({
        msg: "Account does not exist",
      });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const newRt = new RefreshToken({
      uid: user._id,
      refreshToken: refreshToken,
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

router.post("/register", async (req, res) => {
  try {
    let { email } = req.body;

    // Validate
    if (!email)
      return res.status(400).json({
        msg: "Not all fields have been entered",
      });

    const existingUser = await User.findOne({
      email: email,
    });

    if (existingUser)
      return res.status(400).json({
        msg: "An account with this email already exists.",
      });

    //Save the user
    const newUser = new User({
      email,
    });

    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;