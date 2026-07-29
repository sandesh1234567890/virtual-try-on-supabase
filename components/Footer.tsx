'use client';

import React from 'react';
import { Flame, Github, Twitter, Instagram, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-[#030303] border-t border-white/5 py-24 px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.05)_0%,_transparent_50%)]"></div>
            
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10">
                
                {/* Brand Section */}
                <div className="col-span-1 md:col-span-2 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                            <Flame className="text-emerald-400 h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-3xl font-black tracking-tighter uppercase text-white leading-none mb-1">
                                Sandesh <span className="text-neutral-500 italic">Surwase</span>
                            </h2>
                            <p className="text-[10px] font-black tracking-[0.4em] text-emerald-500 uppercase leading-none">
                                Neural Labs
                            </p>
                        </div>
                    </div>
                    <p className="text-neutral-500 text-sm max-w-sm leading-relaxed font-medium">
                        Redefining the digital fashion architecture through high-fidelity neural synthesis and automated spatial turnarounds. Welcome to the future of retail.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all">
                            <Twitter size={18} />
                        </a>
                        <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all">
                            <Instagram size={18} />
                        </a>
                        <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all">
                            <Github size={18} />
                        </a>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-8">Infrastructure</h3>
                    <ul className="space-y-4">
                        <li><Link href="/" className="text-sm font-bold text-neutral-400 hover:text-white transition-colors">Archive_Collection</Link></li>
                        <li><Link href="/dragon" className="text-sm font-bold text-neutral-400 hover:text-white transition-colors">Synthesis_Studio</Link></li>
                        <li><Link href="/v-round" className="text-sm font-bold text-neutral-400 hover:text-white transition-colors">Spatial_Turnaround</Link></li>
                    </ul>
                </div>

                {/* Attributions & Contact */}
                <div>
                    <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-8">Connectivity</h3>
                    <ul className="space-y-6">
                        <li className="flex items-center gap-3 text-sm font-bold text-neutral-400">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <Mail size={14} />
                            </div>
                            <span>labs@surwase.me</span>
                        </li>
                    </ul>
                    <div className="mt-12 pt-8 border-t border-white/5">
                        <p className="text-[9px] text-neutral-700 leading-loose uppercase tracking-widest font-black italic">
                            spatial assets <br />
                            <a href="https://iconscout.com" className="text-neutral-500 hover:text-emerald-400 transition-colors underline" target="_blank" rel="noopener noreferrer">neural core v.04</a>
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.3em]">
                        &copy; {new Date().getFullYear()} Sandesh Surwase Neural Labs S.S.R
                    </p>
                </div>
                <div className="flex gap-10">
                    <a href="#" className="text-[10px] text-neutral-700 font-bold uppercase tracking-widest hover:text-white transition-colors">Privacy_Protocol</a>
                    <a href="#" className="text-[10px] text-neutral-700 font-bold uppercase tracking-widest hover:text-white transition-colors">Service_Terms</a>
                </div>
            </div>
        </footer>
    );
}
