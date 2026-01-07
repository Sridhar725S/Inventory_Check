const express = require('express');
const router = express.Router();
const Supplier = require('../models/supplier.model');

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// Add supplier
router.post('/', async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.json(supplier);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add supplier' });
  }
});

// Update supplier
router.put('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(supplier);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update supplier' });
  }
});

// Delete supplier
router.delete('/:id', async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Supplier deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete supplier' });
  }
});

module.exports = router;
