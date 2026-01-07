const mongoose = require('mongoose');
const { Schema } = mongoose;

const wastedItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  category: { type: String, required: true },
  wastedQty: { type: Number, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('WastedItem', wastedItemSchema);
