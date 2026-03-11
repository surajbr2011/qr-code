const http = require('http');

function check(path) {
    return new Promise((resolve) => {
        http.get(`http://localhost:5001${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`[${path}] Status: ${res.statusCode}`);
                console.log(`[${path}] Body: ${data.substring(0, 100)}...`);
                resolve();
            });
        }).on('error', (err) => {
            console.log(`[${path}] Error: ${err.message}`);
            resolve();
        });
    });
}

async function run() {
    console.log("Checking API...");
    await check('/');
    await check('/api/test-server');
    await check('/api/menu');
    await check('/api/promocodes');
}

run();
