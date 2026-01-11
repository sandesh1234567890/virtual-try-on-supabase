const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.product.count();
        console.log(`Successfully connected to DB. Found ${count} products.`);

        if (count > 0) {
            const first = await prisma.product.findFirst();
            console.log('Sample Product:', first.name);
        } else {
            console.log('Database is empty (Waiting for auto-seed via Home page load).');
        }
    } catch (e) {
        console.error('DB Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
