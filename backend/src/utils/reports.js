const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');
const Order = require('../models/Order');

const ensureReportsDir = () => {
    const dir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
};

const exportOrdersToCsv = async (filter = {}) => {
    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    const fields = ['_id', 'tableNo', 'totalAmount', 'status', 'paymentStatus', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(orders);

    const dir = ensureReportsDir();
    const filename = `orders_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, csv);
    return filepath;
};

module.exports = { exportOrdersToCsv };
