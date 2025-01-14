const {
  addMessage,
  getMessages,
  getNewMessage,
} = require("../controllers/messageController");
const router = require("express").Router();

router.post("/addmsg/", addMessage);
router.post("/getmsg/", getMessages);
router.post("/getnewmsg", getNewMessages);

module.exports = router;
