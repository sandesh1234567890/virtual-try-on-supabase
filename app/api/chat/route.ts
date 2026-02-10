import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const PRODUCTS = {
    tops: [
        { id: 't1', name: 'Midnight Dragon Tee (Black)', img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=400' },
        { id: 't2', name: 'Crimson Tech Hoodie (Red)', img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=400' },
        { id: 't3', name: 'Imperial Oxford (White)', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=400' },
        { id: 't4', name: 'Cyber Mesh (Grey)', img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=400' },
    ],
    pants: [
        { id: 'b1', name: 'Cargo Tech Pants (Black)', img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=400' },
        { id: 'b2', name: 'Architecture Denim (Blue)', img: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&q=80&w=400' },
        { id: 'b3', name: 'Stealth Slacks (Grey)', img: 'https://images.unsplash.com/photo-1551488852-081bd4c9028c?auto=format&fit=crop&q=80&w=400' },
    ],
    shoes: [
        { id: 's1', name: 'Talon Lows (Black)', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400' },
        { id: 's2', name: 'Pulse Runners (White)', img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=400' },
        { id: 's3', name: 'Scale-Lock Boots (Brown)', img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=400' },
    ]
};

const SYSTEM_PROMPT = `Dragon Stylist AI. Fashion only.
Tasks: Expert styling; Analyze imgs; Search catalog; Pairings.
Rules: Follow-up? If user says "yes" or "more", provide FRESH alternatives. Keep context. No fluff/bold/stars. Clean MD.
Format: [[SUGGESTIONS: {"tops":["ID"],"pants":["ID"],"shoes":["ID"]}]] (Arrays or null).
Catalog: ${JSON.stringify(PRODUCTS)}`;

export async function POST(req: NextRequest) {
    if (!OPENAI_API_KEY) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

    try {
        const { messages, image } = await req.json();

        // Balanced Optimization: 10 messages for better context depth
        const trimmedHistory = messages.slice(-10);

        const processedMessages = trimmedHistory.map((m: any, idx: number) => {
            if (m.role === 'user' && image && idx === trimmedHistory.length - 1) {
                return {
                    role: 'user',
                    content: [{ type: 'text', text: m.content }, { type: 'image_url', image_url: { url: image } }]
                };
            }
            return m;
        });

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...processedMessages],
                temperature: 0.6,
                max_tokens: 350
            })
        });

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json({ error: error.error?.message || "OpenAI Error" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
