const router = require("express").Router();
const auth = require("../middleware/auth");
const User = require("../models/userModel");

// Since we are using auth, we can get the userId from req.user.id
// You get all information from the DB based on the currently
// logged in user. It is all saved in req.user
router.post("/", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({
    id: user._id,
    displayName: user.displayName,
  });
});

module.exports = router;
