import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-3-pro-image-preview";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

async function prepareImage(buffer: Buffer, mimeType: string): Promise<{ data: string, mimeType: string }> {
    // Gemini supports jpeg, png, webp, heic, heif. It does NOT support avif.
    const supportedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

    if (supportedMimes.includes(mimeType.toLowerCase())) {
        return { data: buffer.toString('base64'), mimeType };
    }

    // Convert to JPEG if format is unsupported (like avif)
    console.log(`Converting unsupported MIME type ${mimeType} to image/jpeg...`);
    const convertedBuffer = await sharp(buffer)
        .jpeg({ quality: 90 })
        .toBuffer();

    return { data: convertedBuffer.toString('base64'), mimeType: 'image/jpeg' };
}

export async function POST(request: NextRequest) {
    try {
        console.log("POST /api/virtual-try-on: Received request");
        const formData = await request.formData();
        const userImage = formData.get('userImage') as Blob;
        const garmentImage = formData.get('garmentImage') as Blob | null;
        const garmentImageUrl = formData.get('garmentImageUrl') as string | null;
        const productName = formData.get('productName') as string;
        const productId = formData.get('productId') as string | null;

        if (!userImage) {
            console.warn("POST /api/virtual-try-on: Missing user image");
            return NextResponse.json({ error: "Missing user image" }, { status: 400 });
        }

        if (!garmentImage && !garmentImageUrl) {
            console.warn("POST /api/virtual-try-on: Missing garment image");
            return NextResponse.json({ error: "Missing garment image (file or URL)" }, { status: 400 });
        }

        console.log(`POST /api/virtual-try-on: Processing images for "${productName}"`);

        // Prepare User Image
        const userBuffer = Buffer.from(await userImage.arrayBuffer());
        const { data: userBase64, mimeType: userMime } = await prepareImage(userBuffer, userImage.type || 'image/jpeg');

        // Prepare Garment Image
        let garmentBase64 = '';
        let garmentMimeType = '';

        if (garmentImageUrl) {
            console.log(`POST /api/virtual-try-on: Fetching garment from URL: ${garmentImageUrl}`);
            try {
                const garmentRes = await fetch(garmentImageUrl);
                if (!garmentRes.ok) throw new Error(`Failed to fetch image: ${garmentRes.statusText}`);
                const garmentBlob = await garmentRes.blob();
                const garmentBuffer = Buffer.from(await garmentBlob.arrayBuffer());
                const prepared = await prepareImage(garmentBuffer, garmentBlob.type || 'image/jpeg');
                garmentBase64 = prepared.data;
                garmentMimeType = prepared.mimeType;
            } catch (fetchErr: any) {
                console.error("Error fetching garment image:", fetchErr);
                return NextResponse.json({ error: "Could not retrieve garment image from source." }, { status: 424 });
            }
        } else if (garmentImage) {
            const garmentBuffer = Buffer.from(await garmentImage.arrayBuffer());
            const prepared = await prepareImage(garmentBuffer, garmentImage.type || 'image/jpeg');
            garmentBase64 = prepared.data;
            garmentMimeType = prepared.mimeType;
        }

        const promptText = `TASK: You are a professional digital compositor. Your task is to perform an INVISIBLE, PHOTO-REALISTIC garment transfer.

INPUTS:
- IMAGE 1: The USER (Target Body/Face).
- IMAGE 2: The GARMENT (${productName}).

CRITICAL INSTRUCTIONS - "ZERO TOLERANCE" FOR ALTERATION:
1. **FACE & IDENTITY**: Do NOT regenerate or "enhance" the face. You must PIXEL-COPY the face, hair, and skin tone from IMAGE 1. If the face changes even slightly, the result is REJECTED.
2. **BODY SHAPE**: Maintain the exact body shape and pose of IMAGE 1. Do not slim or change the user's physique.
3. **GARMENT FIDELITY**: The garment from IMAGE 2 must be overlaid onto the body in IMAGE 1. It must retain 100% of its texture, material properties (e.g., stiffness vs. drape), and logos.
4. **COMPOSITING**: Use advanced lighting matching to ensure the new garment looks like it was photographed in the environment of IMAGE 1. Shadows and reflections must match the original scene.
5. **OUTPUT MAPPING**: 
   - BASE: IMAGE 1 (Face, Body, Background)
   - OVERLAY: IMAGE 2 (Warped to fit body)
   - RESULT via "Neural Layering": Combine BASE and OVERLAY seamlessly.

OUTPUT: A single, high-resolution, photo-realistic image.`;

        const payload = {
            contents: [{
                parts: [
                    { text: promptText },
                    { inlineData: { mimeType: userMime, data: userBase64 } },
                    { inlineData: { mimeType: garmentMimeType, data: garmentBase64 } }
                ]
            }],
            generationConfig: {
                // Use pure IMAGE modality for speed and direct visual output with this model
                responseModalities: ['IMAGE']
            }
        };

        console.log("POST /api/virtual-try-on: Calling Gemini API...");
        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        // Handle specific Gemini errors
        if (result.error) {
            console.error("Gemini API Error:", result.error);
            if (result.error.message?.includes('modality')) {
                return NextResponse.json({
                    error: "Your Gemini API key does not have 'Image Generation' permissions yet. Please ensure your account has access to experimental image features.",
                    details: result.error.message
                }, { status: 403 });
            }
            return NextResponse.json({ error: result.error.message || "Gemini service error" }, { status: response.status });
        }

        if (!response.ok) {
            console.error("Gemini Response Not OK:", response.status, result);
            return NextResponse.json({ error: "Failed to generate image" }, { status: response.status });
        }

        const part = result?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        const imageData = part?.inlineData;
        const base64Data = imageData?.data;
        const mimeType = imageData?.mimeType || 'image/png';

        if (!base64Data) {
            console.warn("POST /api/virtual-try-on: No image data in Gemini response");
            return NextResponse.json({ error: "No image was generated. The prompt might have been blocked or the service is busy." }, { status: 500 });
        }

        console.log("POST /api/virtual-try-on: Success!");

        // Save History (Async, don't block response if possible, but Vercel functions might kill it?)
        // Better to await it or use `waitUntil` if available (Next.js 15 has after()).
        // For simple setup, we await in try-catch to be safe.
        // We need user session.
        try {
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const finalImage = `data:${mimeType};base64,${base64Data}`;
                await prisma.tryOnStats.create({
                    data: {
                        userId: user.id,
                        outputImage: finalImage,
                        productId: productId || undefined, // Only if present
                    }
                });
                console.log("History saved to DB");
            }
        } catch (historyErr) {
            console.error("Failed to save history:", historyErr);
            // Non-blocking error for the user
        }

        return NextResponse.json({
            image: base64Data,
            mimeType: mimeType
        });

    } catch (error: any) {
        console.error("POST /api/virtual-try-on: SERVER ERROR:", error);
        return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
}
