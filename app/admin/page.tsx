import Link from 'next/link';
import { Plus, Package, Trash2, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {

    // Fetch products from Real DB
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
    });

    // Server Action for Deleting
    async function deleteProduct(formData: FormData) {
        'use server';
        const id = formData.get('id') as string;
        if (id) {
            await prisma.product.delete({ where: { id } });
            revalidatePath('/admin');
            revalidatePath('/'); // Update homepage too
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Package className="text-indigo-600" />
                        Admin Dashboard
                    </h1>
                    <Link
                        href="/admin/add-product"
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                    >
                        <Plus size={18} /> Add Product
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-blue-50 p-3 border-b border-blue-100 text-blue-800 text-xs font-medium flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            Connected to Supabase (PostgreSQL)
                        </div>
                        <span className="text-[10px] opacity-70 hidden sm:inline">Product Management Active</span>
                    </div>

                    {products.length === 0 ? (
                        <div className="p-20 text-center text-gray-500">
                            <Package className="mx-auto mb-4 text-gray-300" size={48} />
                            <p className="font-medium text-lg">No products found</p>
                            <p className="text-sm">Add your first clothing item to start the collection.</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50 text-gray-900 font-medium border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4">Image</th>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4">Stock</th>
                                            <th className="px-6 py-4">Created At</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {products.map(product => (
                                            <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-3">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden relative border border-gray-200">
                                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 font-medium text-gray-900">{product.name}</td>
                                                <td className="px-6 py-3">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                                        {product.stock} in stock
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-gray-400 text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={12} />
                                                        {new Date(product.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <form action={deleteProduct}>
                                                        <input type="hidden" name="id" value={product.id} />
                                                        <button
                                                            type="submit"
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Delete Product"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </form>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Grid View */}
                            <div className="md:hidden divide-y divide-gray-100">
                                {products.map(product => (
                                    <div key={product.id} className="p-4 flex items-center justify-between gap-4 bg-white hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 line-clamp-1">{product.name}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded uppercase font-bold text-gray-500">{product.category}</span>
                                                    <span className="text-[10px] text-green-700 font-medium">{product.stock} in stock</span>
                                                </div>
                                            </div>
                                        </div>
                                        <form action={deleteProduct} className="shrink-0">
                                            <input type="hidden" name="id" value={product.id} />
                                            <button
                                                type="submit"
                                                className="p-3 text-red-500 bg-red-50 rounded-xl active:scale-90 transition-transform"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </form>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
