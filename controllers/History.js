const History = require("../models/History");

exports.getHistory = async (req, res) => {
  try {
    const { telegramId } = req.params;
    if (!telegramId) {
      res.status(400).json({ message: "telegram uid is required" });
    }

    const historyData = await History.aggregate([
      {
        $match: { refererId: telegramId }  
      },
      {
        $lookup: {
          from: 'users',           
          localField: 'userId',    
          foreignField: 'telegramId',  
          as: 'userDetails'
        }
      }
    ]);

    if (!historyData) {
      res.status(200).json({ data: [], message: "data not found" });
    }

    res
      .status(200)
      .json({ data: historyData, message: "data found successfuly" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ data: historyData, message: "Something went wrong" });
  }
};
