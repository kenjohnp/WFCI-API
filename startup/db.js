const mongoose = require("mongoose");

module.exports = function() {
  const db = "mongodb://localhost/wfci";
  mongoose
    .connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    })
    .then(() => console.log("Connected to MongoDB"));
};
