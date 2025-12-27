'use client';

import { useState, KeyboardEvent } from 'react';
import { Github, Loader2, X, AlertCircle } from 'lucide-react';
import { parseGitHubUrl } from '@/lib/github-api';

interface GitHubRepoInputProps {
    onSubmit: (owner: string, repo: string, branch?: string) => void;
    onCancel: () => void;
    isLoading: boolean;
    error: string | null;
}

export function GitHubRepoInput({ onSubmit, onCancel, isLoading, error }: GitHubRepoInputProps) {
    const [url, setUrl] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleSubmit = () => {
        setValidationError(null);

        if (!url.trim()) {
            setValidationError('Please enter a GitHub repository URL');
            return;
        }

        const parsed = parseGitHubUrl(url);

        if (!parsed) {
            setValidationError('Invalid GitHub URL. Please use format: https://github.com/owner/repo');
            return;
        }

        onSubmit(parsed.owner, parsed.repo, parsed.branch);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSubmit();
        }
        if (e.key === 'Escape') {
            onCancel();
        }
    };

    const displayError = error || validationError;

    return (
        <div className="w-full max-w-xl mx-auto mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="relative flex items-center gap-2">
                {/* GitHub Icon */}
                <div className="absolute left-4 pointer-events-none">
                    <Github className="h-5 w-5 text-slate-400" />
                </div>

                {/* Input Field */}
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="https://github.com/owner/repository"
                    disabled={isLoading}
                    autoFocus
                    className={`
            w-full pl-12 pr-4 py-3 rounded-xl
            bg-slate-900/80 border-2 
            ${displayError ? 'border-red-500/50' : 'border-white/10 focus:border-indigo-500/50'}
            text-white placeholder-slate-500
            outline-none transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
                />

                {/* Action Buttons */}
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 
                     text-white font-medium transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2 whitespace-nowrap"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading...</span>
                        </>
                    ) : (
                        <>
                            <Github className="h-4 w-4" />
                            <span>Fetch</span>
                        </>
                    )}
                </button>

                <button
                    onClick={onCancel}
                    disabled={isLoading}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 
                     text-slate-400 hover:text-white transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Error Message */}
            {displayError && (
                <div className="mt-3 flex items-center gap-2 text-red-400 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{displayError}</span>
                </div>
            )}

            {/* Help Text */}
            <p className="mt-3 text-sm text-slate-500 text-center">
                Paste a public GitHub repository URL and press Enter
            </p>
        </div>
    );
}
