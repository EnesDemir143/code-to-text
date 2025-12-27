'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthState, GitHubUser, getStoredAuth, storeAuth, clearAuth } from '@/lib/auth';

interface GitHubAuthContextType extends AuthState {
    isLoading: boolean;
    login: () => void;
    logout: () => Promise<void>;
}

const GitHubAuthContext = createContext<GitHubAuthContextType | undefined>(undefined);

export function GitHubAuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        token: null,
    });
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state
    useEffect(() => {
        const initAuth = () => {
            // First check localStorage
            const stored = getStoredAuth();

            if (stored.isAuthenticated) {
                setAuthState(stored);
                setIsLoading(false);
                return;
            }

            // Check cookies (set by OAuth callback)
            const cookies = document.cookie.split(';').reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split('=');
                if (key && value) {
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, string>);

            if (cookies.github_token && cookies.github_user) {
                try {
                    const token = cookies.github_token;
                    const user = JSON.parse(decodeURIComponent(cookies.github_user)) as GitHubUser;

                    storeAuth(token, user);

                    // Clear cookies
                    document.cookie = 'github_token=; Max-Age=0; path=/';
                    document.cookie = 'github_user=; Max-Age=0; path=/';

                    setAuthState({
                        isAuthenticated: true,
                        user,
                        token,
                    });
                } catch (e) {
                    console.error('Failed to parse auth cookies:', e);
                }
            }

            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = useCallback(() => {
        window.location.href = '/api/auth/github';
    }, []);

    const logout = useCallback(async () => {
        clearAuth();
        await fetch('/api/auth/logout', { method: 'POST' });
        setAuthState({
            isAuthenticated: false,
            user: null,
            token: null,
        });
    }, []);

    return (
        <GitHubAuthContext.Provider value={{ ...authState, isLoading, login, logout }}>
            {children}
        </GitHubAuthContext.Provider>
    );
}

export function useGitHubAuthContext() {
    const context = useContext(GitHubAuthContext);
    if (context === undefined) {
        throw new Error('useGitHubAuthContext must be used within a GitHubAuthProvider');
    }
    return context;
}
