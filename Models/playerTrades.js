const mongoose = require('mongoose');

const PlayerTradeSchema = new mongoose.Schema({
  playerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Player', 
    required: true 
  },
  tradeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Trade', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true 
  },
  totalPrice: {
    ingot: Number,
    rs: Number
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending' 
  },
  paymentConfirmed: { 
    type: Boolean, 
    default: false 
  },
  deliveryStatus: { 
    type: String, 
    enum: ['awaiting', 'in-progress', 'delivered'],
    default: 'awaiting'
  }
}, { timestamps: true });

module.exports = mongoose.model('PlayerTrade', PlayerTradeSchema);