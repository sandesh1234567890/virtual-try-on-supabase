import { useState, ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/products';
import { Upload, X, Loader2, Download, Sparkles, Link as LinkIcon, Image as ImageIcon, Camera, Wand2 } from 'lucide-react';

interface TryOnGeneratorProps {
    product?: Product;
    onClose: () => void;
}

export default function TryOnGenerator({ product, onClose }: TryOnGeneratorProps) {
    // User Photo State
    const [userImage, setUserImage] = useState<string | null>(null);

    // Custom Garment State
    const [garmentImage, setGarmentImage] = useState<string | null>(product?.image || null);
    const [garmentInputType, setGarmentInputType] = useState<'upload' | 'url'>('upload');
    const [garmentUrl, setGarmentUrl] = useState('');

    // Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [resultMimeType, setResultMimeType] = useState<string>('image/png');
    const [error, setError] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Resize helper
    const resizeImage = (base64Str: string, maxWidth = 1200, maxHeight = 1200): Promise<string> => {
        return new Promise((resolve) => {
            const img = new (window as any).Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.9));
            };
        });
    };

    // Timer Effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isGenerating) {
            setElapsedTime(0);
            interval = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(interval);
    }, [isGenerating]);

    const handleUserFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const base64 = ev.target?.result as string;
                const resized = await resizeImage(base64);
                setUserImage(resized);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGarmentFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const base64 = ev.target?.result as string;
                const resized = await resizeImage(base64);
                setGarmentImage(resized);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGarmentUrlSubmit = () => {
        if (!garmentUrl) return;
        setGarmentImage(garmentUrl);
    };

    const handleGenerate = async () => {
        if (!userImage || !garmentImage) return;
        setIsGenerating(true);
        setError(null);

        try {
            const userBlob = await (await fetch(userImage)).blob();
            const formData = new FormData();
            formData.append('userImage', userBlob);
            formData.append('productName', product?.name || 'custom garment');

            if (garmentInputType === 'url' && !product) {
                formData.append('garmentImageUrl', garmentImage);
            } else {
                const garmentBlob = await (await fetch(garmentImage)).blob();
                formData.append('garmentImage', garmentBlob);
            }

            const response = await fetch('/api/virtual-try-on', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to generate try-on');
            }

            const data = await response.json();
            if (data.image) {
                setResultMimeType(data.mimeType || 'image/png');
                setResultImage(`data:${data.mimeType || 'image/png'};base64,${data.image}`);
            } else {
                throw new Error('No image returned');
            }

        } catch (err: any) {
            console.error("TryOn Error:", err);
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-6xl bg-slate-950/80 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] relative backdrop-blur-xl">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-black/50 text-white/70 hover:bg-red-500 hover:text-white transition-all border border-white/5 backdrop-blur-md"
                >
                    <X size={20} />
                </button>

                {/* Left Side: Controls */}
                <div className="w-full md:w-[400px] flex-shrink-0 bg-slate-900/50 border-r border-white/5 flex flex-col relative z-10">
                    <div className="p-8 border-b border-white/5 bg-gradient-to-b from-slate-900 to-transparent">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                                <Sparkles size={18} className="text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">
                                {product ? 'Curated Fit' : 'Custom Labs'}
                            </h2>
                        </div>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed pl-11">
                            Neural fabrication engine active.
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                        {/* Step 1: Garment */}
                        <div className="space-y-4 animate-in slide-in-from-left-4 duration-500 delay-100">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-5 h-5 rounded bg-slate-800 text-white flex items-center justify-center text-[10px]">01</span>
                                Garment Source
                            </h3>

                            {product ? (
                                <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5 flex gap-4 items-center group hover:bg-slate-800 transition-colors">
                                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-950 shadow-lg">
                                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{product.name}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{product.category}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex p-1 bg-slate-950/50 rounded-lg border border-white/5">
                                        <button
                                            onClick={() => setGarmentInputType('upload')}
                                            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${garmentInputType === 'upload' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            Upload File
                                        </button>
                                        <button
                                            onClick={() => setGarmentInputType('url')}
                                            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${garmentInputType === 'url' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            Image URL
                                        </button>
                                    </div>

                                    {garmentInputType === 'upload' ? (
                                        <div
                                            onClick={() => document.getElementById('garment-upload')?.click()}
                                            className={`group relative h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${garmentImage ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-800 hover:border-slate-600 hover:bg-slate-800/30'}`}
                                        >
                                            {garmentImage ? (
                                                <Image src={garmentImage} alt="Garment" fill className="object-contain" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-3 text-slate-500 group-hover:text-slate-300">
                                                    <div className="p-3 rounded-full bg-slate-900 group-hover:scale-110 transition-transform">
                                                        <ImageIcon size={20} />
                                                    </div>
                                                    <span className="text-xs font-medium">Drop garment image</span>
                                                </div>
                                            )}
                                            <input id="garment-upload" type="file" accept="image/*" className="hidden" onChange={handleGarmentFileUpload} />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <input
                                                    type="url"
                                                    placeholder="Paste image URL..."
                                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                                                    value={garmentUrl}
                                                    onChange={(e) => setGarmentUrl(e.target.value)}
                                                />
                                                <button onClick={handleGarmentUrlSubmit} className="bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-bold border border-white/5 hover:bg-slate-700">Load</button>
                                            </div>
                                            {garmentImage && (
                                                <div className="relative h-40 rounded-2xl overflow-hidden border border-white/5 bg-slate-950">
                                                    <Image src={garmentImage} alt="Garment" fill className="object-contain" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Step 2: User Photo */}
                        <div className="space-y-4 animate-in slide-in-from-left-4 duration-500 delay-200">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-5 h-5 rounded bg-slate-800 text-white flex items-center justify-center text-[10px]">02</span>
                                Human Specimen
                            </h3>

                            <div
                                onClick={() => document.getElementById('user-upload')?.click()}
                                className={`group relative h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${userImage ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-800 hover:border-slate-600 hover:bg-slate-800/30'}`}
                            >
                                {userImage ? (
                                    <>
                                        <Image src={userImage} alt="User" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                            <p className="text-xs text-white text-center font-medium">Ready for Synthesis</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-3 text-slate-500 group-hover:text-slate-300">
                                        <div className="p-3 rounded-full bg-slate-900 group-hover:scale-110 transition-transform">
                                            <Camera size={20} />
                                        </div>
                                        <span className="text-xs font-medium">Upload photo (Head-to-toe)</span>
                                    </div>
                                )}
                                <input id="user-upload" type="file" accept="image/*" className="hidden" onChange={handleUserFileUpload} />
                            </div>
                        </div>

                    </div>

                    {/* Action Footer */}
                    <div className="p-6 border-t border-white/5 bg-slate-900/50 backdrop-blur-md">
                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleGenerate}
                            disabled={!userImage || !garmentImage || isGenerating}
                            className="w-full relative group overflow-hidden rounded-xl bg-blue-600 p-[1px] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-100 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative bg-slate-900 group-hover:bg-slate-900/0 rounded-xl px-5 py-4 transition-all">
                                <div className="flex items-center justify-center gap-3">
                                    {isGenerating ? (
                                        <>
                                            <Loader2 size={18} className="text-white animate-spin" />
                                            <span className="text-white font-bold text-sm tracking-wide">Synthesizing... {elapsedTime}s</span>
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 size={18} className="text-blue-400 group-hover:text-white transition-colors" />
                                            <span className="text-white font-bold text-sm tracking-wide uppercase">Initiate Try-On</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Right Side: Visualizer */}
                <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
                    {/* Grid Background */}
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}></div>

                    {resultImage ? (
                        <div className="relative z-10 w-full h-full p-8 flex flex-col animate-in fade-in zoom-in duration-500">
                            <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/50 backdrop-blur-sm group">
                                <Image src={resultImage} alt="Result" fill className="object-contain" />

                                {/* Overlay Controls */}
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setResultImage(null)}
                                        className="p-2 bg-black/60 text-white rounded-lg hover:bg-slate-800 backdrop-blur-md border border-white/10"
                                        title="Discard"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-center">
                                <button
                                    onClick={() => {
                                        const extension = resultMimeType.split('/')[1] || 'png';
                                        const link = document.createElement('a');
                                        link.href = resultImage;
                                        link.download = `neural-fit-${Date.now()}.${extension}`;
                                        link.click();
                                    }}
                                    className="px-8 py-3 bg-white text-black rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2"
                                >
                                    <Download size={16} /> Save to Gallery
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center z-10 max-w-md p-6">
                            <div className="w-24 h-24 rounded-[2rem] bg-slate-900 border border-slate-800 mx-auto mb-6 flex items-center justify-center relative group">
                                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/30 transition-all"></div>
                                <Sparkles size={32} className="text-blue-500 relative z-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Ready for Input</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Upload your photo and a garment to begin the neural mapping process. High-resolution inputs yield the best results.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
