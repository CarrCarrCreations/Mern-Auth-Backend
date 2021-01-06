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

  const { data } = await axios({
    url: `https://oauth2.googleapis.com/token`,
    method: "post",
    data: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: "http://localhost:3000/google/",
      grant_type: "authorization_code",
      code,
    },
  });

  const userInfo = await getGoogleUserInfo(data.access_token);

  res.json(userInfo);
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

    // const salt = await bcrypt.genSalt();
    // const resetTokenHashed = await bcrypt.hash(refreshToken, salt);

    // console.log(resetTokenHashed);

    // const newRt = new RefreshToken({
    //   uid: user._id,
    //   refreshToken: resetTokenHashed,
    // });

    // const savedRt = await newRt.save();

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

module.exports = router;
