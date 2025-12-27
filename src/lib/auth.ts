/**
 * GitHub OAuth Authentication Utilities
 * Handles GitHub OAuth flow and token management
 */

// GitHub OAuth user info
export interface GitHubUser {
    id: number;
    login: string;
    avatar_url: string;
    name: string | null;
}

// Auth state
export interface AuthState {
    isAuthenticated: boolean;
    user: GitHubUser | null;
    token: string | null;
}

// Storage keys
const TOKEN_KEY = 'github_access_token';
const USER_KEY = 'github_user';

/**
 * Get stored auth state from localStorage
 */
export function getStoredAuth(): AuthState {
    if (typeof window === 'undefined') {
        return { isAuthenticated: false, user: null, token: null };
    }

    try {
        const token = localStorage.getItem(TOKEN_KEY);
        const userStr = localStorage.getItem(USER_KEY);
        const user = userStr ? JSON.parse(userStr) : null;

        return {
            isAuthenticated: !!token && !!user,
            user,
            token,
        };
    } catch {
        return { isAuthenticated: false, user: null, token: null };
    }
}

/**
 * Store auth data in localStorage
 */
export function storeAuth(token: string, user: GitHubUser): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Clear auth data from localStorage
 */
export function clearAuth(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * Get the GitHub login URL
 */
export function getGitHubLoginUrl(): string {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/auth/callback`;
    const scope = 'repo'; // Full access to private repos

    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
}

/**
 * Fetch GitHub user info using access token
 */
export async function fetchGitHubUser(token: string): Promise<GitHubUser> {
    const response = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user info');
    }

    return response.json();
}
