const {
  addMessage,
  getMessages,
  logout,
} = require("../controllers/messageController");
const router = require("express").Router();

router.post("/addmsg/", addMessage);
router.post("/getmsg/", getMessages);
router.post("/getnewmsg", getNewMessages);

module.exports = router;
