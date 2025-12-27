'use client';

import { useState, useRef, DragEvent, ChangeEvent, useEffect } from 'react';
import { Upload, CheckCircle, Loader2, Github, Lock } from 'lucide-react';
import { processFiles, FileGroup, generateOutput, FileEntry } from '@/lib/file-engine';
import {
    GitHubTreeItem,
    fetchRepoTree,
    fetchMultipleFiles,
} from '@/lib/github-api';
import { GitHubRepoInput } from '@/components/github/GitHubRepoInput';
import { RepoFileTree } from '@/components/github/RepoFileTree';
import { LocalFileTree, LocalTreeItem, buildLocalTreeFromGroups } from '@/components/local/LocalFileTree';
import { GitHubAuthButton } from '@/components/GitHubAuthButton';
import { useGitHubAuth } from '@/hooks/useGitHubAuth';
import { GitHubRepoPicker } from '@/components/github/GitHubRepoPicker';

// Re-export getLanguageFromFilename from file-engine for GitHub files
const getLanguage = (path: string): string => {
    const parts = path.split('.');
    if (parts.length === 1) {
        const filename = path.split('/').pop()?.toLowerCase() || '';
        if (filename === 'dockerfile') return 'Dockerfile';
        if (filename === 'makefile') return 'Makefile';
        return 'Unknown';
    }
    const ext = parts.pop()?.toLowerCase() || '';
    const EXTENSION_MAP: Record<string, string> = {
        ts: 'TypeScript', tsx: 'TypeScript', js: 'JavaScript', jsx: 'JavaScript',
        mjs: 'JavaScript', cjs: 'JavaScript', html: 'HTML', css: 'CSS',
        scss: 'SCSS', sass: 'SASS', less: 'LESS', json: 'JSON', svg: 'SVG',
        xml: 'XML', py: 'Python', rb: 'Ruby', java: 'Java', c: 'C', cpp: 'C++',
        h: 'C/C++', hpp: 'C++', rs: 'Rust', go: 'Go', php: 'PHP', cs: 'C#',
        swift: 'Swift', kt: 'Kotlin', yml: 'YAML', yaml: 'YAML', toml: 'TOML',
        md: 'Markdown', sql: 'SQL', sh: 'Shell', bash: 'Shell', dockerfile: 'Dockerfile',
        txt: 'Text',
    };
    return EXTENSION_MAP[ext] || 'Other';
};

type ViewMode = 'upload' | 'github-input' | 'github-tree' | 'local-tree' | 'github-picker';

export function Hero() {
    const [isDragOver, setIsDragOver] = useState(false);
    const [processedGroups, setProcessedGroups] = useState<FileGroup[] | null>(null);
    const [step, setStep] = useState<'idle' | 'uploading' | 'converting' | 'complete'>('idle');
    const [progress, setProgress] = useState(0);
    const folderInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // GitHub state
    const [viewMode, setViewMode] = useState<ViewMode>('upload');
    const [githubLoading, setGithubLoading] = useState(false);
    const [githubError, setGithubError] = useState<string | null>(null);
    const [repoTree, setRepoTree] = useState<GitHubTreeItem[]>([]);
    const [repoInfo, setRepoInfo] = useState<{ owner: string; repo: string; branch: string } | null>(null);
    const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // Local file tree state
    const [localTree, setLocalTree] = useState<LocalTreeItem[]>([]);
    const [localFolderName, setLocalFolderName] = useState<string>('Uploaded Files');

    // GitHub Auth
    const { isAuthenticated, token, isLoading: authLoading } = useGitHubAuth();

    // Reset view mode when auth state changes
    useEffect(() => {
        if (!isAuthenticated && viewMode === 'github-picker') {
            setViewMode('upload');
        }
    }, [isAuthenticated, viewMode]);

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

            // Determine folder name from the first file's path
            const firstFile = files[0];
            const firstPath = firstFile.webkitRelativePath || firstFile.name;
            const folderName = firstPath.includes('/')
                ? firstPath.split('/')[0]
                : firstFile.name.endsWith('.zip')
                    ? firstFile.name.replace('.zip', '')
                    : 'Uploaded Files';

            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 100);

            const groups = await processFiles(files);

            clearInterval(interval);
            setProgress(100);

            setTimeout(() => {
                setStep('converting');
                setProgress(0);

                let convProgress = 0;
                const convInterval = setInterval(() => {
                    convProgress += 5;
                    setProgress(convProgress);
                    if (convProgress >= 100) {
                        clearInterval(convInterval);
                        setProcessedGroups(groups);

                        // Build tree from groups and switch to tree view
                        const tree = buildLocalTreeFromGroups(groups);
                        setLocalTree(tree);
                        setLocalFolderName(folderName);
                        setStep('idle');
                        setViewMode('local-tree');
                    }
                }, 50);
            }, 500);

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
        if (viewMode === 'upload' && step === 'idle') {
            folderInputRef.current?.click();
        }
    };

    const totalFiles = processedGroups?.reduce((acc, g) => acc + g.count, 0) || 0;


    // GitHub handlers
    const handleGitHubClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isAuthenticated) {
            setViewMode('github-picker');
        } else {
            // If not authenticated, default to manual input (or could force auth, but manual input is safe fallback)
            setViewMode('github-input');
        }
        setGithubError(null);
    };

    const handleGitHubSubmit = async (owner: string, repo: string, branch?: string) => {
        setGithubLoading(true);
        setGithubError(null);

        try {
            const tree = await fetchRepoTree(owner, repo, branch || 'main', token || undefined);
            setRepoTree(tree);
            setRepoInfo({ owner, repo, branch: branch || 'main' });
            setViewMode('github-tree');
        } catch (error) {
            setGithubError((error as Error).message || 'Failed to fetch repository');
        } finally {
            setGithubLoading(false);
        }
    };

    const handleGitHubCancel = () => {
        setViewMode('upload');
        setGithubError(null);
        setRepoTree([]);
        setRepoInfo(null);
    };



    const handleTreeChange = (newTree: GitHubTreeItem[]) => {
        setRepoTree(newTree);
    };

    const handleGitHubDownload = async (selectedPaths: string[]) => {
        if (!repoInfo || selectedPaths.length === 0) return;

        setIsDownloading(true);
        setDownloadProgress({ current: 0, total: selectedPaths.length });

        try {
            const results = await fetchMultipleFiles(
                repoInfo.owner,
                repoInfo.repo,
                selectedPaths,
                repoInfo.branch,
                (current, total) => setDownloadProgress({ current, total }),
                token || undefined
            );

            // Convert to FileEntry format
            const fileEntries: FileEntry[] = results
                .filter(r => !r.error && r.content)
                .map(r => ({
                    path: r.path,
                    name: r.path.split('/').pop() || r.path,
                    language: getLanguage(r.path),
                    content: r.content,
                    size: r.content.length,
                }));

            // Generate and download
            const text = generateOutput(fileEntries);
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${repoInfo.repo}_context.txt`;
            a.click();
            URL.revokeObjectURL(url);

            // Reset to upload view
            setViewMode('upload');
            setRepoTree([]);
            setRepoInfo(null);
        } catch (error) {
            setGithubError((error as Error).message || 'Failed to download files');
        } finally {
            setIsDownloading(false);
            setDownloadProgress(null);
        }
    };

    // Local file tree handlers
    const handleLocalTreeChange = (newTree: LocalTreeItem[]) => {
        setLocalTree(newTree);
    };

    const handleLocalDownload = (selectedFiles: FileEntry[]) => {
        if (selectedFiles.length === 0) return;

        const text = generateOutput(selectedFiles);
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${localFolderName.replace(/[^a-zA-Z0-9]/g, '_')}_context.txt`;
        a.click();
        URL.revokeObjectURL(url);

        // Reset to upload view
        setViewMode('upload');
        setLocalTree([]);
        setProcessedGroups(null);
    };

    const handleLocalCancel = () => {
        setViewMode('upload');
        setLocalTree([]);
        setProcessedGroups(null);
    };

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

            {/* Show GitHub Tree if in that mode */}
            {viewMode === 'github-tree' && repoInfo && (
                <RepoFileTree
                    tree={repoTree}
                    repoName={`${repoInfo.owner}/${repoInfo.repo}`}
                    onTreeChange={handleTreeChange}
                    onDownload={handleGitHubDownload}
                    onCancel={handleGitHubCancel}
                    isDownloading={isDownloading}
                    downloadProgress={downloadProgress}
                />
            )}

            {/* Show Local File Tree if in that mode */}
            {viewMode === 'local-tree' && localTree.length > 0 && (
                <LocalFileTree
                    tree={localTree}
                    folderName={localFolderName}
                    onTreeChange={handleLocalTreeChange}
                    onDownload={handleLocalDownload}
                    onCancel={handleLocalCancel}
                />
            )}

            {/* Show Upload Zone or GitHub Input */}
            {viewMode !== 'github-tree' && viewMode !== 'local-tree' && (
                <>
                    {/* Action Box / Drop Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`group relative flex w-full max-w-2xl flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-300 ${isDragOver
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
                            accept=".zip,.tar.gz,.tgz"
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
                                        'Drag & Drop Files'}
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
                            <div className="mt-6 flex flex-col items-center gap-3">
                                {step === 'idle' && (
                                    <>
                                        <p className="mb-2 text-slate-400">
                                            Or select manually:
                                        </p>
                                        <div className="flex flex-wrap gap-3 justify-center">
                                            <button
                                                type="button"
                                                onClick={triggerFolderInput}
                                                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
                                            >
                                                Select Folder
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-all hover:scale-105 active:scale-95 border border-slate-700"
                                            >
                                                Select ZIP / Archive
                                            </button>
                                        </div>
                                    </>
                                )}
                                {(step === 'uploading' || step === 'converting') && (
                                    <p className="text-slate-400">Please wait...</p>
                                )}
                            </div>
                        )}

                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 -z-10 rounded-3xl bg-indigo-500/5 blur-xl transition-opacity opacity-0 group-hover:opacity-100" />
                    </div>

                    {/* GitHub Option - Below the drop zone */}
                    {viewMode === 'upload' && step === 'idle' && (
                        <div className="mt-8 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-px w-16 bg-gradient-to-r from-transparent to-slate-700" />
                                <span className="text-sm text-slate-500">or</span>
                                <div className="h-px w-16 bg-gradient-to-l from-transparent to-slate-700" />
                            </div>

                            {/* GitHub Auth Button */}
                            <GitHubAuthButton className="mb-2" />

                            <button
                                onClick={handleGitHubClick}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl
                                           bg-slate-800/80 hover:bg-slate-700/80 
                                           border border-white/10 hover:border-white/20
                                           text-slate-300 hover:text-white
                                           transition-all duration-200 hover:scale-[1.02]"
                            >
                                <Github className="h-5 w-5" />
                                <span className="font-medium">Download from GitHub</span>
                                {!isAuthenticated && !authLoading && (
                                    <span className="flex items-center gap-1 text-xs text-amber-400 ml-2">
                                        <Lock className="h-3 w-3" />
                                        Public only
                                    </span>
                                )}
                            </button>

                            {isAuthenticated && (
                                <p className="text-xs text-emerald-400 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Private repos enabled
                                </p>
                            )}
                        </div>
                    )}

                    {/* GitHub Input */}
                    {viewMode === 'github-input' && (
                        <GitHubRepoInput
                            onSubmit={handleGitHubSubmit}
                            onCancel={handleGitHubCancel}
                            isLoading={githubLoading}
                            error={githubError}
                        />
                    )}

                    {viewMode === 'github-picker' && (
                        <GitHubRepoPicker
                            onRepoSelect={handleGitHubSubmit}
                            onCancel={handleGitHubCancel}
                            onSwitchToUrlMode={() => setViewMode('github-input')}
                        />
                    )}
                </>
            )}
        </section>
    );
}
