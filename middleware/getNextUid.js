const Counter = require("../models/Counter");

async function getNextUid() {
  const counter = await Counter.findByIdAndUpdate(
    { _id: "userId" },
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true
    }
  );

  return counter.seq;
}

module.exports = getNextUid;
