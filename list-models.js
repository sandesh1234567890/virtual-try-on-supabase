const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function listModels() {
    const API_KEY = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error('Error:', data.error.message);
            return;
        }

        console.log('Available Models:');
        data.models.forEach(model => {
            console.log(`- ${model.name} (Methods: ${model.supportedGenerationMethods.join(', ')})`);
        });
    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

listModels();
