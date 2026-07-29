const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const products = await prisma.product.findMany();
        console.log('ALL PRODUCTS IN DB:');
        products.forEach(p => {
            console.log(`- ID: ${p.id}, Name: ${p.name}, Category: ${p.category}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
