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
        <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
            {/* Image Container */}
            <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Floating Action Button */}
                <button
                    onClick={() => onTryOn(product)}
                    className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95"
                >
                    <Sparkles size={16} className="text-white" />
                    <span>Try On Now</span>
                </button>
            </div>

            {/* Content */}
            <div className="p-3 md:p-5">
                <div className="mb-0.5 md:mb-1 text-[10px] md:text-xs font-bold tracking-wide text-blue-600 uppercase">
                    {product.category}
                </div>
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 font-outfit mb-1 md:mb-2 group-hover:text-blue-600 transition-colors line-clamp-1 md:line-clamp-2">
                    {product.name}
                </h3>
            </div>
        </div>
    );
}
