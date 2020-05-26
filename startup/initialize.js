const winston = require("winston");
const { User } = require("../models/user");
const bcrypt = require("bcrypt");

module.exports = async function () {
  const usersCount = await User.countDocuments();
  if (usersCount > 0) return;

  user = new User({ username: "admin", password: "admin", isAdmin: true });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  winston.info("Initial user created.");
  winston.info("user: admin, password: admin");
};
