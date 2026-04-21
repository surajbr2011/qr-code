const http = require('http');

const API_BASE = 'http://127.0.0.1:5000/api';
let token = '';

async function fetchAPI(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = {
        method,
        headers
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const contentType = res.headers.get('content-type');
    
    let text = await res.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch(e) {
        data = text;
    }

    return { status: res.status, data };
}

async function runTests() {
    console.log("=== STARTING BACKEND API TESTS ===");
    
    // 1. Auth Test
    console.log("1. Testing Staff Login...");
    const loginRes = await fetchAPI('/auth/staff-login', 'POST', {
        email: 'admin@example.com',
        password: 'Password123'
    });
    
    if (loginRes.status === 200 && loginRes.data.accessToken) {
        token = loginRes.data.accessToken;
        console.log("✅ Login successful. Token acquired.");
    } else {
        console.error("❌ Login failed:", loginRes.status, loginRes.data);
        return;
    }

    // List of endpoints to test
    const endpoints = [
        { path: '/auth/staff', name: 'Get All Staff' },
        { path: '/auth/profile', name: 'Get Admin Profile' },
        { path: '/menu', name: 'Get Menu' },
        { path: '/menu/categories', name: 'Get Menu Categories' },
        { path: '/orders', name: 'Get All Orders' },
        { path: '/hotel', name: 'Get Hotel Details' },
        { path: '/hotel/tables', name: 'Get Hotel Tables' },
        { path: '/offers', name: 'Get Offers' },
        { path: '/notifications', name: 'Get Notifications' },
        { path: '/expenses', name: 'Get Expenses' },
        { path: '/qrcodes', name: 'Get QR Codes' },
        { path: '/promocodes', name: 'Get Promo Codes' },
        { path: '/support/all', name: 'Get Support Requests' },
    ];

    let passed = 0;
    const failures = [];

    for (let ep of endpoints) {
        process.stdout.write(`Testing ${ep.name} (${ep.path})... `);
        try {
            const res = await fetchAPI(ep.path);
            if (res.status >= 200 && res.status < 400) {
                console.log(`✅ Passed (${res.status})`);
                passed++;
            } else {
                console.log(`❌ Failed (${res.status})`);
                failures.push({ endpoint: ep.path, status: res.status, data: res.data });
            }
        } catch(err) {
            console.log(`❌ Error (${err.message})`);
            failures.push({ endpoint: ep.path, status: 'Network Error', error: err.message });
        }
    }

    console.log("\n=== TEST SUMMARY ===");
    console.log(`Total: ${endpoints.length} | ✅ Passed: ${passed} | ❌ Failed: ${failures.length}`);
    
    if (failures.length > 0) {
        console.log("\n--- FAILURE DETAILS ---");
        failures.forEach(f => {
            console.log(`[${f.endpoint}] Status ${f.status}:`, JSON.stringify(f.data).substring(0, 150) + "...");
        });
    }
}

runTests();
