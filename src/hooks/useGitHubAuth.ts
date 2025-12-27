'use client';

import { useGitHubAuthContext } from '@/contexts/GitHubAuthContext';

/**
 * Custom hook for GitHub authentication
 * Now acts as a wrapper around the Context
 */
export function useGitHubAuth() {
    return useGitHubAuthContext();
}
