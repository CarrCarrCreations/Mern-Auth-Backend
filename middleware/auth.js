const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token)
      return res
        .status(401)
        .json({ msg: "No authentication token, access denied." });

    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
      if (err)
        return res
          .status(401)
          .json({ msg: "Token verification failed, access denied." });

      // Once user has been verified, save their userId into the request and pass it to
      // the end point. req.user will now return the user's id
      // req.user = verified.id;
      req.user = user;
      next();
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = auth;
