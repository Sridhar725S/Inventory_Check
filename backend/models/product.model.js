const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  itemName: { type: String, required: true },
  code: { type: String, unique: true }, // optional for non-zero-stock
  category: { type: String, enum: ['sensor','module','microcontroller'], required: true },
  qty: { type: Number, default: 0 },
  rate: { type: Number, required: true },
  minQty: { type: Number, required: true },
  batch: { type: String },
   place: { type: String },
  history: [
    { date: Date, oldRate: Number, newRate: Number, changeReason: String }
  ]
});
function computeEAN13Checksum(code12) {
  const digits = code12.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }
  const checksum = (10 - (sum % 10)) % 10;
  return checksum;
}

productSchema.pre("save", function(next) {
  if (!this.code) {
    let code12 = Date.now().toString().slice(-10) + Math.floor(Math.random()*100).toString().padStart(2,"0");
    this.code = code12 + computeEAN13Checksum(code12);
  }
  next();
});


module.exports = mongoose.model('Product', productSchema);
