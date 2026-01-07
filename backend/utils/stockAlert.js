const nodemailer = require('nodemailer');
const Supplier = require('../models/supplier.model');
const Purchase = require('../models/purchase.model');
require('dotenv').config();

async function checkLowStock(product) {
  if (product.qty <= product.minQty) {
    // 1️⃣ find purchases with this product
    const purchases = await Purchase.find({ 'products.productId': product._id })
      .sort({ 'products.purchasePrice': 1 }) // sort by purchase price ascending
      .limit(5)
      .lean(); // return plain JS objects

    // 2️⃣ extract supplier IDs and price
    const supplierData = [];
    for (let p of purchases) {
      const prodItem = p.products.find(pr => pr.productId.toString() === product._id.toString());
      if (prodItem) {
        supplierData.push({ supplierId: p.supplierId, price: prodItem.purchasePrice });
      }
    }

    // 3️⃣ fetch supplier details
    const supplierList = await Supplier.find({ _id: { $in: supplierData.map(s => s.supplierId) } })
      .select('name contact')
      .lean();

    // 4️⃣ combine supplier info with price
    const topSuppliers = supplierData.map(s => {
      const supplier = supplierList.find(sup => sup._id.toString() === s.supplierId.toString());
      return supplier ? `${supplier.name} - ₹${s.price} - ${supplier.contact}` : null;
    }).filter(Boolean).join('\n');

    // 5️⃣ email content
    const htmlMessage = `
<h2 style="color: #D32F2F;">⚠️ Low Stock Alert: ${product.itemName}</h2>

<p>Dear Inventory Manager,</p>

<p>The stock for the following product has reached its minimum threshold:</p>

<table style="border-collapse: collapse; width: 100%; margin-top: 10px;">
  <tr style="background-color: #f2f2f2;">
    <th style="border: 1px solid #ddd; padding: 8px;">Product Name</th>
    <th style="border: 1px solid #ddd; padding: 8px;">Product Code</th>
    <th style="border: 1px solid #ddd; padding: 8px;">Current Qty</th>
    <th style="border: 1px solid #ddd; padding: 8px;">Minimum Qty</th>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 8px;">${product.itemName}</td>
    <td style="border: 1px solid #ddd; padding: 8px;">${product.code}</td>
    <td style="border: 1px solid #ddd; padding: 8px; color: #D32F2F;">${product.qty}</td>
    <td style="border: 1px solid #ddd; padding: 8px;">${product.minQty}</td>
  </tr>
</table>

<h3 style="margin-top: 20px;">Top 5 Supplier Suggestions:</h3>
<ul>
  ${topSuppliers.split('\n').map(s => `<li>${s}</li>`).join('')}
</ul>

<p>Please take immediate action to replenish the stock.</p>

<p>Best regards,<br/>
<strong>Inventory Management System</strong></p>

<hr style="border: none; border-top: 1px solid #ccc;">
<small>This is an automated message. Please do not reply directly to this email.</small>
`;


    // 6️⃣ send email (fire & forget)

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.USER,
      to: '953622205045@ritrjpm.ac.in',
      subject: `Low Stock Alert: ${product.itemName}`,
      html: htmlMessage,
    });

    console.log(`Low stock alert sent for ${product.itemName}`);
  }
}

module.exports = checkLowStock;
