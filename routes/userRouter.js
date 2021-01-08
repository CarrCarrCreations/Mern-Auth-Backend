const router = require("express").Router();
const auth = require("../middleware/auth");
const { findUser, createUser } = require("../service/UserService");

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
router.post("/", auth, async (req, res) => {
  let { service, email, password, passwordCheck, displayName } = req.body;

  const registeredUser = await createUser(service, {
    email,
    password,
    passwordCheck,
    displayName,
  });

  res.status(200).json(registeredUser);
});

module.exports = router;
