const Messages = require("../model/messageModel");

module.exports.getMessages = async (req, res, next) => {
try {
    const { from, to, limit = 10, before } = req.body;

    const query = {
      users: { $all: [from, to] },
    };

    if (before) {
      query.updatedAt = { $lt: new Date(before) }; // Filter messages before the specified timestamp
    }

    const messages = await Message.find(query)
      .sort({ updatedAt: -1 }) // Sort by descending updatedAt
      .limit(limit); // Limit the number of messages

    res.json(messages);
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

