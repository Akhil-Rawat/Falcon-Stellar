const mongoose = require("mongoose");

const pendingPayoutSchema = new mongoose.Schema(
  {
    apiOwnerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("PendingPayout", pendingPayoutSchema);
