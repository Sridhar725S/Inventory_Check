const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // or another SMTP service
  auth: {
    user: process.env.USER,
    pass: process.env.PASS, // Use App Password if 2FA is enabled
  },
});


function sendInvoiceEmail(to, invoice) {
  const formatPrice = (num) => num.toLocaleString('en-IN');

  let productDetails = (invoice.products || []).map(p => `
  <tr>
    <td style="padding:10px; border-bottom:1px solid #eee;">${p.itemName}</td>
    <td style="padding:10px; text-align:center; border-bottom:1px solid #eee;">${p.qty}</td>
    <td style="padding:10px; text-align:right; border-bottom:1px solid #eee;">₹${formatPrice(p.rate)}</td>
    <td style="padding:10px; text-align:right; border-bottom:1px solid #eee;">₹${formatPrice(p.gst || 0)}</td>
<td style="padding:10px; text-align:right; border-bottom:1px solid #eee;">₹${formatPrice(p.totalValue)}</td>

  </tr>
`).join('');


  const mailOptions = {
    from: process.env.USER,
    to,
    subject: `Invoice #${invoice._id} - Your Company Pvt Ltd`,
    html: `
    <div style="font-family: Arial, sans-serif; background:#f5f6fa; padding:20px;">
      <table style="max-width:700px; margin:auto; background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <tr>
          <td style="background:#0d6efd; padding:20px; text-align:center; color:#fff;">
            <img src="https://yourcompany.com/logo.png" alt="Logo" style="max-height:40px; margin-bottom:10px;">
            <h2 style="margin:0;">Invoice</h2>
          </td>
        </tr>

        <!-- Customer Info -->
        <tr>
          <td style="padding:25px;">
            <p style="margin:0 0 5px 0; font-size:16px;"><strong>Billed To:</strong></p>
            <p style="margin:0; font-size:15px; color:#333;">
              ${invoice.name}<br>
              ${invoice.college}<br>
              Year: ${invoice.year}<br>
              Phone: ${invoice.phone}<br>
              Email: ${invoice.email}
            </p>
          </td>
        </tr>

        <!-- Items Table -->
        <tr>
          <td style="padding:0 25px 25px 25px;">
            <table style="width:100%; border-collapse:collapse; font-size:15px;">
              <thead>
                <tr style="background:#f0f2f5;">
                  <th style="padding:10px; text-align:left;">Item</th>
                  <th style="padding:10px; text-align:center;">Qty</th>
                  <th style="padding:10px; text-align:right;">Rate</th>
                  <th style="padding:10px; text-align:right;">GST (18%)</th>
<th style="padding:10px; text-align:right;">Total</th>

                </tr>
              </thead>
              <tbody>
                ${productDetails}
              </tbody>
            </table>
          </td>
        </tr>

        <!-- Grand Total -->
        <tr>
          <td style="padding:25px; text-align:right; font-size:16px;">
            <strong>Grand Total: ₹${formatPrice(invoice.totalInvoiceValue)}</strong>
          </td>
        </tr>

        <!-- Notes -->
        <tr>
          <td style="padding:20px 25px; font-size:14px; color:#555;">
            Thank you for your business! 🎉<br><br>
            If you have any questions, reach us at 
            <a href="mailto:support@yourcompany.com" style="color:#0d6efd; text-decoration:none;">support@yourcompany.com</a>.
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f0f2f5; padding:15px; text-align:center; font-size:13px; color:#777;">
            © ${new Date().getFullYear()} Your Company Pvt Ltd · 123 Business Street, City, State<br>
            This is an automated invoice email. Please do not reply.
          </td>
        </tr>

      </table>
    </div>
    `
  };

  return transporter.sendMail(mailOptions);
}


module.exports = { sendInvoiceEmail };
