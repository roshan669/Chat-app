const User = require("../model/userModel");
const bcrypt = require("bcrypt");

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });

    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });

    const emailCheck = await User.findOne({ email });

    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    delete user.password;
    return res.json({ msg: "User created", status: true, user });
  } catch (err) {
    next(err);
  }
};
module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.json({ msg: "Incorrect username ", status: false });

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      return res.json({ msg: "Incorrect  password", status: false });
    delete user.password;
    return res.json({ status: true, user });
  } catch (err) {
    next(err);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};

module.exports.logout = (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};

module.exports.getOnlineUsers = async (req, res, next) => {
  try {
    const allUserIds = Array.from(global.onlineUsers.keys());

    // If there are fewer than 10 online users,
    // return all of them without random selection
    if (allUserIds.length <= 10) {
      const onlineUsersData = await User.find({
        _id: { $in: allUserIds },
        _id: { $ne: req.params.id },
      }).select(["email", "username", "avatarImage", "_id"]);
      return res.json(onlineUsersData);
    }

    // Randomly select 10 user IDs
    const randomUserIds = getRandomElements(allUserIds, 10);

    const onlineUsersData = await User.find({
      _id: { $in: randomUserIds },
    }).select(["email", "username", "avatarImage", "_id"]);

    res.json(onlineUsersData);
  } catch (ex) {
    next(ex);
  }
};

// Helper function to get random elements from an array
function getRandomElements(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random()); // Create a shuffled copy of the array
  return shuffled.slice(0, count);
}
