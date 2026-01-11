const { PrismaClient } = require('@prisma/client');
const path = require('path');

async function main() {
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    console.log('Testing connection to:', dbPath);

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: `file:${dbPath}`,
            },
        },
    });

    try {
        console.log('--- Phase 1: Create ---');
        const newProduct = await prisma.product.create({
            data: {
                name: 'Debug Product',
                category: 'Test',
                image: 'https://via.placeholder.com/150',
                stock: 5
            }
        });
        console.log('Success: Created product with ID:', newProduct.id);

        console.log('--- Phase 2: Delete ---');
        const deleted = await prisma.product.delete({
            where: { id: newProduct.id }
        });
        console.log('Success: Deleted product with ID:', deleted.id);

    } catch (err) {
        console.error('ERROR during DB operation:');
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
