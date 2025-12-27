'use client';

import { Github, LogOut, Loader2 } from 'lucide-react';
import { useGitHubAuth } from '@/hooks/useGitHubAuth';

interface GitHubAuthButtonProps {
    className?: string;
}

/**
 * GitHub Authentication Button
 * Shows login button when not authenticated, user info when authenticated
 */
export function GitHubAuthButton({ className = '' }: GitHubAuthButtonProps) {
    const { isAuthenticated, isLoading, user, login, logout } = useGitHubAuth();

    if (isLoading) {
        return (
            <button
                disabled
                className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-400 ${className}`}
            >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Yükleniyor...</span>
            </button>
        );
    }

    if (isAuthenticated && user) {
        return (
            <div className={`flex items-center gap-3 ${className}`}>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700">
                    <img
                        src={user.avatar_url}
                        alt={user.login}
                        className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-300">{user.login}</span>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 transition-colors border border-red-600/30"
                    title="Çıkış Yap"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Çıkış</span>
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={login}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors border border-gray-700 hover:border-gray-600 ${className}`}
        >
            <Github className="w-5 h-5" />
            <span>GitHub ile Giriş</span>
        </button>
    );
}
