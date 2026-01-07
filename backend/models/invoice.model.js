const mongoose = require('mongoose');
const { Schema } = mongoose;

const invoiceSchema = new Schema({
  name: String,
  college: String,
  year: String,
  email: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['paid','pending','cancelled'], default: 'pending' },
  phone: String,
  products: [
    { 
      productId: { type: Schema.Types.ObjectId, ref: 'Product' }, 
      itemName: String,
      qty: Number, 
      rate: Number, 
      gst: Number,
      totalValue: Number,
    }
  ],
  totalInvoiceValue: Number
}, { timestamps: true });



module.exports = mongoose.model('Invoice', invoiceSchema);
