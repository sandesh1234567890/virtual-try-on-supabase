require('dotenv').config();

async function testGeminiChat() {
    const port = 3000;
    const url = `http://localhost:${port}/api/chat`;

    console.log(`Testing Gemini Chat API at ${url}...`);

    const payload = {
        messages: [
            { role: 'user', content: 'Suggest a casual outfit for a sunny day.' }
        ]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log("Success! Response from API:");
            console.log(JSON.stringify(data, null, 2));
            
            const content = data.choices[0].message.content;
            if (content.includes('[[SUGGESTIONS:')) {
                console.log("\n✅ Suggestions found in response.");
            } else {
                console.log("\n⚠️ No suggestions found. Gemini might not have suggested specific items.");
            }
        } else {
            console.error("Error from API:", data.error);
        }
    } catch (error) {
        console.error("Failed to connect to API. Is the server running?", error.message);
    }
}

testGeminiChat();
