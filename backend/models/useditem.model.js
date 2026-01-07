const mongoose = require('mongoose');
const { Schema } = mongoose;

const usedItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  category: { type: String, required: true },
  qty: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('UsedItem', usedItemSchema);
