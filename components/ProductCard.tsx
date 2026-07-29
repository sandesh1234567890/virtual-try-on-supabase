'use client';

import Image from 'next/image';
import { Product } from '@/lib/products';
import { Sparkles } from 'lucide-react';

interface ProductCardProps {
    product: Product;
    onTryOn: (product: Product) => void;
}

export default function ProductCard({ product, onTryOn }: ProductCardProps) {
    return (
        <div className="group relative flex flex-col bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl transition-all duration-700 hover:border-white/30 hover:shadow-[0_0_80px_rgba(255,255,255,0.05)] hover:-translate-y-2">
            {/* Image Container */}
            <div className="aspect-[3/4] relative overflow-hidden bg-neutral-900/50">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-cover object-center transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
                />

                {/* cinematic Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-700" />

                {/* Floating Action Button */}
                <div className="absolute inset-0 flex items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-all duration-700 scale-90 group-hover:scale-100">
                    <button
                        onClick={() => onTryOn(product)}
                        className="w-full bg-white text-black font-black py-4 px-6 rounded-2xl shadow-2xl flex items-center justify-center gap-3 hover:bg-emerald-500 hover:text-black transition-all active:scale-95 text-[10px] uppercase tracking-widest"
                    >
                        <Sparkles size={16} className="text-black" />
                        <span>Initialize Synthesis</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-3">
                    <div className="text-[9px] font-black tracking-[0.2em] text-emerald-500 uppercase">
                        {product.category}
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                </div>
                <h3 className="text-sm md:text-lg font-black text-white font-outfit uppercase tracking-tighter italic group-hover:text-emerald-400 transition-colors line-clamp-1 md:line-clamp-2 leading-tight">
                    {product.name}
                </h3>
            </div>
        </div>
    );
}
