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
        const body = await request.json();

        // Basic validation
        if (!body.name || !body.image || !body.category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newProduct = await prisma.product.create({
            data: {
                name: body.name,
                category: body.category,
                image: body.image,
                stock: body.stock || 0,
            }
        });

        return NextResponse.json({
            message: "Product added successfully",
            product: newProduct,
            success: true
        });
    } catch (e: any) {
        console.error("Product create error:", e);
        return NextResponse.json({ error: e.message || "Invalid data" }, { status: 400 });
    }
}
