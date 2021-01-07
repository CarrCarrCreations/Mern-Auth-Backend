const router = require("express").Router();
const axios = require("axios");
const User = require("../models/userModel");
const { login, register } = require("./commonFunctions");

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
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
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
