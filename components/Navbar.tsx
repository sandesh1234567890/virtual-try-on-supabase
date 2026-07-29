'use client';

import Link from 'next/link';
import { ShoppingBag, Zap, User, LogOut, History, Loader2, Package } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { isAdmin } from '@/utils/admin';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    return (
        <header className="fixed top-0 z-[60] w-full border-b border-white/5 bg-black/20 backdrop-blur-3xl transition-all duration-500 hover:bg-black/40">
            <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-3 group shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white shadow-2xl transition-all group-hover:scale-110 group-hover:bg-white/10 group-hover:border-white/20">
                        <ShoppingBag size={20} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black tracking-tighter text-white font-outfit leading-none mb-0.5">
                            SANDESH
                        </span>
                        <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase leading-none">
                            SURWASE
                        </span>
                    </div>
                </Link>

                <nav className="flex items-center gap-4 sm:gap-8">
                    <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-neutral-400">
                        <Link href="/" className="hover:text-white transition-colors">Experience</Link>
                        <Link href="/" className="hover:text-white transition-colors">Curation</Link>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <Link href="/v-round" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white shadow-xl hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest">
                            <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                            <span>V-ROUND <span className="text-neutral-500">PRO</span></span>
                        </Link>

                        {loading ? (
                            <div className="w-8 h-8 flex items-center justify-center">
                                <Loader2 className="animate-spin text-neutral-500" size={20} />
                            </div>
                        ) : user ? (
                            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                                <Link href="/history" className="text-neutral-400 hover:text-white transition-colors">
                                    <History size={20} />
                                </Link>
                                {isAdmin(user) && (
                                    <Link href="/admin" className="text-neutral-400 hover:text-white transition-colors">
                                        <Package size={20} />
                                    </Link>
                                )}
                                <div className="relative group">
                                    {user.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="User" className="w-9 h-9 rounded-full border border-white/10 hover:border-white/30 transition-all cursor-pointer" />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all cursor-pointer">
                                            <User size={18} />
                                        </div>
                                    )}
                                    <button 
                                        onClick={handleSignOut} 
                                        className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity scale-75 hover:scale-100"
                                    >
                                        <LogOut size={12} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link href="/login" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-bold hover:bg-neutral-200 transition-all shadow-xl text-xs uppercase tracking-widest">
                                <User size={14} />
                                <span>Access AI</span>
                            </Link>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}
