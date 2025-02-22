const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    totalTrades: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    trades: [
      {
        tradeId: { type: String, required: true },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Player', PlayerSchema);
