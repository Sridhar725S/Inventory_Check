const express = require("express");
const router = express.Router();
const DeliveryChallan = require("../models/deliveryChallan.model");

// CREATE
router.post("/", async (req, res) => {
  try {
    const challan = new DeliveryChallan(req.body);
    await challan.save();
    res.status(201).json(challan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// LIST with search & pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const search = req.query.search || "";

    const query = {
      $or: [
        { challanNo: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } }
      ]
    };

    const total = await DeliveryChallan.countDocuments(query);
    const challans = await DeliveryChallan.find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort({ date: -1 });

    res.json({ total, challans });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single
router.get("/:id", async (req, res) => {
  try {
    const challan = await DeliveryChallan.findById(req.params.id);
    if (!challan) return res.status(404).json({ error: "Not found" });
    res.json(challan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const challan = await DeliveryChallan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(challan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await DeliveryChallan.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;