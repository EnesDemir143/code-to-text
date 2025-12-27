'use client';

import { useState, useTransition, useMemo } from 'react';
import { processFiles, FileGroup, generateOutput } from '@/lib/file-engine';
import { FolderOpen, Code2, FileText, Check, Copy, Download, Loader2, File, ChevronRight, ChevronDown } from 'lucide-react';

export default function Dashboard() {
    const [isPending, startTransition] = useTransition();
    const [groups, setGroups] = useState<FileGroup[]>([]);
    const [selectedLanguages, setSelectedLanguages] = useState<Set<string>>(new Set());
    const [totalFilesProcessed, setTotalFilesProcessed] = useState(0);

    const handleDirectorySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        startTransition(async () => {
            const processedGroups = await processFiles(files);
            setGroups(processedGroups);
            setTotalFilesProcessed(processedGroups.reduce((acc, g) => acc + g.count, 0));
            // Select all by default
            setSelectedLanguages(new Set(processedGroups.map(g => g.language)));
        });
    };

    const toggleLanguage = (lang: string) => {
        const next = new Set(selectedLanguages);
        if (next.has(lang)) {
            next.delete(lang);
        } else {
            next.add(lang);
        }
        setSelectedLanguages(next);
    };

    const selectedFiles = useMemo(() => {
        return groups
            .filter(g => selectedLanguages.has(g.language))
            .flatMap(g => g.files);
    }, [groups, selectedLanguages]);

    const outputText = useMemo(() => generateOutput(selectedFiles), [selectedFiles]);

    const handleCopy = () => {
        navigator.clipboard.writeText(outputText);
        alert('Copied to clipboard!');
    };

    const handleDownload = () => {
        const blob = new Blob([outputText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'codebase_context.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex h-screen bg-neutral-900 text-neutral-100 font-sans">
            {/* Sidebar */}
            <aside className="w-80 border-r border-neutral-800 flex flex-col bg-neutral-950/50 backdrop-blur-xl">
                <div className="p-6 border-b border-neutral-800">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                        CodeBase Converter
                    </h1>
                    <p className="text-xs text-neutral-500">
                        Next.js 15 • React 19 • Tailwind 4
                    </p>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                    <div className="space-y-2">
                        <label className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/20 active:scale-95 text-sm font-medium gap-2">
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderOpen className="w-4 h-4" />}
                            {isPending ? 'Processing...' : 'Select Directory'}
                            <input
                                type="file"
                                webkitdirectory=""
                                directory=""
                                multiple
                                className="hidden"
                                onChange={handleDirectorySelect}
                                disabled={isPending}
                            />
                        </label>
                        <label className={`flex items-center justify-center w-full px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl transition-all cursor-pointer border border-neutral-700 active:scale-95 text-sm font-medium gap-2 ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <File className="w-4 h-4" />
                            Select ZIP
                            <input
                                type="file"
                                accept=".zip"
                                className="hidden"
                                onChange={handleDirectorySelect}
                                disabled={isPending}
                            />
                        </label>
                        {totalFilesProcessed > 0 && (
                            <div className="text-center text-xs text-neutral-500">
                                {totalFilesProcessed} files processed
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        {groups.map((group) => (
                            <button
                                key={group.language}
                                onClick={() => toggleLanguage(group.language)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${selectedLanguages.has(group.language)
                                    ? 'bg-neutral-800 text-neutral-200'
                                    : 'text-neutral-500 hover:bg-neutral-800/50'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${selectedLanguages.has(group.language) ? 'bg-green-400' : 'bg-neutral-600'}`} />
                                    <span>{group.language}</span>
                                </div>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-400">
                                    {group.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-950/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-800/50 border border-neutral-700/50 text-xs text-neutral-300">
                            <Code2 className="w-3.5 h-3.5" />
                            <span>{selectedFiles.length} files selected</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-800/50 border border-neutral-700/50 text-xs text-neutral-300">
                            <span>Cost Est: ~{Math.round(outputText.length / 4)} tokens</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopy}
                            disabled={selectedFiles.length === 0}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors border border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Copy className="w-4 h-4" />
                            Copy
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={selectedFiles.length === 0}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-6 overflow-hidden flex flex-col gap-6">
                    {groups.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-neutral-800 flex items-center justify-center border border-neutral-700">
                                <FileText className="w-8 h-8 opacity-50" />
                            </div>
                            <p>Select a folder to analyze codebase</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-auto rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl">
                            <pre className="p-4 text-xs font-mono text-neutral-400 leading-relaxed overflow-x-auto">
                                {outputText.slice(0, 10000)}
                                {outputText.length > 10000 && (
                                    <div className="py-4 text-neutral-500 italic">
                                        ... Preview truncated (Total {outputText.length.toLocaleString()} chars) ...
                                    </div>
                                )}
                            </pre>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// Add typing for webkitdirectory
declare module 'react' {
    interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
        webkitdirectory?: string;
        directory?: string;
    }
}
