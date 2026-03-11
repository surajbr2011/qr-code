const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'crash.log');

console.log("Starting Debug...");

try {
    const authRoutes = require('./src/routes/authRoutes');
    console.log("Loaded authRoutes");

    const hotelRoutes = require('./src/routes/hotelRoutes');
    console.log("Loaded hotelRoutes");

    // Check local dependencies
    require('./src/models/User');
    console.log("Loaded User model");

    console.log("SUCCESS");
    fs.writeFileSync(logFile, "SUCCESS");
} catch (e) {
    console.error("ERROR:", e);
    fs.writeFileSync(logFile, `ERROR: ${e.message}\nCODE: ${e.code}\nMODULE: ${e.requireStack ? e.requireStack.join(' -> ') : 'N/A'}`);
}
