require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
app.use(cors({
  origin: process.env.ORIGIN_URI,
  credentials: true
}));

app.use(bodyParser.json());
app.use('/static', express.static('public'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/purchases', require('./routes/purchase.routes'));
app.use('/api/invoices', require('./routes/invoice.routes'));
app.use('/api/useditems', require('./routes/useditems.routes'));
app.use('/api/wasteditems', require('./routes/wasteditems.routes'));
app.use('/api/suppliers', require('./routes/supplier.routes'));
app.use('/api/quotations', require('./routes/quotation.routes'));
app.use("/api/challans", require('./routes/deliveryChallan.routes'));

// ✅ Serve Angular frontend (dist folder)
app.use(express.static(path.join(__dirname, '../frontend/dist/frontend/browser')));

// Handle Angular routes
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/frontend/browser/index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
