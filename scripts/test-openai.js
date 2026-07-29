const dotenv = require('dotenv');
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function testOpenAI() {
    if (!OPENAI_API_KEY) {
        console.error("❌ Error: OPENAI_API_KEY is not defined in .env file.");
        process.exit(1);
    }

    console.log("🔍 Testing OpenAI API Key...");
    console.log("Key prefix:", OPENAI_API_KEY.substring(0, 10) + "...");

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o', // Using the model specified in the chat route
                messages: [{ role: 'user', content: 'Say "hello world" if you can hear me.' }],
                max_tokens: 10
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("✅ Success! OpenAI responded:");
            console.log(JSON.stringify(data.choices[0].message, null, 2));
        } else {
            console.error("❌ OpenAI Error:", data.error?.message || response.statusText);
            console.error("Status Code:", response.status);
        }
    } catch (error) {
        console.error("❌ Network/Request Error:", error.message);
    }
}

testOpenAI();
