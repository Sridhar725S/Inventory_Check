const express = require('express');
const router = express.Router();
const Product = require('../models/product.model');
const auth = require('../middleware/auth.middleware');
const checkLowStock = require('../utils/stockAlert');

// Add product 
router.post('/', auth, async (req, res) => {
  try {
    const { itemName,  category, qty, rate, minQty, batch, place } = req.body;
    const product = new Product({ itemName, category, qty, rate, minQty,  batch, place });
    await product.save();
    // fire & forget low-stock alert
    checkLowStock(product).catch(err => console.error('Low-stock email error:', err));// ✅ alert if low stock

    res.json(product);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all products
router.get('/', auth, async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// ➡️ Update product
router.put('/:id', auth, async (req, res) => {
  try {
    const { itemName, category, qty, rate, minQty, batch, place } = req.body;

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { itemName, category, qty, rate, minQty, batch, place },
      { new: true } // return updated doc
    );

    if (!updated) return res.status(404).json({ error: 'Product not found' });

     // fire & forget low-stock alert
    checkLowStock(updated).catch(err => console.error('Low-stock email error:', err));
 // ✅ alert if low stock

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➡️ Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/by-code/:code', auth, async (req, res) => {
  try {
    const product = await Product.findOne({ code: req.params.code });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
