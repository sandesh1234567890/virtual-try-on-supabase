"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User, Sparkles, Check, ShoppingBag, Plus, Image as ImageIcon, Shirt } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    suggestions?: any;
    tryOnResult?: string;
}

export default function SuggestionChatbot() {
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Welcome to the future of fashion. I am the AI Fashion Architect. How can I curate your style journey today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [productsMap, setProductsMap] = useState<Record<string, any>>({});
    
    const scrollRef = useRef<HTMLDivElement>(null);

    // FIXED NAVIGATION MAPPING
    const VIEW_MAP: Record<string, string> = {
        'home': '/',
        'catalog': '/', // Catalog is the home page in this app
        'studio': '/dragon',
        'vround': '/v-round',
        'v-round': '/v-round'
    };

    // Fetch products to populate the map for suggestions
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                if (res.ok) {
                    const data = await res.json();
                    const map: Record<string, any> = {};
                    data.forEach((p: any) => {
                        map[p.id] = { id: p.id, name: p.name, img: p.image, cat: p.category };
                    });
                    setProductsMap(map);
                }
            } catch (err) {
                console.error("Failed to fetch products for architect:", err);
            }
        };
        fetchProducts();
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (overrideInput?: string) => {
        const textToSend = overrideInput || input;
        if (!textToSend.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages.concat(userMsg).map(m => ({ role: m.role, content: m.content }))
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            let aiContent = data.choices?.[0]?.message?.content || "Information stream interrupted. Please retry.";

            // 1. Navigation Parser
            const navMatch = aiContent.match(/\[\[NAVIGATE: (.*?)\]\]/);
            if (navMatch) {
                const viewName = navMatch[1].trim().toLowerCase();
                const targetPath = VIEW_MAP[viewName] || viewName;
                
                // Strip tag from UI
                aiContent = aiContent.replace(/\[\[NAVIGATE: (.*?)\]\]/g, '').trim();

                setTimeout(() => {
                    if (pathname !== targetPath) {
                        router.push(targetPath);
                    }
                }, 1500);
            }

            // 2. Suggestions Parser
            const suggestionMatch = aiContent.match(/\[\[SUGGESTIONS:?\s*({[\s\S]*?})\s*\]\]/i);
            let suggestions = null;
            if (suggestionMatch) {
                try {
                    suggestions = JSON.parse(suggestionMatch[1].trim());
                    aiContent = aiContent.replace(/\[\[SUGGESTIONS:?\s*({[\s\S]*?})\s*\]\]/gi, '').trim();
                } catch (e) {
                    console.error("Suggestions parse error", e);
                }
            }

            setMessages(prev => [...prev, { role: 'assistant', content: aiContent, suggestions }]);
        } catch (error: any) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Neural Link Error: ${error.message}. Checking synapse integrity...` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-sans">
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(99, 102, 241, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #6366f1 !important;
                    border-radius: 10px;
                    border: 2px solid rgba(0, 0, 0, 0.1);
                    min-height: 40px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #4f46e5 !important;
                }
            `}} />
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-20 right-0 w-[92vw] sm:w-[420px] h-[600px] max-h-[85vh] liquid-glass flex flex-col shadow-2xl shadow-indigo-500/20 border border-white/10"
                    >
                        {/* Scanning Bar Animation */}
                        {isLoading && <div className="scanning-bar" />}

                        {/* Header */}
                        <div className="p-5 border-b border-indigo-500/10 flex items-center justify-between bg-black/40 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-neural-pulse shadow-[0_0_8px_#6366f1]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white tracking-widest uppercase">Fashion Architect</h3>
                                    <p className="text-[10px] text-indigo-400 font-medium tracking-tight">Neural Synapse Active</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-indigo-300"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent)] scroll-smooth"
                        >
                            {messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i}
                                    className={cn(
                                        "flex flex-col",
                                        msg.role === 'user' ? "items-end" : "items-start"
                                    )}
                                >
                                    <div className={cn(
                                        "max-w-[88%] p-3.5 text-[13.5px] leading-relaxed",
                                        msg.role === 'user'
                                            ? "bg-indigo-600 text-white rounded-2xl rounded-tr-none shadow-lg shadow-indigo-600/30 font-medium"
                                            : "bg-white/10 border border-white/10 text-indigo-50 rounded-2xl rounded-tl-none backdrop-blur-sm shadow-md"
                                    )}>
                                        {msg.content}
                                    </div>

                                    {/* Suggestion Cards */}
                                    {msg.suggestions && (
                                        <div className="mt-3 grid grid-cols-1 gap-2 w-full max-w-[90%]">
                                            {Object.entries(msg.suggestions).map(([cat, ids]) => {
                                                if (!Array.isArray(ids)) return null;
                                                return ids.map(id => {
                                                    const product = productsMap[id];
                                                    if (!product) return null;
                                                    return (
                                                        <div key={id} className="flex items-center gap-3 p-2.5 bg-black/60 border border-white/10 rounded-xl hover:border-indigo-500/40 transition-all group overflow-hidden">
                                                            <div className="w-14 h-16 bg-white/5 rounded-lg overflow-hidden shrink-0 border border-white/5">
                                                                <img src={product.img} className="w-full h-full object-cover" alt={product.name} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[11px] text-white font-bold truncate leading-tight">{product.name}</p>
                                                                <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mt-1 opacity-80">{cat}</p>
                                                            </div>
                                                            <button 
                                                                onClick={() => {
                                                                    window.dispatchEvent(new CustomEvent('dragon-select', { detail: { cat: product.cat, item: product } }));
                                                                }}
                                                                className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </div>
                                                    );
                                                });
                                            })}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="text-[11px] text-indigo-400 font-bold uppercase tracking-widest animate-pulse flex items-center gap-2">
                                    <Bot size={14} className="animate-bounce" />
                                    Synthesizing Style...
                                </div>
                            )}
                        </div>

                        {/* Interactive Suggestions (Pinned at Bottom above Input) */}
                        <div className="px-5 py-2.5 bg-black/40 border-t border-white/5 flex gap-2 overflow-x-auto custom-scrollbar scroll-smooth">
                            {['Browse Catalog', 'Go to Studio', '360° Studio', 'Cyberpunk Vibe'].map((label) => (
                                <button
                                    key={label}
                                    onClick={() => handleSend(label)}
                                    className="whitespace-nowrap px-4 py-2 bg-indigo-500/5 border border-indigo-500/20 rounded-full text-[11px] text-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-400 transition-all font-bold tracking-tight shadow-sm"
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-black/60 border-t border-white/10">
                            <div className="relative flex items-center gap-2 max-w-full">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Consult the Architect..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 pr-12 text-[13.5px] text-white focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-indigo-900/40"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isLoading}
                                    title="Consult Architect"
                                    className="absolute right-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 hover:scale-105 active:scale-95 disabled:opacity-30 transition-all shadow-lg shadow-indigo-600/40"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Orb */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-all animate-orb-pulse relative z-[110]",
                    isOpen ? "bg-black border border-indigo-500/50 text-indigo-400" : "bg-indigo-600 shadow-xl shadow-indigo-600/70 text-white"
                )}
            >
                {isOpen ? <X size={32} /> : <MessageSquare size={32} />}
            </motion.button>
        </div>
    );
}
