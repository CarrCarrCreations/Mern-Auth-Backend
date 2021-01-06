const router = require("express").Router();
const axios = require("axios");

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

router.get("/callback", (req, res) => {});

module.exports = router;
