const mongoose = require('mongoose');
const { Schema } = mongoose;

const purchaseSchema = new Schema({
  supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
  invoiceDate: { type: Date, required: true },
  products: [
    { 
      productId: { type: Schema.Types.ObjectId, ref: 'Product' }, 
      itemName: String,
      qty: Number, 
      purchasePrice: Number, 
      sellPrice: Number,
    }
  ],
  totalValue: Number
});

module.exports = mongoose.model('Purchase', purchaseSchema);
