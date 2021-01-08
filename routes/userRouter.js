const router = require("express").Router();
const auth = require("../middleware/auth");
const { findUser } = require("../service/UserService");

// Return the logged in user
router.get("/", auth, async (req, res) => {
  try {
    const user = await findUser(req.user.id);
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Create new User
router.post("/", auth, async (req, res) => {});

module.exports = router;
