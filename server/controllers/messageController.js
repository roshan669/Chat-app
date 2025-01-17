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
      timestamp: msg.updatedAt.toString(),
    }));

    res.json(projectedMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch messages" });
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

module.exports.getNewMessage = async (req, res, next) => {
  try {
    const { to } = req.body;

    const query = {
      users: { $all: [to] },
    };

    const lastMessage = await Messages.findOne(
      {
        users: { $all: [to] }, // Ensure both users are involved
        sender: to, // Filter for messages sent by 'to'
      },
      { sort: { updatedAt: -1 } }
    ); // Sort by descending updatedAt (latest first)

    // Initialize the 'updatedAt' date based on the last message
    let after = null;
    if (lastMessage) {
      after = lastMessage.updatedAt; // Use the updatedAt of the last message
    }

    if (after) {
      query.updatedAt = { $gt: new Date(after) }; // Filter messages before the specified timestamp
    }

    const messages = await Messages.find(query).sort({ updatedAt: -1 }); // Sort by descending updatedAt (latest first)

    const projectedMessages = messages.map((msg) => ({
      id: msg._id.toString(),
      message: msg.message.text,
      timestamp: msg.updatedAt.toString(),
    }));

    res.json(projectedMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

const Messages = require("../models/messageModel");

module.exports.deleteMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    // Convert from and to to ObjectIds if they are strings
    const fromObjectId = mongoose.Types.ObjectId.isValid(from)
      ? new mongoose.Types.ObjectId(from)
      : null;
    const toObjectId = mongoose.Types.ObjectId.isValid(to)
      ? new mongoose.Types.ObjectId(to)
      : null;
    if (!fromObjectId || !toObjectId) {
      return res.status(400).json({ message: "Invalid user IDs" });
    }

    const data = await Messages.deleteMany({
      $or: [
        { sender: fromObjectId, users: { $all: [fromObjectId, toObjectId] } },
      ],
    });

    if (data.deletedCount > 0) {
      res.status(200).json({ message: "Messages deleted successfully." });
    } else {
      res.status(404).json({ message: "No messages found to delete." }); // Or 404
    }
  } catch (error) {
    next(error);
  }
};
