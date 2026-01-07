const express = require('express');
const router = express.Router();
const Invoice = require('../models/invoice.model');
const Product = require('../models/product.model');
const auth = require('../middleware/auth.middleware');
const { sendInvoiceEmail } = require('../utils/mailer');
const checkLowStock = require('../utils/stockAlert'); 

router.post('/', auth, async (req, res) => {
  try {
    const { name, college, year, phone, email, products, status } = req.body;
    let totalInvoiceValue = 0;
    const alertPromises = []; // store all low-stock alert promises

    for (let p of products) {
      const prod = await Product.findById(p.productId);
      if (prod) {
        if (p.qty > prod.qty) {
          return res.status(400).json({ error: `Not enough stock for ${prod.itemName}` });
        }
        prod.qty -= p.qty;
        await prod.save();
        // 🔥 fire alert asynchronously, don't await
        alertPromises.push(checkLowStock(prod));

        
      }
      const baseValue = p.qty * p.rate;
const gstAmount = baseValue * 0.18; // 18% GST
p.gst = gstAmount;
      p.totalValue = baseValue + gstAmount;
      totalInvoiceValue += p.totalValue;
    }

    const invoice = new Invoice({
      name, college, year, phone, email, status, products, totalInvoiceValue
    });

    await invoice.save();

    // ✅ Send email
    if (email) {
  sendInvoiceEmail(email, invoice)
    .then(() => console.log('Invoice email sent to', email))
    .catch(err => console.error('Email send failed:', err));
}

res.json(invoice); // return immediately 🚀

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// GET all invoices
router.get('/', auth, async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update invoice
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, college, year, phone, email, products, status } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    // ✅ Revert old product quantities
    for (let old of invoice.products) {
      const prod = await Product.findById(old.productId);
      if (prod) {
        prod.qty += old.qty; // add back old qty
        await prod.save();
      }
    }

    // ✅ Update totals with new products
    let totalInvoiceValue = 0;
    for (let p of products) {
      const prod = await Product.findById(p.productId);
      if (prod) {
        prod.qty -= p.qty;
        await prod.save();
      }
      const baseValue = p.qty * p.rate;
const gstAmount = baseValue * 0.18; // 18% GST
p.gst = gstAmount;
      p.totalValue = baseValue + gstAmount;
      totalInvoiceValue += p.totalValue;
    }

    // ✅ Update invoice fields
    invoice.name = name;
    invoice.college = college;
    invoice.year = year;
    invoice.phone = phone;
    invoice.email = email;
    invoice.status = status;
    invoice.products = products;
    invoice.totalInvoiceValue = totalInvoiceValue;

    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE invoice
router.delete('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    // ✅ Revert product qty when deleting
    for (let p of invoice.products) {
      const prod = await Product.findById(p.productId);
      if (prod) {
        prod.qty += p.qty;
        await prod.save();
      }
    }

    await invoice.deleteOne();
    res.json({ message: 'Invoice deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
