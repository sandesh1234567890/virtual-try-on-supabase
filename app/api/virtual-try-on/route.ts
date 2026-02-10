import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash-image";
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

        const promptText = `TASK: EDIT IMAGE 1 (PERSON) BY WEARING THE CLOTHING FROM IMAGE 2 (GARMENT).
IMAGE 1 DESCRIPTION: A photo of a person.
IMAGE 2 DESCRIPTION: ${productName}.

INSTRUCTIONS:
1. IDENTIFY LOCK: You MUST use the EXACT pixels for the face, hair, and skin from IMAGE 1. Any alteration to facial features, eyes, nose, mouth, or skin tone is a CRITICAL FAILURE.
2. FROZEN POSE: Maintain the EXACT anatomical structure, body shape, and pose from IMAGE 1. The person must not change size or stance.
3. Replace their current clothes with the EXACT garment shown in IMAGE 2.
4. **CRITICAL VISUAL FIDELITY**: Match the MATERIAL (e.g., silk, leather, denim), TEXTURE (e.g., mesh, knit, shiny), PATTERNS, and LOGOS exactly as they appear in IMAGE 2.
5. If the product name ("${productName}") conflicts with visual details in IMAGE 2, IGNORE the name and follow the visual image.
6. The garment must be naturally draped over the person's body from IMAGE 1.
7. ABSOLUTELY PRESERVE the entire background and environment from IMAGE 1.
8. The final output must be a single image of the person from IMAGE 1 wearing the specific garment from IMAGE 2.`;

        const payload = {
            contents: [{
                parts: [
                    { inlineData: { mimeType: userMime, data: userBase64 } },
                    { inlineData: { mimeType: garmentMimeType, data: garmentBase64 } },
                    { text: promptText }
                ]
            }],
            generationConfig: {
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
        return NextResponse.json({
            image: base64Data,
            mimeType: mimeType
        });

    } catch (error: any) {
        console.error("POST /api/virtual-try-on: SERVER ERROR:", error);
        return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
}
