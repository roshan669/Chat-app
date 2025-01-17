const {
  addMessage,
  getMessages,
  getNewMessage,
  deleteMessages,
} = require("../controllers/messageController");
const router = require("express").Router();

router.post("/addmsg/", addMessage);
router.post("/getmsg/", getMessages);
router.post("/getnewmsg", getNewMessage);
router.delete("/delmsg", deleteMessages);

module.exports = router;
