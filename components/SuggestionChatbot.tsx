"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles, Check, ShoppingBag, Plus, Image as ImageIcon, Shirt } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    suggestions?: {
        tops?: string[] | null;
        pants?: string[] | null;
        shoes?: string[] | null;
    };
}

const PRODUCTS_MAP: Record<string, any> = {
    't1': { id: 't1', name: 'Midnight Dragon Tee (Black)', img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=400', cat: 'tops' },
    't2': { id: 't2', name: 'Crimson Tech Hoodie (Red)', img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=400', cat: 'tops' },
    't3': { id: 't3', name: 'Imperial Oxford (White)', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=400', cat: 'tops' },
    't4': { id: 't4', name: 'Cyber Mesh (Grey)', img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=400', cat: 'tops' },
    'b1': { id: 'b1', name: 'Cargo Tech Pants (Black)', img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=400', cat: 'bottoms' },
    'b2': { id: 'b2', name: 'Architecture Denim (Blue)', img: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&q=80&w=400', cat: 'bottoms' },
    'b3': { id: 'b3', name: 'Stealth Slacks (Grey)', img: 'https://images.unsplash.com/photo-1551488852-081bd4c9028c?auto=format&fit=crop&q=80&w=400', cat: 'bottoms' },
    's1': { id: 's1', name: 'Talon Lows (Black)', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400', cat: 'shoes' },
    's2': { id: 's2', name: 'Pulse Runners (White)', img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=400', cat: 'shoes' },
    's3': { id: 's3', name: 'Scale-Lock Boots (Brown)', img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=400', cat: 'shoes' },
};

export default function SuggestionChatbot({ onSelect }: { onSelect?: (cat: string, item: any) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! I'm your Dragon Studio personal stylist. What occasion are you dressing for today? (e.g., Casual hangout, Cyberpunk party, Minimalist work day)" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages.concat(userMsg).map(m => ({ role: m.role, content: m.content })),
                    image: selectedImage
                })
            });

            // Clear image after sending
            setSelectedImage(null);

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            const aiContent = data.choices[0].message.content;

            // Extract suggestions
            const suggestionMatch = aiContent.match(/\[\[SUGGESTIONS: (.*?)\]\]/);
            let suggestions = null;
            let cleanContent = aiContent;

            if (suggestionMatch) {
                try {
                    suggestions = JSON.parse(suggestionMatch[1]);
                    cleanContent = aiContent.replace(/\[\[SUGGESTIONS: (.*?)\]\]/, '').trim();
                } catch (e) {
                    console.error("Failed to parse suggestions", e);
                }
            }

            setMessages(prev => [...prev, { role: 'assistant', content: cleanContent, suggestions }]);
        } catch (error: any) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}. Please make sure your OpenAI API key is configured.` }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const actionChips = [
        { label: "Suggest Outfit", icon: <Shirt className="w-3 h-3" /> },
        { label: "Cyberpunk Vibe", icon: <Sparkles className="w-3 h-3" /> },
        { label: "Casual Look", icon: <ShoppingBag className="w-3 h-3" /> },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-[60]">
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(249, 115, 22, 0.3);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(249, 115, 22, 0.5);
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />
            {/* Chat Window */}
            <div className={cn(
                "absolute bottom-20 right-0 w-[calc(100vw-3rem)] sm:w-[380px] h-[550px] bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden transition-all duration-500 origin-bottom-right shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] flex flex-col",
                isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-10 pointer-events-none"
            )}>
                {/* Header */}
                <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20">
                            <Sparkles className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold brand-font tracking-wider">Dragon Stylist</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Neural Logic Active</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Messages Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth min-h-0"
                >
                    {messages.map((msg, idx) => (
                        <div key={idx} className={cn(
                            "flex flex-col",
                            msg.role === 'user' ? "items-end" : "items-start"
                        )}>
                            <div className={cn(
                                "max-w-[85%] p-4 text-[13px] leading-relaxed shadow-lg whitespace-pre-wrap",
                                msg.role === 'user'
                                    ? "bg-orange-500 text-white rounded-2xl rounded-tr-none"
                                    : "bg-slate-900/50 border border-white/5 text-slate-300 rounded-2xl rounded-tl-none font-medium"
                            )}>
                                {msg.content.replace(/\*\*/g, '')}
                            </div>

                            {/* User-uploaded image in chat */}
                            {msg.role === 'user' && idx === messages.length - 1 && selectedImage && (
                                <div className="mt-2 relative group w-24 h-24 rounded-xl overflow-hidden border border-white/10">
                                    <img src={selectedImage} className="w-full h-full object-cover" />
                                </div>
                            )}

                            {/* Suggestions Cards - Multi-Grid Layout */}
                            {msg.suggestions && (
                                <div className="mt-4 grid grid-cols-1 gap-2 w-full">
                                    {Object.entries(msg.suggestions).map(([cat, ids]) => {
                                        if (!ids || !Array.isArray(ids)) return null;

                                        return ids.map(id => {
                                            const product = PRODUCTS_MAP[id];
                                            if (!product) return null;

                                            return (
                                                <div
                                                    key={id}
                                                    className="bg-slate-900/80 border border-white/10 rounded-2xl p-2.5 flex items-center gap-3 group hover:border-orange-500/30 transition-all duration-300"
                                                >
                                                    <div className="w-16 h-20 relative shrink-0">
                                                        <img
                                                            src={product.img}
                                                            className="w-full h-full object-cover rounded-xl"
                                                            alt={product.name}
                                                        />
                                                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl"></div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-orange-500/80 leading-none mb-1.5">
                                                            {cat === 'bottoms' || cat === 'pants' ? 'PANT' : cat === 'shoes' ? 'SHOES' : 'TOP'}
                                                        </p>
                                                        <p className="text-[12px] font-bold text-white truncate leading-tight">{product.name}</p>
                                                        <p className="text-[10px] text-slate-500 mt-1">Neural Style Match</p>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            if (onSelect) onSelect(product.cat, product);
                                                            window.dispatchEvent(new CustomEvent('dragon-select', {
                                                                detail: { cat: product.cat, item: product }
                                                            }));
                                                        }}
                                                        className="p-2 bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white rounded-xl transition-all border border-orange-500/20"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            );
                                        });
                                    })}

                                    <button
                                        onClick={() => {
                                            Object.entries(msg.suggestions!).forEach(([_, ids]) => {
                                                if (ids && Array.isArray(ids)) {
                                                    ids.forEach(id => {
                                                        const p = PRODUCTS_MAP[id];
                                                        if (p) {
                                                            if (onSelect) onSelect(p.cat, p);
                                                            window.dispatchEvent(new CustomEvent('dragon-select', {
                                                                detail: { cat: p.cat, item: p }
                                                            }));
                                                        }
                                                    });
                                                }
                                            });
                                        }}
                                        className="w-full mt-1 py-3 bg-white text-black hover:bg-orange-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/50"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Sync Full Intent Look
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex items-center gap-2 text-slate-500">
                            <Sparkles className="w-4 h-4 text-orange-500/50" />
                            <div className="flex gap-1">
                                <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="px-6 pb-2 overflow-x-auto no-scrollbar flex items-center gap-2 whitespace-nowrap shrink-0">
                    {actionChips.map((chip, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setInput(chip.label);
                                // Trigger handleSend after state update might be tricky, 
                                // so we just set input for now as per "access buttons" request
                            }}
                            className="px-3 py-1.5 bg-slate-900 border border-white/5 rounded-full text-[10px] font-bold text-slate-400 hover:text-orange-400 hover:border-orange-500/30 transition-all flex items-center gap-1.5"
                        >
                            {chip.icon}
                            {chip.label}
                        </button>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-900/30 border-t border-white/5 shrink-0">
                    {selectedImage && (
                        <div className="mb-3 relative w-12 h-12 rounded-lg overflow-hidden border border-orange-500 group">
                            <img src={selectedImage} className="w-full h-full object-cover" />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3 text-white" />
                            </button>
                        </div>
                    )}
                    <div className="relative flex items-center gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "p-3 rounded-2xl border transition-all",
                                selectedImage
                                    ? "bg-orange-500/10 border-orange-500/50 text-orange-500"
                                    : "bg-slate-950/80 border-white/10 text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type for style advice..."
                                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl py-3.5 pl-4 pr-12 text-[13px] text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-all"
                            />
                            <button
                                onClick={handleSend}
                                disabled={(!input.trim() && !selectedImage) || isTyping}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 transition-all"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Float Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-16 h-16 rounded-[1.75rem] flex items-center justify-center transition-all duration-500 shadow-[0_20px_40px_-12px_rgba(249,115,22,0.4)] group overflow-hidden relative",
                    isOpen
                        ? "bg-slate-900 border border-white/10 scale-90"
                        : "bg-gradient-to-br from-orange-400 to-orange-600 border border-orange-400/20 hover:scale-110 active:scale-95"
                )}
            >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {isOpen ? (
                    <X className="w-7 h-7 text-white" />
                ) : (
                    <div className="flex flex-col items-center">
                        <Sparkles className="w-7 h-7 text-white animate-pulse" />
                    </div>
                )}
            </button>
        </div>
    );
}
