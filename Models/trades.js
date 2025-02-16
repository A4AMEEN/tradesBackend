const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema(
  {
    img: { type: String, required: true }, // Image URL
    itemName: { type: String, required: true }, // Trade item name
    price: {
      ingot: { type: Number, required: true }, // Price in ingots
      rs: { type: Number, required: true } // Price in rupees
    },
    quantity: { type: Number, required: true }, // Available quantity
    offer: { type: String, default: '' }, // Offer details (if any)
    stockOut: { type: Boolean, default: false } // Stock availability (true = out of stock)
  },
  { timestamps: true } // Auto adds createdAt and updatedAt
);

module.exports = mongoose.model('Trade', TradeSchema);
