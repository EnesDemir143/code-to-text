'use client';

import { useState, useEffect, useCallback } from 'react';
import { AuthState, GitHubUser, getStoredAuth, storeAuth, clearAuth } from '@/lib/auth';

/**
 * Custom hook for GitHub authentication
 */
export function useGitHubAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        token: null,
    });
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state from localStorage and cookies
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
                acc[key] = value;
                return acc;
            }, {} as Record<string, string>);

            if (cookies.github_token && cookies.github_user) {
                try {
                    const token = cookies.github_token;
                    const user = JSON.parse(decodeURIComponent(cookies.github_user)) as GitHubUser;

                    // Store in localStorage for future use
                    storeAuth(token, user);

                    // Clear cookies (we now have it in localStorage)
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
        // Redirect to GitHub OAuth
        window.location.href = '/api/auth/github';
    }, []);

    const logout = useCallback(async () => {
        // Clear local storage
        clearAuth();

        // Clear server cookies
        await fetch('/api/auth/logout', { method: 'POST' });

        setAuthState({
            isAuthenticated: false,
            user: null,
            token: null,
        });
    }, []);

    return {
        ...authState,
        isLoading,
        login,
        logout,
    };
}
