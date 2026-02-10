"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    Flame,
    ShoppingBag,
    UserPlus,
    UploadCloud,
    RotateCcw,
    Zap,
    Layers,
    Trash2,
    Shirt,
    Scissors,
    Footprints,
    Check,
    Info,
    Loader2,
    AlertCircle,
    X,
    Sparkles,
    ArrowLeft,
    Plus,
    XCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';
import SuggestionChatbot from '@/components/SuggestionChatbot';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const PRODUCTS = {
    tops: [
        { id: 't1', name: 'Midnight Dragon Tee (Black)', img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=400' },
        { id: 't2', name: 'Crimson Tech Hoodie (Red)', img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=400' },
        { id: 't3', name: 'Imperial Oxford (White)', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=400' },
        { id: 't4', name: 'Cyber Mesh (Grey)', img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=400' },
    ],
    bottoms: [
        { id: 'b1', name: 'Cargo Tech Pants (Black)', img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=400' },
        { id: 'b2', name: 'Architecture Denim (Blue)', img: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&q=80&w=400' },
        { id: 'b3', name: 'Stealth Slacks (Grey)', img: 'https://images.unsplash.com/photo-1551488852-081bd4c9028c?auto=format&fit=crop&q=80&w=400' },
    ],
    shoes: [
        { id: 's1', name: 'Talon Lows (Black)', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400' },
        { id: 's2', name: 'Pulse Runners (White)', img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=400' },
        { id: 's3', name: 'Scale-Lock Boots (Brown)', img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=400' },
    ]
};

type Category = keyof typeof PRODUCTS;

export default function DragonStudio() {
    const [currentCategory, setCurrentCategory] = useState<Category>('tops');
    const [userImageBase64, setUserImageBase64] = useState<string | null>(null);
    const [selections, setSelections] = useState<Record<Category, typeof PRODUCTS['tops'][0] | null>>({
        tops: null,
        bottoms: null,
        shoes: null,
    });
    const [customAssets, setCustomAssets] = useState<Record<Category, string | null>>({
        tops: null,
        bottoms: null,
        shoes: null,
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [notification, setNotification] = useState<{ text: string; error?: boolean } | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const customTopsInputRef = useRef<HTMLInputElement>(null);
    const customBottomsInputRef = useRef<HTMLInputElement>(null);
    const customShoesInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const showNotification = (text: string, error = false) => {
        setNotification({ text, error });
    };

    const urlToBase64 = async (url: string) => {
        if (url.startsWith('data:')) return url.split(',')[1];
        try {
            const resp = await fetch(url);
            const blob = await resp.blob();
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUserImageBase64(reader.result as string);
                setResultImage(null);
                showNotification("Identify Signal Locked");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCustomUpload = (cat: Category, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const b64 = reader.result as string;
                setCustomAssets(prev => ({ ...prev, [cat]: b64 }));
                setSelections(prev => ({
                    ...prev,
                    [cat]: { id: `custom-${cat}`, name: `Custom ${cat}`, img: b64 }
                }));
                showNotification(`${cat.charAt(0).toUpperCase() + cat.slice(1)} Uploaded`);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!userImageBase64) return showNotification("Identity Input Required", true);

        const activeCombo = Object.entries(selections)
            .filter(([_, val]) => val !== null)
            .map(([key, val]) => `${key.toUpperCase()}: ${val!.name}`);

        if (activeCombo.length === 0) return showNotification("Garment selection empty", true);

        setIsProcessing(true);
        setResultImage(null);

        try {
            const images = [userImageBase64.split(',')[1]];
            const mapping: string[] = ["IMAGE 1: The person (Identity, Pose, Background)"];
            let currentIndex = 2;

            if (selections.tops) {
                const b64 = await urlToBase64(selections.tops.img);
                if (b64) {
                    images.push(b64);
                    mapping.push(`IMAGE ${currentIndex}: The TOP garment (${selections.tops.name})`);
                    currentIndex++;
                }
            }

            if (selections.bottoms) {
                const b64 = await urlToBase64(selections.bottoms.img);
                if (b64) {
                    images.push(b64);
                    mapping.push(`IMAGE ${currentIndex}: The BOTTOM garment (${selections.bottoms.name})`);
                    currentIndex++;
                }
            }

            if (selections.shoes) {
                const b64 = await urlToBase64(selections.shoes.img);
                if (b64) {
                    images.push(b64);
                    mapping.push(`IMAGE ${currentIndex}: The FOOTWEAR (${selections.shoes.name})`);
                    currentIndex++;
                }
            }

            const prompt = `Virtual Try-On Fashion Task:
Perform a high-fidelity neural synthesis by applying the following combo onto the person in IMAGE 1: ${activeCombo.join(', ')}.

Neural Layering Instructions:
${selections.tops ? `1. TORSO: Map the TOP garment from IMAGE ${mapping.findIndex(m => m.includes('TOP')) + 1} onto the body torso. Ensure it layers naturally over the waistband.` : ''}
${selections.bottoms ? `2. LEGS: Map the BOTTOM garment from IMAGE ${mapping.findIndex(m => m.includes('BOTTOM')) + 1} onto the legs. Ensure the hem falls realistically over the footwear.` : ''}
${selections.shoes ? `3. FEET: Replace footwear with selected SHOES from IMAGE ${mapping.findIndex(m => m.includes('FOOTWEAR')) + 1}.` : ''}

CONSTRAINTS:
- **IDENTITY LOCK**: PRESERVE the exact face, pose, and original background from IMAGE 1. Any alteration to the persona is a FAILURE.
- Output only the final synthesized high-resolution image result.`;

            const response = await fetch('/api/combo-try-on', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, images })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `API Error: ${response.status}`);
            }

            const result = await response.json();
            const imagePart = result.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

            if (imagePart?.inlineData?.data) {
                setResultImage(`data:image/png;base64,${imagePart.inlineData.data}`);
                showNotification("Combo Synthesized Successfully");
            } else {
                const textRefusal = result.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text;
                throw new Error(textRefusal || "Synthesis failed: No image data returned.");
            }
        } catch (err: any) {
            console.error(err);
            showNotification(err.message, true);
        } finally {
            setIsProcessing(false);
        }
    };

    const selectItem = (cat: Category, item: typeof PRODUCTS['tops'][0]) => {
        setSelections(prev => ({
            ...prev,
            [cat]: prev[cat]?.id === item.id ? null : item
        }));
    };

    const clearSelections = () => {
        setSelections({ tops: null, bottoms: null, shoes: null });
    };

    const resetApp = () => {
        setUserImageBase64(null);
        setResultImage(null);
        clearSelections();
        setCustomAssets({ tops: null, bottoms: null, shoes: null });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    useEffect(() => {
        const handleGlobalSelect = (e: any) => {
            const { cat, item } = e.detail;
            selectItem(cat as Category, item);
            showNotification(`${item.name} Selected via AI`);
        };
        window.addEventListener('dragon-select', handleGlobalSelect);
        return () => window.removeEventListener('dragon-select', handleGlobalSelect);
    }, []);

    return (
        <>
            <div className="min-h-screen bg-[#020617] text-[#f1f5f9] font-sans selection:bg-orange-500/30 overflow-x-hidden">
                <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Inter:wght@300;400;600;700;900&display=swap');
                
                .brand-font {
                    font-family: 'Cinzel', serif;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #0f172a;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 10px;
                }

                .canvas-container {
                    aspect-ratio: 3/4;
                    max-height: 60vh;
                    width: 100%;
                }

                @media (min-width: 1024px) {
                    .canvas-container {
                        aspect-ratio: auto;
                        height: 100%;
                        min-height: 650px;
                    }
                }

                .card-active {
                    border-color: #f97316 !important;
                    background: rgba(249, 115, 22, 0.1) !important;
                    box-shadow: 0 0 30px rgba(249, 115, 22, 0.3);
                    transform: translateY(-2px);
                }

                .btn-gradient {
                    background: linear-gradient(135deg, #f97316 0%, #ef4444 100%);
                }

                @keyframes scanline {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }

                .scanner-bar {
                    height: 4px;
                    background: linear-gradient(to right, transparent, #f97316, transparent);
                    animation: scanline 2.5s linear infinite;
                }
            `}</style>

                {/* Hidden Custom Inputs */}
                <input type="file" ref={customTopsInputRef} className="hidden" accept="image/*" onChange={(e) => handleCustomUpload('tops', e)} />
                <input type="file" ref={customBottomsInputRef} className="hidden" accept="image/*" onChange={(e) => handleCustomUpload('bottoms', e)} />
                <input type="file" ref={customShoesInputRef} className="hidden" accept="image/*" onChange={(e) => handleCustomUpload('shoes', e)} />

                {/* Notification UI */}
                <div className={cn(
                    "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm transition-all duration-400 cubic-bezier(0.4, 0, 0.2, 1)",
                    notification ? "translate-y-0 opacity-100" : "translate-y-[200%] opacity-0"
                )}>
                    <div className="bg-slate-900/95 backdrop-blur-2xl border border-slate-700 p-4 rounded-3xl shadow-2xl flex items-center gap-4">
                        <div className={cn(
                            "p-2 rounded-xl",
                            notification?.error ? "bg-red-500/20 text-red-500" : "bg-orange-500/20 text-orange-500"
                        )}>
                            {notification?.error ? <AlertCircle className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                        </div>
                        <p className="text-sm font-bold text-slate-200 text-center flex-1">
                            {notification?.text || "System Ready"}
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="fixed w-full z-50 bg-slate-950/90 backdrop-blur-2xl border-b border-slate-800/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16 md:h-20">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-xl shadow-lg">
                                    <Flame className="text-white h-5 w-5 md:h-6 md:w-6" />
                                </div>
                                <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase brand-font bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
                                    What Your Dragon
                                </h1>
                            </div>
                            <div className="flex gap-2">
                                <Link href="/" className="bg-slate-800 text-white px-4 py-2.5 rounded-full border border-slate-700 hover:bg-slate-700 transition-all text-xs font-bold flex items-center gap-2">
                                    <ArrowLeft className="h-4 w-4" /> Home
                                </Link>
                                <button className="bg-slate-800 text-white p-2.5 rounded-full border border-slate-700 hover:bg-slate-700 transition-all">
                                    <ShoppingBag className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="pt-20 md:pt-28 pb-12 px-4 sm:px-6 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8 lg:gap-12 min-h-screen">

                    {/* VISUALIZATION */}
                    <div className="w-full lg:w-7/12 order-1 lg:order-2">
                        <div className="relative bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800/50 canvas-container flex items-center justify-center group">

                            {!userImageBase64 ? (
                                /* State: Initial Upload Panel */
                                <div className="text-center p-8 max-w-md w-full animate-in fade-in zoom-in duration-500">
                                    <div className="w-24 h-24 rounded-full bg-slate-900 mx-auto flex items-center justify-center mb-6 border border-slate-800 shadow-2xl">
                                        <UserPlus className="text-slate-500 h-10 w-10" />
                                    </div>
                                    <h2 className="text-2xl font-black text-white mb-3 brand-font uppercase italic text-center">Identity Node</h2>
                                    <p className="text-slate-400 mb-8 text-sm leading-relaxed text-center">
                                        Upload a photo of yourself standing. This will be the base for our neural garment synthesis.
                                    </p>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-5 rounded-2xl bg-white text-slate-950 font-black hover:bg-slate-100 transition-all shadow-2xl flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                                    >
                                        <UploadCloud className="h-5 w-5" /> Capture Photo
                                    </button>
                                </div>
                            ) : (
                                /* State: Active Render Display */
                                <div className="w-full h-full relative flex items-center justify-center bg-[#010101]">
                                    <div className="absolute top-6 right-6 z-40 flex flex-col gap-3">
                                        <button onClick={resetApp} className="bg-black/60 backdrop-blur-xl text-white p-3.5 rounded-full border border-white/10 hover:bg-red-600 transition-all shadow-2xl">
                                            <RotateCcw className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="absolute top-6 left-6 z-40">
                                        <span className="px-4 py-2 rounded-full bg-slate-900/90 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl border border-slate-700 backdrop-blur-md flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                            Identity Locked
                                        </span>
                                    </div>

                                    <img src={resultImage || userImageBase64} alt="Neural Synthesis Result" className="max-w-full max-h-full object-contain transition-all duration-1000" />

                                    {/* AI Synthesis Overlay */}
                                    {isProcessing && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/95 backdrop-blur-3xl">
                                            <div className="scanner-bar absolute w-full top-0"></div>
                                            <div className="relative mb-10">
                                                <div className="w-32 h-32 border-2 border-slate-800 rounded-full"></div>
                                                <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-orange-500 rounded-full animate-spin"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Zap className="text-orange-500 h-10 w-10 animate-pulse" />
                                                </div>
                                            </div>
                                            <h3 className="text-orange-400 font-mono text-[10px] tracking-[0.6em] uppercase font-black">Neural Re-Synthesis</h3>
                                            <p className="text-slate-600 text-[9px] mt-4 uppercase tracking-[0.3em] italic">Mapping Combo Layers...</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SELECTION */}
                    <div className="w-full lg:w-5/12 order-2 lg:order-1 flex flex-col gap-6">
                        <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-6 md:p-8 backdrop-blur-xl flex-1 flex flex-col shadow-2xl">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex flex-col">
                                    <h2 className="text-xl font-black brand-font italic uppercase text-white text-center sm:text-left">Wardrobe Combo</h2>
                                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mt-1">Multi-Category Selection</p>
                                </div>
                                <button onClick={clearSelections} className="text-[9px] font-black uppercase text-slate-500 hover:text-orange-500 transition-all border border-slate-800 px-3 py-1.5 rounded-lg">Reset</button>
                            </div>
                            {/* Tabs */}
                            <div className="flex p-1 bg-slate-950 rounded-2xl mb-6 border border-slate-800/50 backdrop-blur-xl shrink-0">
                                {(['tops', 'bottoms', 'shoes'] as const).map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setCurrentCategory(cat)}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all",
                                            currentCategory === cat
                                                ? "bg-slate-800/60 text-orange-400 border border-white/5"
                                                : "text-slate-500 hover:text-slate-400"
                                        )}
                                    >
                                        {cat === 'shoes' ? 'Kicks' : cat}
                                    </button>
                                ))}
                            </div>

                            {/* Custom Upload Asset */}
                            <div className="mb-6 shrink-0">
                                <div
                                    onClick={() => {
                                        if (currentCategory === 'tops') customTopsInputRef.current?.click();
                                        if (currentCategory === 'bottoms') customBottomsInputRef.current?.click();
                                        if (currentCategory === 'shoes') customShoesInputRef.current?.click();
                                    }}
                                    className={cn(
                                        "relative group cursor-pointer rounded-2xl overflow-hidden border transition-all duration-500 flex items-center gap-4 p-4",
                                        customAssets[currentCategory]
                                            ? "border-orange-500/50 bg-orange-500/5 shadow-lg shadow-orange-500/10"
                                            : "border-white/5 bg-slate-900/40 hover:border-orange-500/30 hover:bg-slate-800/20"
                                    )}
                                >
                                    <div className="w-12 h-12 bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-orange-500/10 group-hover:border-orange-500/30 transition-all duration-500 shrink-0">
                                        {customAssets[currentCategory] ? (
                                            <img src={customAssets[currentCategory]!} className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <Plus className="h-5 w-5 text-slate-400 group-hover:text-orange-400" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                                            {customAssets[currentCategory] ? 'Visual Active' : 'Neural Upload'}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                                            {customAssets[currentCategory] ? 'Click to Change' : `Personal ${currentCategory}`}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Product Grid */}
                            <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar pb-6 flex-1 min-h-0">
                                {PRODUCTS[currentCategory].map((item) => {
                                    const active = selections[currentCategory]?.id === item.id;
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => selectItem(currentCategory, item)}
                                            className="group cursor-pointer flex flex-col gap-2.5"
                                        >
                                            <div className={cn(
                                                "relative rounded-2xl overflow-hidden border transition-all duration-500 aspect-[4/5] bg-slate-950",
                                                active
                                                    ? "border-orange-500 scale-[1.02] ring-4 ring-orange-500/10"
                                                    : "border-white/5 hover:border-orange-500/20"
                                            )}>
                                                <img src={item.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100" />

                                                {active && (
                                                    <div className="absolute top-3 right-3 bg-orange-500 p-1.5 rounded-full z-20 border-2 border-slate-950 shadow-xl scale-110">
                                                        <Check className="text-white h-2.5 w-2.5" />
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                            <div className="px-1">
                                                <p className={cn(
                                                    "text-[9px] font-black uppercase tracking-[0.1em] transition-colors leading-tight",
                                                    active ? "text-orange-400" : "text-slate-500 group-hover:text-slate-300"
                                                )}>
                                                    {item.name}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Neural Tray */}
                            <div className="mt-6 pt-6 border-t border-slate-800/50">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Active Buffer</h3>
                                    <span className="text-[9px] font-bold text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-md uppercase">
                                        {Object.values(selections).filter(Boolean).length} Selected
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-3 mb-8">
                                {(['tops', 'bottoms', 'shoes'] as const).map((cat) => {
                                    const item = selections[cat];
                                    return (
                                        <div key={cat} className={cn(
                                            "flex-shrink-0 w-14 h-14 rounded-2xl border flex items-center justify-center overflow-hidden transition-all",
                                            item ? "border-orange-500 bg-slate-900 shadow-xl" : "border-dashed border-slate-800 bg-slate-950/20"
                                        )}>
                                            {item ? (
                                                <img src={item.img} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[8px] text-slate-700 font-black uppercase text-center">{cat[0]}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Synthesis Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={isProcessing}
                                className="relative w-full py-6 rounded-3xl font-black text-lg uppercase tracking-[0.3em] transition-all duration-500 overflow-hidden group btn-gradient shadow-2xl active:scale-95 disabled:opacity-50 mt-auto"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3 text-white">
                                    <Sparkles className="h-5 w-5" /> Ignite Combo
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            </button>
                        </div>
                    </div>
                </main>

                {/* Notifications */}
                {notification && (
                    <div className={cn(
                        "fixed top-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl flex items-center gap-4 z-[70] transition-all duration-500 shadow-2xl backdrop-blur-2xl border",
                        notification.error ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-orange-500/10 border-orange-500/20 text-orange-400"
                    )}>
                        {notification.error ? <AlertCircle className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                        <span className="text-sm font-black uppercase tracking-widest">{notification.text}</span>
                        <button onClick={() => setNotification(null)} className="ml-2 hover:bg-white/5 p-1 rounded-full transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

