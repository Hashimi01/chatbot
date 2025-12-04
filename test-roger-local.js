
const http = require('http');

const data = JSON.stringify({
    message: 'Hello Roger, how are you?',
    conversationHistory: []
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/roger/chat',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Sending request to http://localhost:3000/api/roger/chat...');

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('Response:', body);
    });
});

req.on('error', (error) => {
    console.error('Error:', error.message);
    console.log('Make sure the Next.js server is running on localhost:3000');
});

req.write(data);
req.end();
