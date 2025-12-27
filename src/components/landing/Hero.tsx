'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileCode, CheckCircle, Loader2 } from 'lucide-react';
import { processFiles, FileGroup, generateOutput } from '@/lib/file-engine';

export function Hero() {
    const [isDragOver, setIsDragOver] = useState(false);
    const [processedGroups, setProcessedGroups] = useState<FileGroup[] | null>(null);
    const [step, setStep] = useState<'idle' | 'uploading' | 'converting' | 'complete'>('idle');
    const [progress, setProgress] = useState(0);
    const folderInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);

        // Note: DataTransfer items API is better for directories, but for simple drop we rely on file list
        // However, standardized directory drop is tricky. 
        // Usually only input[webkitdirectory] guarantees directory traversal reliably in browsers.
        // We will try to rely on the input trigger mainly, but handle dropped files if possible.
        // For specific folder drops, typically we need 'webkitGetAsEntry'. 
        // To keep it simple and robust for the MVP as per request "specific input... logic", 
        // we prioritize the click-to-open behavior, but basic file drop works (flat list).

        // Actually, asking user to click is safer for folders.
        // If they drop a folder, the browser might just give one file object with 0 bytes or fail.
        // We'll process what we get.
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await processFileList(e.dataTransfer.files);
        }
    };

    const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await processFileList(e.target.files);
        }
    };

    const processFileList = async (list: FileList) => {
        setStep('uploading');
        setProgress(0);

        try {
            const files = Array.from(list);

            // Simulate upload progress (since it's instant client-side)
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 100);

            // Actual processing
            const groups = await processFiles(files);

            clearInterval(interval);
            setProgress(100);

            // Switch to converting phase visually
            setTimeout(() => {
                setStep('converting');
                setProgress(0);

                // Simulate conversion time relative to file count
                let convProgress = 0;
                const convInterval = setInterval(() => {
                    convProgress += 5;
                    setProgress(convProgress);
                    if (convProgress >= 100) {
                        clearInterval(convInterval);
                        setProcessedGroups(groups);
                        setStep('complete');
                    }
                }, 50); // Fast simulation
            }, 500);

            console.log("Processed Groups:", groups);

        } catch (error) {
            console.error("Processing failed:", error);
            setStep('idle');
        }
    };

    const handleDownload = () => {
        if (!processedGroups) return;
        const allFiles = processedGroups.flatMap(g => g.files);
        const text = generateOutput(allFiles);
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'codebase_context.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const triggerFolderInput = () => {
        folderInputRef.current?.click();
    };

    const triggerFileInput = (e: React.MouseEvent) => {
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    const totalFiles = processedGroups?.reduce((acc, g) => acc + g.count, 0) || 0;

    return (
        <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden bg-slate-950 px-6 pt-20 text-center">
            {/* Background gradients */}
            <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/20 blur-[100px]" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

            {/* Headline */}
            <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-bold tracking-tight text-white md:text-7xl">
                Turn Your Codebase into <br />
                <span className="bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                    LLM Context
                </span>
            </h1>

            <p className="mx-auto mb-12 max-w-2xl text-lg text-slate-400 md:text-xl">
                The fastest way to convert local project folders into a single text file for ChatGPT, Claude, or Gemini.
            </p>

            {/* Action Box / Drop Zone */}
            <div
                onClick={triggerFolderInput}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`group relative flex w-full max-w-2xl cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-300 ${isDragOver
                    ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02]'
                    : 'border-white/10 bg-white/5 hover:border-indigo-500/50 hover:bg-white/10'
                    } p-12 md:p-16`}
            >
                <input
                    type="file"
                    ref={folderInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    {...({ webkitdirectory: "", directory: "" } as any)}
                />

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".zip"
                    multiple
                />

                <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br transition-all duration-500 ${step === 'complete' ? 'from-green-500 to-emerald-600 shadow-green-500/25 shadow-lg' :
                    isDragOver ? 'from-indigo-500 to-purple-600 shadow-indigo-500/25 shadow-lg' : 'from-slate-800 to-slate-900 shadow-inner'
                    }`}>
                    {step === 'uploading' || step === 'converting' ? (
                        <Loader2 className="h-10 w-10 text-white/80 animate-spin" />
                    ) : step === 'complete' ? (
                        <CheckCircle className="h-10 w-10 text-white" />
                    ) : (
                        <Upload className={`h-10 w-10 transition-colors ${isDragOver ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                    )}
                </div>

                <h3 className="text-2xl font-semibold text-white">
                    {step === 'uploading' ? 'Reading Files...' :
                        step === 'converting' ? 'Converting to Text...' :
                            step === 'complete' ? 'Ready for Download!' :
                                'Drop Folder or ZIP Here'}
                </h3>

                {/* Progress Bar */}
                {(step === 'uploading' || step === 'converting') && (
                    <div className="mt-4 w-full max-w-xs rounded-full bg-white/10 h-2 overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                {step === 'complete' ? (
                    <div className="mt-6 flex flex-col items-center gap-4">
                        <p className="text-slate-400">
                            {`Successfully processed ${totalFiles} files.`}
                        </p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDownload();
                            }}
                            className="rounded-full bg-green-600 px-6 py-3 font-semibold text-white shadow-lg shadow-green-500/20 transition hover:bg-green-500 hover:scale-105 active:scale-95"
                        >
                            Download .txt File
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setStep('idle');
                                setProcessedGroups(null);
                            }}
                            className="text-sm text-slate-500 hover:text-white"
                        >
                            Convert Another
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="mt-2 text-slate-400">
                            {step === 'idle' && (processedGroups
                                ? `Successfully processed ${totalFiles} files across ${processedGroups.length} languages.`
                                : 'Click to select a Folder, or drag a ZIP file.')}
                            {(step === 'uploading' || step === 'converting') && 'Please wait...'}
                        </p>

                        {step === 'idle' && (
                            <button
                                onClick={triggerFileInput}
                                className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                            >
                                Select as ZIP file instead
                            </button>
                        )}
                    </>
                )}

                {/* Glow effect on hover */}
                <div className="absolute inset-0 -z-10 rounded-3xl bg-indigo-500/5 blur-xl transition-opacity opacity-0 group-hover:opacity-100" />
            </div>
        </section>
    );
}
