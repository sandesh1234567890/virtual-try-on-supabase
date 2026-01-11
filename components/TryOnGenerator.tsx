import { useState, ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/products';
import { Upload, X, Loader2, Download, Sparkles, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

interface TryOnGeneratorProps {
    product?: Product; // Product is now optional
    onClose: () => void;
}

export default function TryOnGenerator({ product, onClose }: TryOnGeneratorProps) {
    // User Photo State
    const [userImage, setUserImage] = useState<string | null>(null);

    // Custom Garment State (only used if product is undefined)
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
    const resizeImage = (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
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
                resolve(canvas.toDataURL('image/jpeg', 0.8));
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
        // Simple client-side validation could be added here
        setGarmentImage(garmentUrl);
    };

    const handleGenerate = async () => {
        if (!userImage || !garmentImage) return;
        setIsGenerating(true);
        setError(null);

        try {
            // 1. Fetch User Image as Blob (Always local upload)
            const userBlob = await (await fetch(userImage)).blob();
            const formData = new FormData();
            formData.append('userImage', userBlob);
            formData.append('productName', product?.name || 'custom garment');

            // 2. Handle Garment Image
            // If it's a URL input (external), send URL to backend to avoid CORS.
            // If it's a Product (internal path) or Upload (blob url), fetch it here.

            if (garmentInputType === 'url' && !product) {
                // Send URL string
                formData.append('garmentImageUrl', garmentImage);
            } else {
                // Fetch blob (Product image or User Upload)
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh]">

                {/* Left Side: Controls & Inputs */}
                <div className="w-full md:w-1/3 md:p-6 p-4 bg-gray-50 border-r border-gray-100 flex flex-col gap-6 overflow-y-auto relative no-scrollbar">
                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 md:hidden p-2 bg-white rounded-full shadow-sm z-10"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>

                    <div className="flex items-center justify-between mt-2 md:mt-0">
                        <h2 className="text-xl font-bold text-gray-900">
                            {product ? 'Try-On Studio' : 'Custom Try-On'}
                        </h2>
                        <button onClick={onClose} className="hidden md:block p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* 1. Garment Selection */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-xs">1</span>
                                Select Garment
                            </h3>

                            {product ? (
                                // Pre-selected Product View
                                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                                        <p className="text-xs text-gray-500">{product.category}</p>
                                    </div>
                                </div>
                            ) : (
                                // Custom Input View
                                <div className="space-y-3">
                                    {/* Input Type Toggles */}
                                    <div className="flex bg-gray-200 p-1 rounded-lg">
                                        <button
                                            onClick={() => setGarmentInputType('upload')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${garmentInputType === 'upload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <Upload size={14} /> Upload
                                        </button>
                                        <button
                                            onClick={() => setGarmentInputType('url')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${garmentInputType === 'url' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <LinkIcon size={14} /> URL
                                        </button>
                                    </div>

                                    {/* Upload Input */}
                                    {garmentInputType === 'upload' && (
                                        <div
                                            onClick={() => document.getElementById('garment-upload')?.click()}
                                            className={`cursor-pointer border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all ${garmentImage ? 'border-blue-300 bg-blue-50/50' : 'border-gray-300 hover:bg-gray-100'}`}
                                        >
                                            {garmentImage && !product ? (
                                                <div className="relative w-full h-32">
                                                    <Image src={garmentImage} alt="Garment" fill className="object-contain rounded" />
                                                </div>
                                            ) : (
                                                <div className="py-4">
                                                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm font-medium text-gray-600">Upload garment</p>
                                                </div>
                                            )}
                                            <input id="garment-upload" type="file" accept="image/*" className="hidden" onChange={handleGarmentFileUpload} />
                                        </div>
                                    )}

                                    {/* URL Input */}
                                    {garmentInputType === 'url' && (
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <input
                                                    type="url"
                                                    placeholder="Paste image URL..."
                                                    className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                    value={garmentUrl}
                                                    onChange={(e) => setGarmentUrl(e.target.value)}
                                                />
                                                <button
                                                    onClick={handleGarmentUrlSubmit}
                                                    className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
                                                >
                                                    Load
                                                </button>
                                            </div>
                                            {garmentImage && !product && (
                                                <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                    <Image src={garmentImage} alt="Garment" fill className="object-contain" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 2. User Upload */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-xs">2</span>
                                Upload Your Photo
                            </h3>
                            <div
                                onClick={() => document.getElementById('user-upload')?.click()}
                                className={`cursor-pointer border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all ${userImage ? 'border-blue-300 bg-blue-50/50' : 'border-gray-300 hover:bg-gray-100 hover:border-gray-400'}`}
                            >
                                {userImage ? (
                                    <div className="relative w-full aspect-[3/4] max-h-48">
                                        <Image src={userImage} alt="User" fill className="object-contain rounded-md" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity rounded-md">
                                            <p className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">Change</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-6">
                                        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-700">Add your photo</p>
                                    </div>
                                )}
                                <input id="user-upload" type="file" accept="image/*" className="hidden" onChange={handleUserFileUpload} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 flex flex-col gap-3">
                        {error && <p className="text-red-500 text-xs bg-red-50 p-2 rounded border border-red-100">{error}</p>}

                        <button
                            onClick={handleGenerate}
                            disabled={!userImage || !garmentImage || isGenerating}
                            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
                        >
                            {isGenerating && (
                                <div
                                    className="absolute inset-0 bg-blue-500/20 transition-all duration-1000 ease-linear"
                                    style={{ width: `${Math.min((elapsedTime / 12) * 100, 95)}%` }}
                                ></div>
                            )}
                            <div className="relative flex items-center gap-2">
                                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} className="text-blue-400" />}
                                {isGenerating ? `Tailoring... (${elapsedTime}s)` : 'Generate Try-On'}
                            </div>
                        </button>
                        {isGenerating && (
                            <p className="text-[10px] text-center text-gray-400 animate-pulse">
                                Estimated time: ~10 seconds
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Side: Result Area */}
                <div className="w-full md:w-2/3 bg-gray-900/5 relative flex items-center justify-center p-8 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                    {resultImage ? (
                        <div className="relative w-full h-full max-w-lg mx-auto bg-white rounded-lg shadow-2xl p-2 animate-in fade-in zoom-in duration-300 flex flex-col">
                            <div className="relative flex-1 w-full rounded-md overflow-hidden bg-gray-100">
                                <Image src={resultImage} alt="Result" fill className="object-contain" />
                            </div>
                            <div className="pt-2 flex justify-between items-center">
                                <button
                                    onClick={() => setResultImage(null)}
                                    className="text-gray-500 text-xs hover:text-gray-800 font-medium px-2 py-1"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={() => {
                                        const extension = resultMimeType.split('/')[1] || 'png';
                                        const link = document.createElement('a');
                                        link.href = resultImage;
                                        link.download = `try-on-result.${extension}`;
                                        link.click();
                                    }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700 font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95"
                                >
                                    <Download size={14} /> Download
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">
                            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-500">Ready to Magic</h3>
                            <p className="max-w-xs mx-auto text-sm mt-2 opacity-75">
                                Select a garment and your photo to see the magic happen.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
