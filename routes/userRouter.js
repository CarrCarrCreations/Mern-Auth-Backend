const router = require("express").Router();
const auth = require("../middleware/auth");
const findUser = require("../service/UserService");

// Auth middleware saves logged in users data to req.user
router.post("/", auth, async (req, res) => {
  try {
    const user = await findUser(req.user.id);
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json();
  }
});

module.exports = router;
