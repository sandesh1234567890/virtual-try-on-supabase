require('dotenv').config();
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.argv[2] || 'models/gemini-2.0-flash-exp';
const URL = `https://generativelanguage.googleapis.com/v1beta/${MODEL}?key=${API_KEY}`;

async function getModel() {
    try {
        const res = await fetch(URL);
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(err);
    }
}

getModel();
