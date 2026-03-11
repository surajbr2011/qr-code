const fs = require('fs');
const path = require('path');

const files = [
    'e:/Restaurant-QR-Code/userfrontend/src/data/foods.js',
    'e:/Restaurant-QR-Code/admin-folder-main/src/data/menuData.js'
];

files.forEach(file => {
    try {
        const filePath = path.join(__dirname, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const matches = content.match(/id:/g) || [];
        console.log(`File: ${file}`);
        console.log(`Count: ${matches.length}`);
        console.log('---');
    } catch (e) {
        console.error(`Error reading ${file}:`, e.message);
    }
});
