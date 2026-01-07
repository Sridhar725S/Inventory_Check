const express = require('express');
const router = express.Router();
const Purchase = require('../models/purchase.model');
const Product = require('../models/product.model');
const Supplier = require('../models/supplier.model'); // add supplier model
const auth = require('../middleware/auth.middleware');
const checkLowStock  = require('../utils/stockAlert'); // create utils/stockAlert.js


// POST: create new purchase
router.post('/', auth, async (req, res) => {
  try {
    const { supplierId, invoiceDate, products } = req.body;
    let totalValue = 0;

    for (let p of products) {
      const prod = await Product.findById(p.productId);
      if (prod) {
        prod.history.push({
          date: new Date(),
          oldRate: prod.rate,
          newRate: p.sellPrice,
          changeReason: 'Purchase'
        });
        prod.qty += p.qty;
        await prod.save();

         // 🔥 Fire low stock alert asynchronously
    checkLowStock(prod).catch(err => console.error('Stock alert failed:', err));
      }
      totalValue += p.purchasePrice * p.qty;
    }

    const purchase = new Purchase({ supplierId, invoiceDate, products, totalValue });
    await purchase.save();
    res.json(purchase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all purchases
router.get('/', auth, async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('supplierId', 'name contact') // populate supplier info
      .populate('products.productId', 'itemName rate') // populate product info
      .sort({ createdAt: -1 });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➡️ Update purchase
router.put('/:id', auth, async (req, res) => {
  try {
    const { supplierId, invoiceDate, products } = req.body;

    // Find the old purchase
    const oldPurchase = await Purchase.findById(req.params.id);
    if (!oldPurchase) return res.status(404).json({ error: 'Purchase not found' });

    // Rollback old product quantities
    for (let old of oldPurchase.products) {
      const prod = await Product.findById(old.productId);
      if (prod) {
        prod.qty -= old.qty; // subtract the previously added stock
        await prod.save();
      }
    }

    // Apply new product quantities
    let totalValue = 0;
    for (let p of products) {
      const prod = await Product.findById(p.productId);
      if (prod) {
        prod.history.push({
          date: new Date(),
          oldRate: prod.rate,
          newRate: p.sellPrice,
          changeReason: 'Purchase Update'
        });
        prod.qty += p.qty;
        await prod.save();
        // 🔥 Fire low stock alert asynchronously
    checkLowStock(prod).catch(err => console.error('Stock alert failed:', err));
      }
      totalValue += p.purchasePrice * p.qty;
    }

    // Save updated purchase
    const updated = await Purchase.findByIdAndUpdate(
      req.params.id,
      { supplierId, invoiceDate, products, totalValue },
      { new: true }
    )
      .populate('supplierId', 'name')
      .populate('products.productId', 'itemName');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ➡️ Delete purchase
router.delete('/:id', auth, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ error: 'Purchase not found' });

    // Rollback product quantities
    for (let p of purchase.products) {
      const prod = await Product.findById(p.productId);
      if (prod) {
        prod.qty -= p.qty; // remove stock that was added
        await prod.save();
      }
    }

    await Purchase.findByIdAndDelete(req.params.id);
    res.json({ message: 'Purchase deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// GET: fetch all suppliers (for purchase dropdown)
router.get('/supplier', auth, async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 }); // sorted alphabetically
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: create a new supplier (inline from purchase form)
router.post('/supplier', auth, async (req, res) => {
  try {
    const { name, contact, address, gstNo } = req.body;
    const supplier = new Supplier({ name, contact, address, gstNo });
    await supplier.save();
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
