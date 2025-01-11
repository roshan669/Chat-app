const Messages = require("../model/messageModel");

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to, limit = 15, before } = req.body;

    const query = {
      users: { $all: [from, to] },
    };

    if (before) {
      query.updatedAt = { $lt: new Date(before) }; // Filter messages before the specified timestamp
    }

    const messages = await Messages.find(query)
      .sort({ updatedAt: -1 }) // Sort by descending updatedAt (latest first)
      .limit(limit); 

    const projectedMessages = messages.map((msg) => ({
      id: msg._id.toString(),
      fromSelf: msg.sender.toString() === from,
      message: msg.message.text,
    }));

    res.json(projectedMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};

