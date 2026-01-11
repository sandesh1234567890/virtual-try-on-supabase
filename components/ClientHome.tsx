'use client';

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import TryOnGenerator from "@/components/TryOnGenerator";
import { Product } from "@/lib/products";
import { ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';

interface ClientHomeProps {
    products: Product[];
    categories: string[];
    activeCategory: string;
}

export default function ClientHome({ products, categories, activeCategory }: ClientHomeProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isCustomTryOnOpen, setIsCustomTryOnOpen] = useState(false);

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gray-900 text-white pb-32 pt-24 px-6">
                {/* Abstract Background */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="container mx-auto max-w-6xl relative z-10 flex flex-col items-center text-center px-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium backdrop-blur-md mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Sparkles size={12} className="text-yellow-300" />
                        <span>AI-Powered Virtual Experience</span>
                    </div>

                    <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
                        Curated Fashion. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                            Virtual Reality.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-900">
                        Explore the exclusive collection by <strong>Sandesh Surwase</strong>.
                        Upload your photo and instantly visualize how each piece fits your style.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <a href="#collection" className="px-8 py-4 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-100 transition-all flex items-center gap-2">
                            Explore Collection <ArrowRight size={18} />
                        </a>
                        <button
                            onClick={() => setIsCustomTryOnOpen(true)}
                            className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-full font-bold hover:bg-white/20 transition-all backdrop-blur-sm"
                        >
                            Try Your Own Image
                        </button>
                    </div>
                </div>
            </section>

            {/* Product Grid */}
            <section id="collection" className="container mx-auto px-6 py-20 max-w-7xl -mt-20 relative z-20">
                <div className="flex flex-col md:flex-row gap-12 items-start">

                    {/* Filters */}
                    <aside className="w-full md:w-64 flex-shrink-0 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24 hidden md:block">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 font-outfit">Categories</h3>
                        <div className="space-y-2">
                            {categories.map(cat => (
                                <a
                                    key={cat}
                                    href={`/?category=${cat}`}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeCategory === cat
                                        ? 'bg-gray-900 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <span>{cat}</span>
                                    {activeCategory === cat && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                </a>
                            ))}
                        </div>
                    </aside>

                    {/* Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">

                            {/* "Upload Your Own" Card - Always First */}
                            <div
                                onClick={() => setIsCustomTryOnOpen(true)}
                                className="group relative flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-600 to-cyan-700 rounded-2xl overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] aspect-[3/4]"
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <div className="relative z-10 p-6">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                        <Sparkles className="text-white w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg md:text-2xl font-bold text-white mb-2">Upload Custom</h3>
                                    <p className="text-blue-100 text-xs md:text-sm leading-relaxed line-clamp-2 md:line-clamp-none">
                                        Have a specific item in mind? Upload any image or URL to try it on.
                                    </p>
                                    <div className="mt-8 px-6 py-2 bg-white text-blue-900 rounded-full text-sm font-bold opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                        Start Creating
                                    </div>
                                </div>
                            </div>

                            {products.map((product, index) => (
                                <div key={product.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${index * 100}ms` }}>
                                    <ProductCard
                                        product={product}
                                        onTryOn={(p) => setSelectedProduct(p)}
                                    />
                                </div>
                            ))}
                        </div>

                        {products.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-gray-50 rounded-3xl border border-dashed border-gray-200 mt-8">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                    <ShoppingBag className="text-gray-400" />
                                </div>
                                <p className="font-medium">No products found in this category.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Try On Modal (Catalog Product) */}
            {selectedProduct && (
                <TryOnGenerator
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}

            {/* Try On Modal (Custom Upload) */}
            {isCustomTryOnOpen && (
                <TryOnGenerator
                    onClose={() => setIsCustomTryOnOpen(false)}
                />
            )}
        </main>
    );
}
