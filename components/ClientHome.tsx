'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import TryOnGenerator from "@/components/TryOnGenerator";
import { Product } from "@/lib/products";
import { ArrowRight, Sparkles, ShoppingBag, Zap, Video } from 'lucide-react';
import Footer from "@/components/Footer";

interface ClientHomeProps {
    products: Product[];
    categories: string[];
    activeCategory: string;
}

export default function ClientHome({ products, categories, activeCategory }: ClientHomeProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isCustomTryOnOpen, setIsCustomTryOnOpen] = useState(false);
    const router = useRouter();

    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-black text-white pb-20 md:pb-32 pt-20 md:pt-24 px-6 min-h-[70vh] flex items-center">
                {/* Video Background */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 mix-blend-screen"
                >
                    <source 
                        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4" 
                        type="video/mp4" 
                    />
                </video>
                
                {/* Overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#050505] z-10"></div>

                <div className="container mx-auto max-w-6xl relative z-20 flex flex-col items-center text-center px-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] sm:text-xs font-bold text-emerald-400 backdrop-blur-md mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 uppercase tracking-widest">
                        <Sparkles size={10} className="text-emerald-400" />
                        <span>Neural Fashion Engine 2.0</span>
                    </div>

                    <h1 className="text-4xl sm:text-7xl md:text-9xl font-black tracking-tighter mb-6 md:mb-8 leading-[0.85] animate-in fade-in slide-in-from-bottom-6 duration-700 uppercase italic">
                        Virtual <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-transparent">
                            Try-On.
                        </span>
                    </h1>

                    <p className="text-sm md:text-lg text-neutral-500 max-w-xl mb-8 md:mb-10 animate-in fade-in slide-in-from-bottom-8 duration-900 px-4 font-bold uppercase tracking-[0.2em] leading-relaxed">
                        High-Fidelity AI Generation. <br />
                        Instant Spatial Visualization.
                    </p>

                    <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 w-full sm:w-auto">
                        <a href="#collection" className="px-8 md:px-10 py-4 md:py-5 bg-white text-black rounded-full font-black hover:bg-neutral-200 transition-all flex items-center justify-center gap-3 shadow-2xl text-xs md:text-sm uppercase tracking-widest">
                            Browse Collection <ArrowRight size={18} />
                        </a>
                        <Link
                            href="/dragon"
                            className="px-8 md:px-10 py-4 md:py-5 bg-white/5 border border-white/10 text-white backdrop-blur-xl rounded-full font-black hover:bg-white/10 transition-all flex items-center justify-center gap-3 shadow-2xl text-xs md:text-sm uppercase tracking-widest"
                        >
                            <Zap size={16} className="fill-white" />
                            Combo <span className="text-neutral-500 italic">Studio</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Product Grid */}
            <section id="collection" className="container mx-auto px-4 md:px-6 py-20 md:py-32 max-w-7xl relative z-30">
                <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-start">

                    {/* Filters - Mobile Header */}
                    <div className="w-full md:hidden mb-8 overflow-x-auto no-scrollbar flex gap-3 pb-4">
                        {categories.map(cat => (
                            <a
                                key={cat}
                                href={`/?category=${cat}`}
                                className={`whitespace-nowrap px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${activeCategory === cat
                                    ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                    : 'bg-white/5 text-neutral-500 border-white/10 hover:border-white/30'
                                    }`}
                            >
                                {cat}
                            </a>
                        ))}
                    </div>

                    {/* Filters - Desktop Sidebar */}
                    <aside className="w-full md:w-72 flex-shrink-0 bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-3xl sticky top-28 hidden md:block shadow-2xl group transition-all duration-700 hover:border-white/20">
                        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <h3 className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.3em] font-outfit">Filter_Archive</h3>
                        </div>
                        <div className="space-y-4">
                            {categories.map(cat => (
                                <a
                                    key={cat}
                                    href={`/?category=${cat}`}
                                    className={`flex items-center justify-between px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeCategory === cat
                                        ? 'bg-white text-black shadow-2xl scale-[1.02]'
                                        : 'text-neutral-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <span>{cat}</span>
                                    {activeCategory === cat && <Sparkles size={12} className="text-black" />}
                                </a>
                            ))}
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/5 opacity-50 group-hover:opacity-100 transition-opacity">
                            <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest leading-loose">
                                curated by <br />
                                <span className="text-white">neural archive v.04</span>
                            </p>
                        </div>
                    </aside>

                    {/* Grid */}
                    <div className="flex-1 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">

                            {/* "Upload Your Own" Card - Redesigned */}
                            <div
                                onClick={() => setIsCustomTryOnOpen(true)}
                                className="group relative flex flex-col items-center justify-center text-center bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl cursor-pointer transition-all duration-700 hover:border-emerald-500/30 hover:shadow-[0_0_50px_rgba(16,185,129,0.1)] aspect-[3/4]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-black opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.02)_0%,_transparent_100%)]"></div>
                                
                                <div className="relative z-10 p-10 flex flex-col items-center">
                                    <div className="w-20 h-20 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-emerald-500 transition-all duration-700">
                                        <Sparkles className="text-white w-10 h-10 group-hover:text-black transition-colors" />
                                    </div>
                                    <h3 className="text-xl md:text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">Upload_Custom</h3>
                                    <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                                        Input unique identifiers or upload local fragments for neural synthesis.
                                    </p>
                                    <div className="mt-12 px-8 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700">
                                        Initialize Engine
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
                            <div className="flex flex-col items-center justify-center py-32 text-neutral-600 bg-white/5 rounded-[3rem] border border-dashed border-white/10 mt-10">
                                <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6">
                                    <ShoppingBag className="text-neutral-700" />
                                </div>
                                <p className="text-[11px] font-black uppercase tracking-widest">Neural Archive Empty</p>
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
