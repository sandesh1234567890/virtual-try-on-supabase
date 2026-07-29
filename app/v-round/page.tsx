"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    Video,
    RotateCcw,
    Upload,
    Image as ImageIcon,
    Sparkles,
    Play,
    Pause,
    Download,
    AlertCircle,
    Camera,
    CheckCircle2,
    Loader2,
    X,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const ANGLES = ['front', 'right', 'back', 'left'] as const;
type Angle = typeof ANGLES[number];

export default function VRoundPro() {
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'preview'>('upload');
    const [generatedViews, setGeneratedViews] = useState<Record<Angle, string | null>>({
        front: null,
        right: null,
        back: null,
        left: null,
    });
    const [activeFrame, setActiveFrame] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const exportCanvasRef = useRef<HTMLCanvasElement>(null);

    // --- Animation Engine ---
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && currentStep === 'preview') {
            interval = setInterval(() => {
                setActiveFrame((prev) => (prev + 1) % 4);
            }, 800);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentStep]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setSourceImage(ev.target?.result as string);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetApp = () => {
        setSourceImage(null);
        setCurrentStep('upload');
        setGeneratedViews({ front: null, right: null, back: null, left: null });
        setIsPlaying(false);
        setProgress(0);
        setError(null);
    };

    const generateView = async (base64Data: string, prompt: string) => {
        const payload = {
            inlineData: {
                mimeType: "image/png",
                data: base64Data.split(',')[1]
            },
            prompt: prompt
        };

        const maxRetries = 5;
        const delays = [1000, 2000, 4000, 8000, 16000];

        for (let i = 0; i <= maxRetries; i++) {
            try {
                const response = await fetch('/api/generate-view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    if (i < maxRetries && response.status !== 400 && response.status !== 401 && response.status !== 403) {
                        await new Promise(res => setTimeout(res, delays[i]));
                        continue;
                    }
                    throw new Error(errorData?.error || `API Error: ${response.statusText}`);
                }

                const result = await response.json();
                const generatedBase64 = result.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;

                if (!generatedBase64) {
                    if (i < maxRetries) {
                        await new Promise(res => setTimeout(res, delays[i]));
                        continue;
                    }
                    throw new Error("Model failed to generate image. Please try a clearer source photo.");
                }
                return `data:image/png;base64,${generatedBase64}`;
            } catch (err: any) {
                if (i < maxRetries) {
                    await new Promise(res => setTimeout(res, delays[i]));
                    continue;
                }
                throw err;
            }
        }
    };

    const startProcessing = async () => {
        if (!sourceImage || isProcessing) return;
        setIsProcessing(true);
        setCurrentStep('processing');
        setProgress(0);
        setError(null);

        try {
            // 1. Front View (Source)
            setGeneratedViews(prev => ({ ...prev, front: sourceImage }));
            setProgress(10);

            // Parallel Request for all views
            const [rightView, backView, leftView] = await Promise.all([
                generateView(sourceImage, "Fashion turnaround: Generate a high-fidelity image showing the DISTINCT RIGHT SIDE PROFILE view. IDENTITY LOCK: Face/Body must be 100% identical. FROZEN CAMERA: Maintain the EXACT camera distance, height, and zoom as IMAGE 1. SCALE LOCK: The person must stay the same size. No close-ups. Rotation only."),
                generateView(sourceImage, "Fashion turnaround: Generate a high-fidelity image showing the FULL BACK view. FROZEN CAMERA & SCALE LOCK: Maintain identical camera framing and person size as IMAGE 1. The person turns 180 degrees. No zooming in. Preserve background depth perfectly."),
                generateView(sourceImage, "Fashion turnaround: Generate a high-fidelity image showing the DISTINCT LEFT SIDE PROFILE view. FROZEN CAMERA & SCALE LOCK: Do NOT shift position or zoom. Maintain exact persona and garment fidelity. The person faces left. Consistent studio distance.")
            ]);

            setGeneratedViews(prev => ({
                ...prev,
                right: rightView!,
                back: backView!,
                left: leftView!
            }));

            setProgress(100);

            setCurrentStep('preview');
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const exportVideo = async () => {
        if (isExporting || currentStep !== 'preview') return;
        setIsExporting(true);

        try {
            const canvas = exportCanvasRef.current!;
            const ctx = canvas.getContext('2d')!;
            const stream = canvas.captureStream(30);
            const recorder = new MediaRecorder(stream, {
                mimeType: 'video/webm',
                videoBitsPerSecond: 15000000 // 15Mbps for high quality
            });
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `vround-360-export-${Date.now()}.webm`;
                a.click();
                URL.revokeObjectURL(url);
                setIsExporting(false);
            };

            recorder.start();

            const frameUrls = [generatedViews.front, generatedViews.right, generatedViews.back, generatedViews.left];
            const images = await Promise.all(frameUrls.map(src => {
                return new Promise<HTMLImageElement>((resolve) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.src = src!;
                });
            }));

            let currentFrameCount = 0;
            const totalFramesToRecord = 12; // 3 full loops

            const recordLoop = () => {
                if (currentFrameCount >= totalFramesToRecord) {
                    recorder.stop();
                    return;
                }
                const imgIndex = currentFrameCount % 4;
                ctx.drawImage(images[imgIndex], 0, 0, canvas.width, canvas.height);
                currentFrameCount++;
                setTimeout(recordLoop, 450);
            };

            recordLoop();
        } catch (err) {
            console.error("Export failed", err);
            setIsExporting(false);
        }
    };

    return (
        <div className="bg-[#050505] text-neutral-100 min-h-screen selection:bg-emerald-500/30 font-sans relative">
            {/* Background Video */}
            <video
                autoPlay
                muted
                loop
                playsInline
                className="fixed inset-0 w-full h-full object-cover z-0 opacity-30 mix-blend-screen"
            >
                <source 
                    src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4" 
                    type="video/mp4" 
                />
            </video>
            
            {/* Ambient Overlay */}
            <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-0 pointer-events-none"></div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Inter:wght@300;400;600;700;900&display=swap');
                
                body {
                    background-color: #050505;
                }
            `}
            </style>
            <canvas ref={exportCanvasRef} width="1080" height="1440" className="hidden"></canvas>

            {/* Navigation */}
            <header className="w-full py-8 md:py-12 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between border-b border-white/5 mb-8 md:mb-12 gap-4 relative z-10 backdrop-blur-md bg-black/10">
                <div className="flex items-center gap-6 sm:gap-8 w-full sm:w-auto">
                    <Link href="/" className="bg-white/5 text-white px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shrink-0">
                        <ArrowLeft className="w-3.5 h-3.5" /> Return
                    </Link>
                    <div className="flex items-center gap-4 sm:gap-6 border-l border-white/10 pl-6 sm:pl-8 overflow-hidden">
                        <div className="bg-emerald-500 p-2.5 sm:p-3 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] shrink-0">
                            <Video className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                        </div>
                        <div className="truncate">
                            <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic truncate leading-none">V-ROUND <span className="text-emerald-500 not-italic">PRO</span></h1>
                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.3em] mt-1.5 truncate">Neural Turnaround Engine</p>
                        </div>
                    </div>
                </div>
                {sourceImage && (
                    <button
                        onClick={resetApp}
                        className="bg-neutral-900 text-neutral-400 hover:text-white px-4 py-2 border border-neutral-800 rounded-full transition-all text-[9px] font-bold uppercase tracking-widest flex items-center gap-2"
                    >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                    </button>
                )}
            </header>

            <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 px-4 sm:px-6 items-start pb-20">
                <section className="space-y-6 order-2 lg:order-1">
                    {currentStep === 'upload' && (
                        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                            <h2 className="text-lg md:text-xl font-semibold mb-2 flex items-center gap-2">
                                <Upload className="w-5 h-5 text-indigo-400" />
                                Step 1: Content Input
                            </h2>
                            <p className="text-neutral-400 text-xs md:text-sm mb-6 md:mb-8">
                                Upload a photo. V-ROUND will generate the spatial turnaround.
                            </p>

                            <label
                                className="group relative flex flex-col items-center justify-center w-full h-64 md:h-80 border-2 border-dashed border-neutral-700 rounded-2xl cursor-pointer bg-neutral-900/50 hover:bg-neutral-800/50 hover:border-indigo-500/50 transition-all overflow-hidden"
                            >
                                {!sourceImage ? (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                        <ImageIcon className="w-10 h-10 md:w-12 md:h-12 mb-4 text-neutral-600 group-hover:text-indigo-400" />
                                        <p className="mb-2 text-sm text-neutral-300">
                                            <span className="font-semibold text-white">Select Photo</span>
                                        </p>
                                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Single Perspective</p>
                                    </div>
                                ) : (
                                    <img src={sourceImage} className="w-full h-full object-cover" alt="Source" />
                                )}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>

                            {sourceImage && (
                                <button
                                    onClick={startProcessing}
                                    disabled={isProcessing}
                                    className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-500/10 active:scale-[0.98]"
                                >
                                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                    Generate Turnaround Sequence
                                </button>
                            )}
                        </div>
                    )}

                    {currentStep === 'processing' && (
                        <div className="bg-neutral-900 border border-neutral-800/50 rounded-[3rem] p-10 lg:p-14 space-y-10 animate-in fade-in zoom-in-95 duration-500 shadow-2xl relative overflow-hidden">
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="relative">
                                    <div className="w-24 h-24 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                                    <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-indigo-400 animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">Spatial Rendering...</h2>
                                    <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1">Reconstructing garments in 3D space</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black tracking-[0.3em] text-indigo-400 uppercase">
                                    <span>AI PROCESSING</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="w-full bg-neutral-800/50 rounded-full h-1 overflow-hidden">
                                    <div
                                        className="bg-indigo-500 h-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className={cn("p-5 rounded-2xl border transition-all duration-500 flex items-center justify-between", progress > 15 ? "bg-indigo-500/5 border-indigo-500/30 text-indigo-200" : "border-neutral-800/50 text-neutral-600")}>
                                    <span className="text-[11px] font-black uppercase tracking-wider">Right Profile Mapping</span>
                                    {progress > 15 && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
                                </div>
                                <div className={cn("p-5 rounded-2xl border transition-all duration-500 flex items-center justify-between", progress > 40 ? "bg-indigo-500/5 border-indigo-500/30 text-indigo-200" : "border-neutral-800/50 text-neutral-600")}>
                                    <span className="text-[11px] font-black uppercase tracking-wider">Posterior Reconstruction</span>
                                    {progress > 40 && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
                                </div>
                                <div className={cn("p-5 rounded-2xl border transition-all duration-500 flex items-center justify-between", progress > 70 ? "bg-indigo-500/5 border-indigo-500/30 text-indigo-200" : "border-neutral-800/50 text-neutral-600")}>
                                    <span className="text-[11px] font-black uppercase tracking-wider">Left Profile Synthesis</span>
                                    {progress > 70 && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 'preview' && (
                        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold">Output Control</h2>
                                    <p className="text-neutral-500 text-xs">Sync complete • Ready for export</p>
                                </div>
                                <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-emerald-500/20 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Synced
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all border border-neutral-700 shadow-lg"
                                >
                                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                    {isPlaying ? 'Pause' : 'Preview'}
                                </button>
                                <button
                                    onClick={exportVideo}
                                    disabled={isExporting}
                                    className="flex-1 bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all shadow-xl disabled:bg-neutral-400"
                                >
                                    {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                    {isExporting ? 'Exporting...' : 'Save Video'}
                                </button>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                {ANGLES.map((angle, i) => (
                                    <button
                                        key={angle}
                                        onClick={() => { setActiveFrame(i); setIsPlaying(false); }}
                                        className={cn(
                                            "aspect-square rounded-xl border-2 overflow-hidden transition-all relative",
                                            activeFrame === i ? "border-indigo-500 ring-4 ring-indigo-500/10" : "border-neutral-800 opacity-30 grayscale hover:opacity-100 hover:grayscale-0"
                                        )}
                                    >
                                        <img src={generatedViews[angle]!} className="w-full h-full object-cover" alt={angle} />
                                        <div className="absolute bottom-1 right-1 bg-black/60 text-[8px] px-1 rounded uppercase font-bold text-white/60">{angle}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-950/30 border border-red-500/50 p-6 rounded-2xl flex items-start gap-4 text-red-400 animate-in shake">
                            <AlertCircle className="w-6 h-6 shrink-0" />
                            <div>
                                <p className="font-bold text-sm">Spatial Error</p>
                                <p className="text-xs mt-1 opacity-80">{error}</p>
                                <button onClick={() => { setError(null); setCurrentStep('upload'); }} className="mt-4 text-xs font-bold underline">Re-upload Image</button>
                            </div>
                        </div>
                    )}
                </section>

                <section className="order-1 lg:order-2">
                    <div className="relative aspect-[3/4] bg-neutral-900 rounded-[3rem] overflow-hidden shadow-[0_0_120px_rgba(79,70,229,0.15)] border border-neutral-800/60 group">
                        <div className="w-full h-full relative">
                            {sourceImage ? (
                                <img
                                    src={generatedViews[ANGLES[activeFrame]] || sourceImage}
                                    className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
                                    alt="Main Preview"
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-800 bg-neutral-900/50">
                                    <div className="w-24 h-24 border-4 border-dashed border-neutral-800 rounded-full flex items-center justify-center mb-6">
                                        <Camera className="w-10 h-10 opacity-10" />
                                    </div>
                                    <p className="text-[10px] font-black tracking-[0.5em] uppercase opacity-40">Optical Ready</p>
                                </div>
                            )}

                            {currentStep === 'preview' && (
                                <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between z-10 transition-all duration-700">
                                    <div className="flex justify-between items-start opacity-40 group-hover:opacity-60 transition-opacity">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black text-white tracking-[0.4em] uppercase">V-ROUND STUDIO</span>
                                            <span className="text-[10px] font-bold text-indigo-400">MODEL_GEMINI_RECON</span>
                                        </div>
                                        <div className="w-4 h-4 border-t-2 border-r-2 border-white/40"></div>
                                    </div>
                                    <div className="flex justify-between items-end opacity-40 group-hover:opacity-60 transition-opacity">
                                        <div className="w-4 h-4 border-b-2 border-l-2 border-white/40"></div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[10px] font-mono text-white/80 tracking-[0.2em] uppercase italic">24.0 FPS</span>
                                            <span className="text-[10px] font-black text-emerald-500 tracking-[0.1em]">SYNC_LOCKED</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cinema Gradients */}
                        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/90 to-transparent pointer-events-none z-0"></div>
                        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 to-transparent pointer-events-none z-0"></div>
                    </div>

                    <div className="mt-8 flex justify-between items-center px-6">
                        <div className="flex gap-10">
                            <div className="text-center">
                                <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest mb-1.5">Perspective</p>
                                <p className="text-sm font-mono text-white/90 uppercase tracking-wider">{currentStep === 'preview' ? ANGLES[activeFrame] : 'STANDBY'}</p>
                            </div>
                            <div className="text-center border-l border-neutral-800/50 pl-10">
                                <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest mb-1.5">Rotation</p>
                                <p className="text-sm font-mono text-white/90 uppercase tracking-wider">360° SYNC</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest mb-1.5">Output Status</p>
                            <div className="flex items-center gap-2.5 justify-end">
                                <span className={cn("w-2 h-2 rounded-full", currentStep === 'preview' ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" : "bg-neutral-800")}></span>
                                <p className={cn("text-[11px] font-mono uppercase tracking-tighter font-bold", currentStep === 'preview' ? "text-emerald-500" : "text-neutral-500")}>
                                    {currentStep === 'preview' ? 'Optimized' : 'Standby'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="mt-32 pb-16 flex flex-col items-center gap-6 text-neutral-700">
                <div className="flex gap-12 text-[10px] font-black tracking-[0.5em] uppercase opacity-30">
                    <span>Neural Engine</span>
                    <span>Spatial Physics</span>
                    <span>Kinetic Pose</span>
                </div>
                <div className="h-px w-48 bg-neutral-900/50"></div>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-20">Automated Fashion Intelligence Turnaround Tool</p>
            </footer>
        </div>
    );
}
