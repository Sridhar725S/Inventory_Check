const mongoose = require('mongoose');
const { Schema } = mongoose;

const supplierSchema = new Schema({
  name: { type: String, required: true },
  contact: String,
  address: String,
  gstNo: String
});

module.exports = mongoose.model('Supplier', supplierSchema);
