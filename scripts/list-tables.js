const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Connecting to database to list tables...");
        const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public';
    `;
        console.log("Tables found in public schema:");
        console.table(tables);

        const productCount = await prisma.product.count();
        console.log("Total products in 'Product' table:", productCount);
    } catch (error) {
        console.error("Failed to fetch tables!");
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
