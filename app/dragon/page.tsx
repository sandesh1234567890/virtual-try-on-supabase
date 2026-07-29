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

type Product = {
    id: string;
    name: string;
    img: string;
    cat: string;
};

type Category = 'tops' | 'bottoms' | 'shoes' | 'suits' | 'dresses';

export default function DragonStudio() {
    const [products, setProducts] = useState<Record<Category, Product[]>>({
        tops: [],
        bottoms: [],
        shoes: [],
        suits: [],
        dresses: [],
    });
    const [currentCategory, setCurrentCategory] = useState<Category>('tops');
    const [userImageBase64, setUserImageBase64] = useState<string | null>(null);
    const [selections, setSelections] = useState<Record<Category, Product | null>>({
        tops: null,
        bottoms: null,
        shoes: null,
        suits: null,
        dresses: null,
    });
    const [customAssets, setCustomAssets] = useState<Record<Category, string | null>>({
        tops: null,
        bottoms: null,
        shoes: null,
        suits: null,
        dresses: null,
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [notification, setNotification] = useState<{ text: string; error?: boolean } | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const customTopsInputRef = useRef<HTMLInputElement>(null);
    const customBottomsInputRef = useRef<HTMLInputElement>(null);
    const customShoesInputRef = useRef<HTMLInputElement>(null);
    const customSuitsInputRef = useRef<HTMLInputElement>(null);
    const customDressesInputRef = useRef<HTMLInputElement>(null);

    // Fetch products from DB
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();

                if (!Array.isArray(data)) {
                    console.error("Products data is not an array:", data);
                    showNotification("Error loading catalog", true);
                    return;
                }

                const grouped: Record<Category, Product[]> = {
                    tops: [],
                    bottoms: [],
                    shoes: [],
                    suits: [],
                    dresses: [],
                };

                data.forEach((p: any) => {
                    const cat = (p.category || 'tops').toLowerCase();
                    let mappedCat: Category = 'tops';

                    if (cat.includes('suit')) mappedCat = 'suits';
                    else if (cat.includes('dress')) mappedCat = 'dresses';
                    else if (cat.includes('pant') || cat.includes('bottom') || cat.includes('denim') || cat.includes('jean') || cat.includes('slack')) mappedCat = 'bottoms';
                    else if (cat.includes('shoe') || cat.includes('kick') || cat.includes('footwear') || cat.includes('boot')) mappedCat = 'shoes';
                    else mappedCat = 'tops';

                    grouped[mappedCat].push({
                        id: p.id,
                        name: p.name || 'Untitled Item',
                        img: p.image || '',
                        cat: mappedCat
                    });
                });

                setProducts(grouped);
            } catch (err) {
                console.error("Failed to fetch products:", err);
                showNotification("Failed to fetch catalog", true);
            }
        };
        fetchProducts();
    }, []);

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

            if (selections.tops || selections.suits || selections.dresses) {
                const item = selections.tops || selections.suits || selections.dresses;
                const b64 = await urlToBase64(item!.img);
                if (b64) {
                    images.push(b64);
                    mapping.push(`IMAGE ${currentIndex}: The TOP garment (${item!.name})`);
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
Perform a high-fidelity neural synthesis by applying the following combo onto the person in the provided photo: ${activeCombo.join(', ')}.

Neural Layering Instructions:
1. TORSO: Map the TOP garment onto the body torso. Ensure it layers naturally over the waistband (tucked or untucked based on style).
2. LEGS: Map the BOTTOM garment onto the legs. Ensure the hem falls realistically over the footwear.
3. FEET: Replace footwear with selected SHOES. CRITICAL: EXACT MATCH required. If shoes are RED, output MUST be RED. Do NOT default to black boots.

CONSTRAINTS:
- PRESERVE the exact face, pose, and original background from the user source photo.
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

    const selectItem = (cat: Category, item: Product) => {
        setSelections(prev => ({
            ...prev,
            [cat]: prev[cat]?.id === item.id ? null : item
        }));
    };

    const clearSelections = () => {
        setSelections({ tops: null, bottoms: null, shoes: null, suits: null, dresses: null });
    };

    const resetApp = () => {
        setUserImageBase64(null);
        setResultImage(null);
        clearSelections();
        setCustomAssets({ tops: null, bottoms: null, shoes: null, suits: null, dresses: null });
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
        <div className="min-h-screen bg-[#050505] text-[#f1f5f9] font-sans selection:bg-emerald-500/30 relative overflow-x-hidden">
            {/* Cinematic Background Video */}
            <video
                autoPlay
                muted
                loop
                playsInline
                className="fixed inset-0 w-full h-full object-cover z-0 opacity-20 mix-blend-screen"
            >
                <source 
                    src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260306_074215_04640ca7-042c-45d6-bb56-58b1e8a42489.mp4" 
                    type="video/mp4" 
                />
            </video>

            {/* Content Overlays */}
            <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-transparent to-black z-0 pointer-events-none"></div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Inter:wght@300;400;600;700;900&display=swap');
                
                .brand-font {
                    font-family: 'Cinzel', serif;
                }

                .custom-scrollbar {
                    scroll-behavior: smooth;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(16, 185, 129, 0.4);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(16, 185, 129, 0.7);
                }

                .card-active {
                    border-color: #10b981 !important;
                    background: rgba(16, 185, 129, 0.1) !important;
                    box-shadow: 0 0 30px rgba(16, 185, 129, 0.2);
                    transform: translateY(-2px);
                }

                .btn-emerald {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                }

                @keyframes scanline {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }

                .scanner-bar {
                    height: 2px;
                    background: linear-gradient(to right, transparent, #10b981, transparent);
                    box-shadow: 0 0 15px #10b981;
                    animation: scanline 3s linear infinite;
                }
            `}</style>

            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-black/20 backdrop-blur-3xl border-b border-white/5 h-20 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-4 group shrink-0">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-2xl shadow-2xl transition-all group-hover:scale-110 group-hover:bg-emerald-500 group-hover:border-emerald-500">
                                <Flame className="text-emerald-500 group-hover:text-black h-5 w-5 md:h-6 md:w-6 transition-colors" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-base md:text-xl font-black tracking-tighter uppercase brand-font text-white leading-none mb-1">
                                    Combo Studio
                                </h1>
                                <span className="text-[10px] font-black tracking-[0.4em] text-emerald-500 uppercase leading-none opacity-60">Synthesis</span>
                            </div>
                        </Link>
                        <div className="flex gap-4">
                            <Link href="/" className="bg-white/5 text-white px-5 py-2.5 rounded-full border border-white/10 hover:bg-white/10 transition-all text-[10px] md:text-xs font-black flex items-center gap-2 uppercase tracking-widest shadow-2xl">
                                <ArrowLeft className="h-4 w-4" /> <span className="hidden xs:inline">Return</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-28 md:pt-36 pb-20 px-4 sm:px-6 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-10 lg:gap-16 min-h-screen relative z-10">
                {/* VISUALIZATION */}
                <div className="w-full lg:w-7/12 order-1 lg:order-2">
                    <div className="relative bg-black rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.05)] border border-white/5 flex items-center justify-center group h-[500px] lg:h-[750px]">
                        {!userImageBase64 ? (
                            <div className="text-center p-12 max-w-md w-full animate-in fade-in zoom-in duration-700">
                                <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 mx-auto flex items-center justify-center mb-10 border border-white/10 shadow-2xl group-hover:rotate-12 transition-transform duration-700">
                                    <UserPlus className="text-emerald-500 h-10 w-10" />
                                </div>
                                <h2 className="text-3xl font-black text-white mb-4 brand-font uppercase italic tracking-tighter">Capture_Signal</h2>
                                <p className="text-neutral-500 mb-10 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                    Lock identity fragments for neural re-synthesis. Standing perspective required.
                                </p>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-6 rounded-[2rem] bg-white text-black font-black hover:bg-emerald-500 transition-all shadow-2xl flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-[10px]"
                                >
                                    <UploadCloud className="h-5 w-5" /> Initialize Identification
                                </button>
                            </div>
                        ) : (
                            <div className="w-full h-full relative flex items-center justify-center bg-[#010101]">
                                <div className="absolute top-8 right-8 z-40 flex flex-col gap-4">
                                    <button onClick={resetApp} className="bg-black/60 backdrop-blur-3xl text-white p-4 rounded-full border border-white/10 hover:bg-emerald-500 hover:text-black transition-all shadow-2xl">
                                        <RotateCcw className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="absolute top-8 left-8 z-40">
                                    <span className="px-5 py-2.5 rounded-full bg-black/60 text-white font-black text-[9px] uppercase tracking-[0.4em] shadow-2xl border border-white/10 backdrop-blur-3xl flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        Signal Locked
                                    </span>
                                </div>
                                <img src={resultImage || userImageBase64} alt="Synthesis" className="max-w-full max-h-full object-contain transition-all duration-1000 p-10" />
                                {isProcessing && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/98 backdrop-blur-3xl">
                                        <div className="scanner-bar absolute w-full top-0"></div>
                                        <div className="relative mb-12">
                                            <div className="w-32 h-32 border border-white/5 rounded-full animate-pulse"></div>
                                            <div className="absolute top-0 left-0 w-32 h-32 border-t border-emerald-500 rounded-full animate-spin"></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Sparkles className="text-emerald-500 h-10 w-10" />
                                            </div>
                                        </div>
                                        <h3 className="text-emerald-500 font-mono text-[9px] tracking-[0.7em] uppercase font-black">Neural_Architecture_Recoloring</h3>
                                        <p className="text-neutral-700 text-[9px] mt-6 uppercase tracking-[0.4em] italic font-bold">Synthesizing Layers...</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* SELECTION */}
                <div className="w-full lg:w-5/12 order-2 lg:order-1 flex flex-col gap-10">
                    <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-10 backdrop-blur-3xl flex-1 flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-2xl font-black brand-font italic uppercase text-white">Archive_Selection</h2>
                                <p className="text-[9px] text-neutral-600 uppercase tracking-widest font-black">Neural Combo Protocol</p>
                            </div>
                            <button onClick={clearSelections} className="text-[10px] font-black uppercase text-neutral-500 hover:text-emerald-500 transition-all border border-white/5 px-5 py-2.5 rounded-2xl bg-white/5 shadow-2xl">Reset_V</button>
                        </div>
                        
                        {/* Tabs */}
                        <div className="flex p-1.5 bg-black/40 rounded-2xl mb-8 border border-white/5 backdrop-blur-3xl overflow-x-auto no-scrollbar shadow-inner">
                            {(['tops', 'bottoms', 'shoes', 'suits', 'dresses'] as const).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCurrentCategory(cat)}
                                    className={cn(
                                        "flex-1 px-5 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                        currentCategory === cat ? "bg-white text-black shadow-2xl" : "text-neutral-500 hover:text-white"
                                    )}
                                >
                                    {cat === 'shoes' ? 'Kicks' : cat}
                                </button>
                            ))}
                        </div>

                        {/* Custom neural Upload asset */}
                        <div className="mb-8">
                            <div
                                onClick={() => {
                                    if (currentCategory === 'tops') customTopsInputRef.current?.click();
                                    if (currentCategory === 'bottoms') customBottomsInputRef.current?.click();
                                    if (currentCategory === 'shoes') customShoesInputRef.current?.click();
                                    if (currentCategory === 'suits') customSuitsInputRef.current?.click();
                                    if (currentCategory === 'dresses') customDressesInputRef.current?.click();
                                }}
                                className={cn(
                                    "relative group cursor-pointer rounded-[2rem] overflow-hidden border transition-all duration-700 flex items-center gap-6 p-5",
                                    customAssets[currentCategory] ? "border-emerald-500/50 bg-emerald-500/5 shadow-2xl shadow-emerald-500/10" : "border-white/5 bg-white/5 hover:border-emerald-500/30 hover:bg-white/10"
                                )}
                            >
                                <div className="w-14 h-14 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all duration-700 shrink-0">
                                    {customAssets[currentCategory] ? (
                                        <img src={customAssets[currentCategory]!} className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <Plus className="h-6 w-6 text-neutral-500 group-hover:text-emerald-500" />
                                    )}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                                        {customAssets[currentCategory] ? 'Signal Active' : 'Neural Fragment'}
                                    </span>
                                    <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest leading-none">
                                        {customAssets[currentCategory] ? 'Access Neural Node' : `Upload personal ${currentCategory}`}
                                    </span>
                                </div>
                                <div className="ml-auto w-2 h-2 rounded-full bg-white/10 group-hover:bg-emerald-500 transition-colors"></div>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-2 gap-6 overflow-y-auto pr-3 custom-scrollbar h-[450px] scroll-smooth pb-10">
                            {products[currentCategory].map((item) => {
                                const active = selections[currentCategory]?.id === item.id;
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => selectItem(currentCategory, item)}
                                        className="group cursor-pointer flex flex-col gap-3.5"
                                    >
                                        <div className={cn(
                                            "relative rounded-[2rem] overflow-hidden border transition-all duration-700 aspect-[4/5] bg-black shadow-2xl",
                                            active ? "border-emerald-500 scale-[1.05] ring-8 ring-emerald-500/5 shadow-emerald-500/10" : "border-white/5 hover:border-white/20"
                                        )}>
                                            <img src={item.img} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                                            {active && (
                                                <div className="absolute top-4 right-4 bg-emerald-500 p-2 rounded-full z-20 border-4 border-black shadow-2xl">
                                                    <Check className="text-black h-3 w-3" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40"></div>
                                        </div>
                                        <div className="px-2">
                                            <p className={cn(
                                                "text-[10px] font-black uppercase tracking-widest transition-colors leading-tight",
                                                active ? "text-emerald-500" : "text-neutral-600 group-hover:text-white"
                                            )}>
                                                {item.name}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Buffer Tray & Ignite Button */}
                        <div className="mt-auto pt-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">Neural_Buffer</h3>
                                <div className="flex gap-2">
                                    {Object.values(selections).filter(Boolean).map((_, i) => (
                                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={isProcessing}
                                className="relative w-full py-7 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.5em] transition-all duration-700 overflow-hidden group bg-white text-black shadow-[0_0_50px_rgba(255,255,255,0.1)] active:scale-95 disabled:grayscale"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-4">
                                    <Sparkles className="h-5 w-5" /> Initialize Synthesis
                                </span>
                                <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
        </>
    );
}

