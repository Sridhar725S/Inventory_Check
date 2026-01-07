const express = require('express');
const router = express.Router();
const WastedItem = require('../models/wasteditem.model');
const Product = require('../models/product.model');

// ➡️ Get all wasted items
router.get('/', async (req, res) => {
  try {
    const wastedItems = await WastedItem.find().populate('product');
    res.json(wastedItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➡️ Add wasted item
router.post('/', async (req, res) => {
  try {
    const { productId, wastedQty } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // create wasted entry
    const wastedItem = new WastedItem({
      product: product._id,
      category: product.category,
      wastedQty
    });

    await wastedItem.save();
    res.json(wastedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➡️ Delete wasted item
router.delete('/:id', async (req, res) => {
  try {
    await WastedItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Wasted item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➡️ Update wasted item
router.put('/:id', async (req, res) => {
  try {
    const { productId, wastedQty } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const updated = await WastedItem.findByIdAndUpdate(
      req.params.id,
      {
        product: product._id,
        category: product.category,
        wastedQty,
        date: new Date() 
      },
      { new: true }
    ).populate('product');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ➡️ Get all products for dropdown
router.get('/products/list', async (req, res) => {
  try {
    const products = await Product.find({}, 'itemName category qty');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
