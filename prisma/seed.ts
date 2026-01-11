const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const products = [
    { name: "Navy Business Suit", category: "Suit", image: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTCTVhGtN1IBcBw-5rZQsUp_5xVTG2mMj_0wF4vHe-lN55FXk4M" },
    { name: "Floral Sundress", category: "dress", image: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQSToyOZL0lm55_HOX8bfD4GDP2lTOtPuCkgic0mfR6ow3sihcR" },
    { name: "Plaid Flannel Shirt", category: "Shirt", image: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTNwa1VYTRdCQj8yU_BUUEp53aGpkj4Pe7f9E0RmyB4K0WLsr0x" },
    { name: "Beige Summer Dress", category: "Dress", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6C0xOtO13DFeJvTMQ8FPkx1mArE43bTJYs4v2RSeHoAOPaSfSK9ANxtXPbxAlsyZEuKw&usqp=CAU" },
    { name: "Denim Jacket", category: "Jacket", image: "https://assets.digitalcontent.marksandspencer.app/image/upload/w_1008,h_1319,q_auto,f_auto,e_sharpen/SD_03_T16_6466M_E2_X_EC_94" }
];

async function main() {
    console.log('Cleaning existing products...');
    await prisma.product.deleteMany({});

    console.log('Seeding demo data...');
    for (const p of products) {
        await prisma.product.create({
            data: {
                ...p,
                stock: 10
            }
        });
    }
    console.log('Seed successful!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
