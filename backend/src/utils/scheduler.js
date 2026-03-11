const cron = require('node-cron');
const { exportOrdersToCsv } = require('./reports');

const startScheduler = () => {
    // Run daily at 02:00 AM server time
    cron.schedule('0 2 * * *', async () => {
        try {
            const filepath = await exportOrdersToCsv();
            console.log('Daily orders report written to', filepath);
        } catch (err) {
            console.error('Scheduled report failed', err);
        }
    });
};

module.exports = { startScheduler };
