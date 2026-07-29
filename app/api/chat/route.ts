import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-1.5-flash"; // Fixed model name

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    if (!GEMINI_API_KEY) {
        return NextResponse.json({ error: "API Key missing in environment" }, { status: 500 });
    }

    try {
        const { messages, image } = await req.json();

        // 1. Fetch dynamic products
        const dbProducts = await prisma.product.findMany();

        // 2. Format products for the AI catalog
        const formattedCatalog = {
            tops: dbProducts.filter(p => {
                const cat = p.category.toLowerCase();
                return cat.includes('top') || cat.includes('hoodie') || cat.includes('shirt') || cat.includes('jacket') || cat.includes('coat') || cat.includes('t-shirt');
            }).map(p => ({ id: p.id, name: p.name, category: p.category })),
            bottoms: dbProducts.filter(p => {
                const cat = p.category.toLowerCase();
                return cat.includes('bottom') || cat.includes('pant') || cat.includes('denim') || cat.includes('jeans') || cat.includes('slacks');
            }).map(p => ({ id: p.id, name: p.name, category: p.category })),
            shoes: dbProducts.filter(p => {
                const cat = p.category.toLowerCase();
                return cat.includes('shoe') || cat.includes('boot') || cat.includes('runner') || cat.includes('kicks');
            }).map(p => ({ id: p.id, name: p.name, category: p.category })),
            suits: dbProducts.filter(p => p.category.toLowerCase().includes('suit')).map(p => ({ id: p.id, name: p.name, category: p.category })),
            dresses: dbProducts.filter(p => p.category.toLowerCase().includes('dress')).map(p => ({ id: p.id, name: p.name, category: p.category })),
        };

        const SYSTEM_PROMPT = `You are the AI Fashion Architect.
   
Tone: Professional, futuristic, fashion-forward. Your goal is to guide the user through the Dragon Studio Virtual Try-On ecosystem.

NAVIGATION LOGIC:
If the user wants to move to a different part of the app, append the navigation tag at the end of your response.
Valid views:
- 'home' (Landing page)
- 'catalog' (Product discovery)
- 'studio' (Dragon Studio / Try-On)
- 'vround' (360° Video / V-Round)

Format: [[NAVIGATE: view_name]]

CATALOG DATA:
Tops: ${JSON.stringify(formattedCatalog.tops)}
Bottoms: ${JSON.stringify(formattedCatalog.bottoms)}
Shoes: ${JSON.stringify(formattedCatalog.shoes)}
Suits: ${JSON.stringify(formattedCatalog.suits)}
Dresses: ${JSON.stringify(formattedCatalog.dresses)}

SUGGESTIONS LOGIC:
Always provide relevant item IDs in the following format at the end of your response:
[[SUGGESTIONS: {"tops":[],"bottoms":[],"shoes":[],"suits":[],"dresses":[]}]]

Example: "I recommend the Cyberpunk Hoodie for your look. [[NAVIGATE: studio]] [[SUGGESTIONS: {"tops":["hoodie-123"],"bottoms":[],"shoes":[],"suits":[],"dresses":[]}]]"`;

        // Gemini history pruning
        const trimmedHistory = messages.slice(-10);
        
        // Convert messages to Gemini format
        const contents = trimmedHistory.map((m: any, idx: number) => {
            const role = m.role === 'assistant' ? 'model' : 'user';
            
            // Handle image in user message
            if (m.role === 'user' && image && idx === trimmedHistory.length - 1) {
                const base64Data = image.split(',')[1];
                const mimeType = image.split(',')[0].split(':')[1].split(';')[0];
                
                return {
                    role: 'user',
                    parts: [
                        { text: m.content || "Analyze this clothing style." },
                        { inlineData: { mimeType, data: base64Data } }
                    ]
                };
            }
            
            return {
                role: role,
                parts: [{ text: m.content }]
            };
        });

        // Add System Prompt as the first user message if system_instruction is not supported/failing
        // However, we will use the correct URL format for v1beta
        const API_VERSION = "v1beta";
        const GEMINI_URL = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

        const requestBody = {
            system_instruction: {
                parts: [{ text: SYSTEM_PROMPT }]
            },
            contents: contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
            }
        };

        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Gemini Details Error:", errorData);
            return NextResponse.json({ 
                error: errorData.error?.message || "Gemini Connection Failed",
                details: errorData.error
            }, { status: 400 });
        }

        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";
        
        return NextResponse.json({
            choices: [{
                message: {
                    role: 'assistant',
                    content: aiText
                }
            }]
        });
    } catch (error: any) {
        console.error("Chat API Critical error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
