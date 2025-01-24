const mongoose = require("mongoose");

exports.connectDb = async () => {
  try {
    await mongoose
      .connect(
        "mongodb+srv://zain114567:50I3VPy4fzcsA9t9@myprojects.ztxj7e9.mongodb.net/thehive?retryWrites=true&w=majority"
      )
      .then(() => {
        console.log("db is conncted");
      })
      .catch((error) => console.log(error));
  } catch (error) {
    console.log(error);
    // mongodb://localhost:27017/globalQr
  }
};
