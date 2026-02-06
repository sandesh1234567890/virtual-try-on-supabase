'use client';

import Link from 'next/link';
import { ShoppingBag, Zap } from 'lucide-react';


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
                <nav className="flex items-center gap-6 text-sm font-medium">
                    <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Collection</Link>
                    <Link href="/2.html" className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg hover:scale-105 transition-all text-xs font-black uppercase tracking-widest">
                        <Zap size={14} className="fill-white" />
                        Combo Premium+
                    </Link>
                    <Link href="/admin" className="text-gray-600 hover:text-gray-900 transition-colors">Admin</Link>
                </nav>
            </div>
        </header>
    );
}
