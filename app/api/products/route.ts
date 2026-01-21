import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(products);
    } catch (error: any) {
        return NextResponse.json({
            error: "Failed to fetch products",
            message: error.message,
            code: error.code
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log("POST /api/products: Received request");
        const body = await request.json();

        // Basic validation
        if (!body.name || !body.image || !body.category) {
            console.warn("POST /api/products: Missing required fields", body);
            return NextResponse.json({ error: "Missing required fields (name, image, category)" }, { status: 400 });
        }

        console.log(`POST /api/products: Creating product "${body.name}"`);
        const newProduct = await prisma.product.create({
            data: {
                name: body.name,
                category: body.category,
                image: body.image,
                stock: body.stock || 0,
            }
        });

        console.log(`POST /api/products: Success! Created ID: ${newProduct.id}`);
        return NextResponse.json({
            message: "Product added successfully",
            product: newProduct,
            success: true
        });
    } catch (e: any) {
        console.error("POST /api/products: ERROR:", e);
        return NextResponse.json({
            error: "Failed to create product",
            details: e.message || "Invalid database operation"
        }, { status: 500 });
    }
}
