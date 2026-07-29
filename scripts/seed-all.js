const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const unifiedCatalog = [
    // Original lib products
    { name: 'Your Red T-Shirt', category: 'T-Shirt', image: 'https://orangeidea.in/cdn/shop/files/HS07_Red.jpg?v=1726132378' },
    { name: 'Your White T-Shirt', category: 'T-Shirt', image: 'https://orangeidea.in/cdn/shop/files/HS02_White.jpg?v=1726130844&width=150' },
    { name: 'Denim Jacket', category: 'Jacket', image: 'https://assets.digitalcontent.marksandspencer.app/image/upload/w_1008,h_1319,q_auto,f_auto,e_sharpen/SD_03_T16_6466M_E2_X_EC_94' },
    { name: 'Leather Jacket', category: 'Jacket', image: 'https://i.imgur.com/pl349pM.png' },
    { name: 'Beige Trench Coat', category: 'Jacket', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6C0xOtO13DFeJvTMQ8FPkx1mArE43bTJYs4v2RSeHoAOPaSfSK9ANxtXPbxAlsyZEuKw&usqp=CAU' },
    { name: 'Summer Dress', category: 'Dress', image: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcToMXKcvs8IjYHvyCUvl6WH7gEGz3uHZ8JV4vWjsiQEFVONM4Uqb8hT441tdGAi-jSpdrWEiNp_V36fPopvMquLaT6DjMXgdo023os7uceTMN24onCXFEWm' },
    { name: 'Floral Sundress', category: 'Dress', image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQSToyOZL0lm55_HOX8bfD4GDP2lTOtPuCkgic0mfR6ow3sihcR' },
    { name: 'Blue Evening Gown', category: 'Dress', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTr-HKxMh2HpLrWDEBjCzhYaWwHndCKDeXeH3Oct1MRJ5SjuztR' },
    { name: 'Formal Shirt', category: 'Shirt', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=400' },
    { name: 'Plaid Flannel Shirt', category: 'Shirt', image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTNwa1VYTRdCQj8yU_BUUEp53aGpkj4Pe7f9E0RmyB4K0WLsr0x' },
    { name: 'Navy Business Suit', category: 'Suit', image: 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTCTVhGtN1IBcBw-5rZQsUp_5xVTG2mMj_0wF4vHe-lN55FXk4M' },
    { name: 'Blue Jeans', category: 'Pants', image: 'https://media.istockphoto.com/id/1281304280/photo/folded-blue-jeans-on-a-white-background-modern-casual-clothing-flat-lay-copy-space.jpg?s=612x612&w=0&k=20&c=nSMI2abaVovzkH1n0eXeJYCkrtI-6QcD_V7OVUz4zS4=' },

    // Original dragon products (remapped for consistency)
    { name: 'Midnight Dragon Tee (Black)', category: 'tops', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=400' },
    { name: 'Crimson Tech Hoodie', category: 'tops', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=400' },
    { name: 'Imperial Oxford', category: 'tops', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=400' },
    { name: 'Cyber Mesh (Grey)', category: 'tops', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=400' },
    { name: 'Cargo Tech Pants (Black)', category: 'bottoms', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=400' },
    { name: 'Architecture Denim (Blue)', category: 'bottoms', image: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&q=80&w=400' },
    { name: 'Stealth Slacks (Grey)', category: 'bottoms', image: 'https://images.unsplash.com/photo-1551488852-081bd4c9028c?auto=format&fit=crop&q=80&w=400' },
    { name: 'Talon Lows', category: 'shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400' },
    { name: 'Pulse Runners', category: 'shoes', image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=400' },
    { name: 'Scale-Lock Boots', category: 'shoes', image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=400' },

    // NEW Interview Products
    { name: 'Executive Charcoal Suit', category: 'Suit', image: 'https://images.unsplash.com/photo-1594932224010-3a13063f9661?auto=format&fit=crop&q=80&w=600' },
    { name: 'Sharp White Oxford Shirt', category: 'Shirt', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVkXvSMrhLITfsctFvfRyMpFxFAXlVeIsdxw&s' },
    { name: 'Light Blue Business Shirt', category: 'Shirt', image: 'https://images.unsplash.com/photo-1603251578711-3290ca1a0187?auto=format&fit=crop&q=80&w=600' },
    { name: 'Classic Navy Slacks', category: 'bottoms', image: 'https://st.depositphotos.com/1000636/1967/i/450/depositphotos_196756998-stock-photo-navy-blue-formal-mens-trousers.jpg' },
    { name: 'Professional Black Trousers', category: 'bottoms', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600' },
    { name: 'Executive Black Oxfords', category: 'shoes', image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=600' },
    { name: 'Premium Brown Brogues', category: 'shoes', image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=600' },
];

async function main() {
    try {
        console.log('Clearing existing products...');
        await prisma.product.deleteMany();

        console.log('Seeding ' + unifiedCatalog.length + ' products...');
        for (const p of unifiedCatalog) {
            await prisma.product.create({
                data: {
                    name: p.name,
                    category: p.category,
                    image: p.image,
                    stock: 10
                }
            });
        }

        console.log('Done! seeded ' + unifiedCatalog.length + ' products.');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
