import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

const API_KEY = process.env.GEMINI_API_KEY;
// LOGIC ALIGNED WITH app/v-round/imagetovedio.html
const MODEL_NAME = "gemini-2.5-flash-image";

export async function POST(request: NextRequest) {
    try {
        const { prompt, inlineData } = await request.json();

        if (!inlineData || !inlineData.data) {
            return NextResponse.json({ error: "Missing image data" }, { status: 400 });
        }

        const payload = {
            contents: [{
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: "image/png", data: inlineData.data } }
                ]
            }],
            generationConfig: { responseModalities: ['IMAGE'] }
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json({ error: errorData.error?.message || "Gemini API Error" }, { status: response.status });
        }

        const result = await response.json();

        // Extract base64 image data to save to history
        const part = result?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        const base64Data = part?.inlineData?.data;
        const mimeType = part?.inlineData?.mimeType || 'image/png';

        // Async save to database
        try {
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user && base64Data) {
                const finalImage = `data:${mimeType};base64,${base64Data}`;
                await prisma.tryOnStats.create({
                    data: {
                        userId: user.id,
                        outputImage: finalImage,
                        // No specific product is selected for V-Round custom turnarounds
                    }
                });
                console.log("V-Round frame saved to history DB");
            }
        } catch (historyErr) {
            console.error("Failed to save history:", historyErr);
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
}
