const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  qty: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  lineTotal: { type: Number, required: true, min: 0 } // qty * price
});

const quotationSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, default: "" },

  items: { type: [quotationItemSchema], default: [] },
  subtotal: { type: Number, required: true, min: 0 },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  discountAmount: { type: Number, required: true, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 },

  quotationNo: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },

  notes: { type: String, default: "" },
  validityDays: { type: Number, default: 30 }
});

module.exports = mongoose.model('Quotation', quotationSchema);
