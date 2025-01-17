const {
  register,
  login,
  setAvatar,
  getAllUsers,
  logout,
  getOnlineUsers,
} = require("../controllers/userController");

const router = require("express").Router();

router.post("/register", register);
router.post("/login", login);
router.post("/setAvatar/:id", setAvatar);
router.get("/allusers/:id", getAllUsers);
router.get("/logout/:id", logout);
router.get("/getonlineusers/:id", getOnlineUsers);

module.exports = router;
