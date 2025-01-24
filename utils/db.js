const mongoose = require("mongoose");

exports.connectDb = async () => {
  try {
    await mongoose
      .connect(
        "mongodb+srv://admin:obxHIrvo9DfU7Yix@cluster0.6el2dvk.mongodb.net/theHive?retryWrites=true&w=majority"
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
