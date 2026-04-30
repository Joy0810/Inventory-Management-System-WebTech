const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Product = require('../models/Product');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const checkLowStock = async () => {
  try {
    const items = await Product.find({
      reorderLevel: { $gt: 0 },
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    });

    if (items.length === 0) {
      console.log('Low stock check: no low stock items');
      return;
    }

    let emailBody = "The following products are at or below their reorder level:\n\n";
    items.forEach(item => {
      emailBody += `- ${item.name} | SKU: ${item.sku} | Current Qty: ${item.quantity} | Reorder Level: ${item.reorderLevel}\n`;
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ALERT_EMAIL,
      subject: `Low Stock Alert - ${items.length} item(s) need restocking`,
      text: emailBody
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending low stock email:', error);
      } else {
        console.log(`Low stock alert email sent for ${items.length} items`);
      }
    });

  } catch (error) {
    console.error('Error during low stock check:', error);
  }
};

cron.schedule('0 8 * * *', checkLowStock);

checkLowStock();

module.exports = { checkLowStock };
