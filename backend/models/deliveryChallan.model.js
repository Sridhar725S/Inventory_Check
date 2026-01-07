const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema({
  year: { type: Number, required: true, unique: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model("ChallanCounter", CounterSchema);

const DeliveryChallanSchema = new mongoose.Schema(
  {
    challanNo: { type: String, required: true, unique: true },
    date: { type: Date, required: true },

    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],

    footer: {
      authorizedBy: { type: String },
      receivedBy: { type: String },
    },
  },
  { timestamps: true }
);

// Auto-generate challanNo safely
DeliveryChallanSchema.pre("validate", async function (next) {
  if (this.isNew && !this.challanNo) {
    const year = new Date().getFullYear();

    // find counter for this year and increment atomically
    const counter = await Counter.findOneAndUpdate(
      { year },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.challanNo = `CH-${year}-${String(counter.seq).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("DeliveryChallan", DeliveryChallanSchema);
