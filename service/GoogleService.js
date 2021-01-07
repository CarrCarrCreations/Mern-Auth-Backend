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

const getGoogleAccessToken = async (code, redirectLocation) => {
  return await axios({
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
      return response.data.access_token;
    })
    .catch((err) => {
      console.log(err);
      throw err.message;
    });
};

module.exports = {
  getGoogleUserInfo,
  getGoogleAccessToken,
};
