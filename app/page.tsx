import Link from 'next/link';
import { prisma } from "@/lib/prisma";
import { products as initialProducts } from "@/lib/products";
import ClientHome from "@/components/ClientHome";

export const dynamic = 'force-dynamic';

// Standard Server Component
export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string }> }) {

  let allProducts = [];
  try {
    // 1. Check for Auto-Seeding
    const productCount = await prisma.product.count();
    if (productCount === 0) {
      console.log("Seeding initial products...");
      for (const p of initialProducts) {
        await prisma.product.create({
          data: {
            name: p.name,
            category: p.category,
            image: p.image,
            stock: 10
          }
        });
      }
    }

    // 2. Fetch from DB
    allProducts = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error: any) {
    console.error("Database connection failed:", error);
    // If we can't connect, we'll try to show the app with 0 products 
    // or a graceful error instead of a crash.
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Database Connection Error</h1>
        <p className="text-gray-600 max-w-md">
          We couldn't connect to the products database. This is usually due to missing or incorrect environment variables (DATABASE_URL/DIRECT_URL) in Vercel.
        </p>
        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200 text-left text-xs font-mono overflow-auto max-w-xl">
          <p className="font-bold text-gray-500 mb-2 uppercase">Diagnostic Info:</p>
          <p>{error.message || "Unknown error occurred"}</p>
        </div>
        <Link href="/admin" className="mt-8 text-blue-600 hover:underline font-medium">
          Check Admin Panel
        </Link>
      </div>
    );
  }

  const { category } = await searchParams;

  const filteredProducts = category && category !== 'All Items'
    ? allProducts.filter(p => p.category === category)
    : allProducts;

  const categories = ['All Items', ...Array.from(new Set(allProducts.map(p => p.category)))];

  return (
    <ClientHome
      products={filteredProducts}
      categories={categories}
      activeCategory={category || 'All Items'}
    />
  );
}
