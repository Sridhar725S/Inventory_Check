const express = require("express");
const router = express.Router();
const Quotation = require("../models/quotation.model");
const Product = require("../models/product.model");
const auth = require("../middleware/auth.middleware");

// Compute totals
function computeTotals(items, discountPercent = 0) {
  const safeItems = (items || []).map(it => {
    const qty = Number(it.qty || 0);
    const price = Number(it.price || 0);
    const lineTotal = +(qty * price).toFixed(2);
    return { product: it.product, qty, price, lineTotal };
  });

  const subtotal = +safeItems.reduce((sum, it) => sum + it.lineTotal, 0).toFixed(2);
  const discountAmount = +((subtotal * (discountPercent || 0)) / 100).toFixed(2);
  const grandTotal = +(subtotal - discountAmount).toFixed(2);

  return { items: safeItems, subtotal, discountPercent, discountAmount, grandTotal };
}

function genQuotationNo() {
  const y = new Date().getFullYear().toString().slice(-2);
  return `QTN-${y}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

// CREATE
router.post("/", auth, async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, items, discountPercent, notes, validityDays } = req.body;

    // validate products
    const productIds = (items || []).map(i => i.product);
    const products = await Product.find({ _id: { $in: productIds } }).select("_id");
    const existing = new Set(products.map(p => String(p._id)));
    for (const it of items || []) {
      if (!existing.has(String(it.product))) {
        return res.status(400).json({ error: "Invalid product in items" });
      }
    }

    const totals = computeTotals(items, discountPercent);

    const quotation = new Quotation({
      customerName,
      customerEmail,
      customerPhone,
      items: totals.items,
      subtotal: totals.subtotal,
      discountPercent: totals.discountPercent,
      discountAmount: totals.discountAmount,
      grandTotal: totals.grandTotal,
      quotationNo: genQuotationNo(),
      notes: notes || "",
      validityDays: Number(validityDays || 30),
    });

    await quotation.save();
    const populated = await Quotation.findById(quotation._id).populate("items.product", "itemName code price");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LIST
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const filter = search
      ? { $or: [{ customerName: new RegExp(search, "i") }, { customerEmail: new RegExp(search, "i") }] }
      : {};

    const [items, total] = await Promise.all([
      Quotation.find(filter)
        .populate("items.product", "itemName code price")
        .sort({ date: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      Quotation.countDocuments(filter),
    ]);

    res.json({ quotations: items, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET BY ID
router.get("/:id", auth, async (req, res) => {
  try {
    const q = await Quotation.findById(req.params.id).populate("items.product", "itemName code price");
    if (!q) return res.status(404).json({ error: "Quotation not found" });
    res.json(q);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put("/:id", auth, async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, items, discountPercent, notes, validityDays } = req.body;

    const totals = computeTotals(items, discountPercent);

    const updated = await Quotation.findByIdAndUpdate(
      req.params.id,
      {
        customerName,
        customerEmail,
        customerPhone,
        items: totals.items,
        subtotal: totals.subtotal,
        discountPercent: totals.discountPercent,
        discountAmount: totals.discountAmount,
        grandTotal: totals.grandTotal,
        notes: notes || "",
        validityDays: Number(validityDays || 30),
      },
      { new: true }
    ).populate("items.product", "itemName code price");

    if (!updated) return res.status(404).json({ error: "Quotation not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Quotation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Quotation not found" });
    res.json({ message: "Quotation deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
