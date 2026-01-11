const fs = require('fs');
const path = require('path');

const requiredVars = [
    'AUTH_SECRET',
    'GEMINI_API_KEY',
    'DATABASE_URL'
];

const optionalVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
];

// Try to read from .env if possible (simple parse)
let envVars = { ...process.env };
try {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                envVars[match[1]] = match[2];
            }
        });
        console.log('Loaded .env file');
    } else {
        console.log('.env file not found');
    }
} catch (e) {
    console.log('Error reading .env file:', e.message);
}

console.log('Checking Environment Variables...');
let missing = [];

requiredVars.forEach(v => {
    if (!envVars[v]) {
        missing.push(v);
        console.error(`❌ Missing: ${v}`);
    } else if (envVars[v].includes('your_') || envVars[v].includes('placeholder')) {
        console.error(`⚠️  Placeholder detected for ${v}: "${envVars[v]}"`);
        missing.push(v);
    } else {
        console.log(`✅ Found: ${v}`);
    }
});

optionalVars.forEach(v => {
    if (!envVars[v]) {
        console.warn(`⚠️  Missing Optional: ${v}`);
    } else {
        console.log(`✅ Found: ${v}`);
    }
});

if (missing.length > 0) {
    console.error('Missing required environment variables!');
    process.exit(1);
} else {
    console.log('All required environment variables are present.');
    process.exit(0);
}
