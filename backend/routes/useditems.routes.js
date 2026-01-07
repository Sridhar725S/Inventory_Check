const express = require('express');
const router = express.Router();
const UsedItem = require('../models/useditem.model');
const Product = require('../models/product.model');

// Add Used Item
router.post('/', async (req, res) => {
  try {
    const { productId, qty } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const usedItem = new UsedItem({
      product: product._id,
      category: product.category,
      qty
    });
    await usedItem.save();
    res.json(usedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Used Items
router.get('/', async (req, res) => {
  try {
    const items = await UsedItem.find().populate('product', 'itemName');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➡️ Update used item
router.put('/:id', async (req, res) => {
  try {
    const { productId, qty } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const updated = await UsedItem.findByIdAndUpdate(
      req.params.id,
      {
        product: product._id,
        category: product.category,
        qty
      },
      { new: true }
    ).populate('product');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➡️ Delete used item
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await UsedItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Used item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
