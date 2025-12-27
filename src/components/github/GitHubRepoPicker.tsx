'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Github,
    Search,
    ChevronDown,
    Building2,
    User,
    Lock,
    Globe,
    Loader2,
    LogOut,
    Link as LinkIcon
} from 'lucide-react';
import {
    fetchUserOrgs,
    fetchUserRepos,
    GitHubOrg,
    GitHubRepo
} from '@/lib/github-api';
import { useGitHubAuth } from '@/hooks/useGitHubAuth';

interface GitHubRepoPickerProps {
    onRepoSelect: (owner: string, repo: string, branch?: string) => void;
    onCancel: () => void;
    onSwitchToUrlMode: () => void;
}

type ContextType = {
    type: 'user' | 'org';
    login: string;
    name: string;
    avatarUrl?: string;
};

export function GitHubRepoPicker({ onRepoSelect, onCancel, onSwitchToUrlMode }: GitHubRepoPickerProps) {
    const { token, user, logout } = useGitHubAuth();

    // State
    const [contexts, setContexts] = useState<ContextType[]>([]);
    const [currentContext, setCurrentContext] = useState<ContextType | null>(null);
    const [isContextOpen, setIsContextOpen] = useState(false);

    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial load - fetch orgs and set up contexts
    useEffect(() => {
        const init = async () => {
            if (!token || !user) return;

            try {
                // Personal context
                const personalContext: ContextType = {
                    type: 'user',
                    login: user.login,
                    name: user.name || user.login,
                    avatarUrl: user.avatar_url
                };

                // Fetch orgs
                const orgs = await fetchUserOrgs(token);
                const orgContexts: ContextType[] = orgs.map(org => ({
                    type: 'org',
                    login: org.login,
                    name: org.login, // Org API often just gives login, detailed name requires separate fetch usually
                    avatarUrl: org.avatar_url
                }));

                setContexts([personalContext, ...orgContexts]);
                setCurrentContext(personalContext);
            } catch (err) {
                console.error('Failed to load GitHub contexts:', err);
                setError('Failed to load user information');
            }
        };

        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]); // User might be delayed but token check handles it

    // Fetch repos when context or search changes
    const fetchRepos = useCallback(async (reset: boolean = false) => {
        if (!token || !currentContext) return;

        setIsLoading(true);
        setError(null);

        try {
            const nextPage = reset ? 1 : page;
            const contextOwner = currentContext.type === 'org' ? currentContext.login : undefined; // undefined = authenticated user

            // If searching in "Personal" context, we explicitly pass "user:@me" logic in API 
            // but the API helper abstraction `fetchUserRepos` handles `undefined` as "Authenticated User"
            // If search is present, `fetchUserRepos` handles contextual search.

            // Wait... if I am searching in personal context, `owner` should be `undefined`?
            // If `owner` is passed to `fetchUserRepos`, it searches within that org.
            // If `owner` is undefined, it searches `user:@me`.
            // Correct.

            const { repos: newRepos, hasMore: more } = await fetchUserRepos(
                token,
                nextPage,
                currentContext.type === 'org' ? currentContext.login : undefined,
                searchQuery
            );

            setRepos(prev => reset ? newRepos : [...prev, ...newRepos]);
            setHasMore(more);
            setPage(nextPage + 1);
        } catch (err) {
            console.error('Failed to fetch repos:', err);
            setError('Failed to load repositories');
        } finally {
            setIsLoading(false);
        }
    }, [token, currentContext, page, searchQuery]);

    // Effect to trigger fetch on context or search change
    useEffect(() => {
        setPage(1);
        setRepos([]);
        setHasMore(true);
        const timer = setTimeout(() => {
            fetchRepos(true);
        }, 500); // Debounce search
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentContext, searchQuery]);


    // Load more handler
    const handleLoadMore = () => {
        if (!isLoading && hasMore) {
            fetchRepos(false);
        }
    };


    if (!user || !currentContext) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col h-[600px] bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex-none p-4 border-b border-white/10 bg-black/20 z-20">
                <div className="flex items-center justify-between gap-4">
                    {/* Context Switcher */}
                    <div className="relative">
                        <button
                            onClick={() => setIsContextOpen(!isContextOpen)}
                            className="flex items-center gap-2 rounded-lg bg-slate-800 py-2 px-3 text-sm font-medium text-white ring-1 ring-white/10 transition-all hover:bg-slate-700 hover:ring-white/20"
                        >
                            {currentContext.avatarUrl ? (
                                <img src={currentContext.avatarUrl} alt="" className="h-5 w-5 rounded-full" />
                            ) : currentContext.type === 'org' ? (
                                <Building2 className="h-5 w-5 text-slate-400" />
                            ) : (
                                <User className="h-5 w-5 text-slate-400" />
                            )}
                            <span className="max-w-[150px] truncate">{currentContext.name}</span>
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                        </button>

                        {/* Dropdown */}
                        {isContextOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsContextOpen(false)} />
                                <div className="absolute left-0 top-full mt-2 w-64 z-20 overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-xl py-1">
                                    <div className="px-3 py-2 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                                        Switch Context
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {contexts.map(ctx => (
                                            <button
                                                key={ctx.login}
                                                onClick={() => {
                                                    setCurrentContext(ctx);
                                                    setIsContextOpen(false);
                                                }}
                                                className={`flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors ${currentContext.login === ctx.login
                                                        ? 'bg-indigo-500/10 text-indigo-400'
                                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                                    }`}
                                            >
                                                {ctx.avatarUrl ? (
                                                    <img src={ctx.avatarUrl} alt="" className="h-6 w-6 rounded-full" />
                                                ) : ctx.type === 'org' ? (
                                                    <Building2 className="h-5 w-5 text-slate-400" />
                                                ) : (
                                                    <User className="h-5 w-5 text-slate-400" />
                                                )}
                                                <div className="flex-1 text-left truncate">
                                                    {ctx.name}
                                                    {ctx.type === 'user' && <span className="ml-2 text-xs text-slate-500">(Personal)</span>}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="border-t border-white/10 mt-1 pt-1">
                                        <button
                                            onClick={() => logout()}
                                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search repositories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-black/20 py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                        />
                    </div>
                </div>
            </div>

            {/* Repo List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {repos.length === 0 && !isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <Github className="h-12 w-12 mb-4 opacity-20" />
                        <p>No repositories found</p>
                    </div>
                ) : (
                    repos.map(repo => (
                        <div
                            key={repo.id}
                            onClick={() => onRepoSelect(repo.owner.login, repo.name, repo.default_branch)}
                            className="group flex flex-col gap-1 rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-indigo-500/30 hover:bg-white/10 cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-white group-hover:text-indigo-300">
                                    {repo.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                    {repo.private ? (
                                        <Lock className="h-3 w-3 text-amber-500" />
                                    ) : (
                                        <Globe className="h-3 w-3 text-slate-500" />
                                    )}
                                    <span className="text-xs text-slate-500">
                                        {new Date(repo.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            {repo.description && (
                                <p className="text-sm text-slate-400 line-clamp-1">{repo.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-1">
                                {repo.language && (
                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                        <span className="block h-2 w-2 rounded-full bg-indigo-500" />
                                        {repo.language}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}

                {isLoading && (
                    <div className="py-4 flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    </div>
                )}

                {!isLoading && hasMore && repos.length > 0 && (
                    <button
                        onClick={handleLoadMore}
                        className="w-full py-3 text-sm text-slate-400 hover:text-white transition-colors border-t border-white/5"
                    >
                        Load more repositories
                    </button>
                )}
            </div>

            {/* Footer */}
            <div className="flex-none p-4 border-t border-white/10 bg-black/20 flex justify-between items-center">
                <button
                    onClick={onSwitchToUrlMode}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                    <LinkIcon className="h-4 w-4" />
                    Enter URL manually
                </button>

                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
