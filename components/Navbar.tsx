'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';


export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/70 backdrop-blur-xl shadow-sm transition-all duration-300">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg transition-transform group-hover:scale-105 group-hover:bg-blue-700">
                        <ShoppingBag size={18} />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-900 font-outfit">
                        Sandesh Surwase
                    </span>
                </Link>
                <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
                    <Link href="/" className="hover:text-gray-900 transition-colors">Collection</Link>
                    <Link href="/admin" className="hover:text-gray-900 transition-colors">Admin</Link>
                </nav>
            </div>
        </header>
    );
}
