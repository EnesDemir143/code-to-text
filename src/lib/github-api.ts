/**
 * GitHub API Utilities
 * Handles fetching repository structure and file contents from GitHub
 */

export interface GitHubTreeItem {
    path: string;
    name: string;
    type: 'tree' | 'blob';
    sha: string;
    size?: number;
    url: string;
    children?: GitHubTreeItem[];
    selected?: boolean;
}

export interface ParsedGitHubUrl {
    owner: string;
    repo: string;
    branch?: string;
}

/**
 * Parses a GitHub URL to extract owner and repo name
 * Supports formats:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - https://github.com/owner/repo/tree/branch
 */
export function parseGitHubUrl(url: string): ParsedGitHubUrl | null {
    try {
        // Clean up the URL
        url = url.trim();

        // Handle git@ format (convert to https)
        if (url.startsWith('git@github.com:')) {
            url = url.replace('git@github.com:', 'https://github.com/');
        }

        // Remove .git suffix if present
        if (url.endsWith('.git')) {
            url = url.slice(0, -4);
        }

        const urlObj = new URL(url);

        if (urlObj.hostname !== 'github.com') {
            return null;
        }

        const pathParts = urlObj.pathname.split('/').filter(Boolean);

        if (pathParts.length < 2) {
            return null;
        }

        const result: ParsedGitHubUrl = {
            owner: pathParts[0],
            repo: pathParts[1],
        };

        // Check for branch in URL (e.g., /tree/main or /tree/develop)
        if (pathParts.length >= 4 && pathParts[2] === 'tree') {
            result.branch = pathParts[3];
        }

        return result;
    } catch {
        return null;
    }
}

/**
 * Fetches the repository tree structure from GitHub API
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param branch - Branch name (default: 'main')
 * @param token - Optional GitHub access token for private repos
 */
export async function fetchRepoTree(
    owner: string,
    repo: string,
    branch: string = 'main',
    token?: string
): Promise<GitHubTreeItem[]> {
    // Try the provided branch first, then fallback to 'master' if 'main' fails
    const branches = branch === 'main' ? ['main', 'master'] : [branch];

    let lastError: Error | null = null;

    for (const branchName of branches) {
        try {
            const headers: HeadersInit = {
                'Accept': 'application/vnd.github.v3+json',
            };

            // User token varsa öncelikli kullan (private repo erişimi için)
            // Yoksa env variable token'ı kullan (rate limit için)
            const authToken = token || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
            if (authToken && authToken !== 'buraya_tokenini_yapistir') {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/git/trees/${branchName}?recursive=1`,
                { headers }
            );

            if (!response.ok) {
                if (response.status === 404 && branches.length > 1) {
                    continue; // Try next branch
                }
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.truncated) {
                console.warn('Repository tree is truncated due to size limits');
            }

            // Convert flat tree to hierarchical structure
            return buildTreeHierarchy(data.tree);
        } catch (error) {
            lastError = error as Error;
        }
    }

    throw lastError || new Error('Failed to fetch repository tree');
}

/**
 * Converts flat GitHub tree array to hierarchical structure
 */
function buildTreeHierarchy(flatTree: Array<{ path: string; type: string; sha: string; size?: number; url: string }>): GitHubTreeItem[] {
    const root: GitHubTreeItem[] = [];
    const map = new Map<string, GitHubTreeItem>();

    // Sort by path to ensure parents are processed before children
    const sortedTree = [...flatTree].sort((a, b) => a.path.localeCompare(b.path));

    for (const item of sortedTree) {
        const pathParts = item.path.split('/');
        const name = pathParts[pathParts.length - 1];

        const node: GitHubTreeItem = {
            path: item.path,
            name,
            type: item.type as 'tree' | 'blob',
            sha: item.sha,
            size: item.size,
            url: item.url,
            children: item.type === 'tree' ? [] : undefined,
            selected: false,
        };

        map.set(item.path, node);

        if (pathParts.length === 1) {
            // Root level item
            root.push(node);
        } else {
            // Find parent
            const parentPath = pathParts.slice(0, -1).join('/');
            const parent = map.get(parentPath);
            if (parent && parent.children) {
                parent.children.push(node);
            } else {
                // Parent doesn't exist in tree (shouldn't happen with recursive tree)
                root.push(node);
            }
        }
    }

    // Sort: directories first, then alphabetically
    const sortNodes = (nodes: GitHubTreeItem[]) => {
        nodes.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'tree' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });
        for (const node of nodes) {
            if (node.children) {
                sortNodes(node.children);
            }
        }
    };

    sortNodes(root);

    return root;
}

/**
 * Fetches file content from GitHub
 * Uses raw.githubusercontent.com for public repos or API for private repos
 * @param token - Optional GitHub access token for private repos
 */
export async function fetchFileContent(
    owner: string,
    repo: string,
    path: string,
    branch: string = 'main',
    token?: string
): Promise<string> {
    // For private repos, we need to use the API with authentication
    if (token) {
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github.v3.raw',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
        }

        return response.text();
    }

    // For public repos, use raw.githubusercontent.com (faster, no rate limit)
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }

    return response.text();
}

/**
 * Fetches multiple files content in parallel with rate limiting
 * @param token - Optional GitHub access token for private repos
 */
export async function fetchMultipleFiles(
    owner: string,
    repo: string,
    paths: string[],
    branch: string = 'main',
    onProgress?: (current: number, total: number) => void,
    token?: string
): Promise<Array<{ path: string; content: string; error?: string }>> {
    const results: Array<{ path: string; content: string; error?: string }> = [];
    const BATCH_SIZE = 10; // Fetch 10 files at a time to avoid overwhelming the browser

    for (let i = 0; i < paths.length; i += BATCH_SIZE) {
        const batch = paths.slice(i, i + BATCH_SIZE);

        const batchResults = await Promise.all(
            batch.map(async (path) => {
                try {
                    const content = await fetchFileContent(owner, repo, path, branch, token);
                    return { path, content };
                } catch (error) {
                    return { path, content: '', error: (error as Error).message };
                }
            })
        );

        results.push(...batchResults);

        if (onProgress) {
            onProgress(Math.min(i + BATCH_SIZE, paths.length), paths.length);
        }
    }

    return results;
}

/**
 * Gets all selected file paths from a tree
 */
export function getSelectedPaths(tree: GitHubTreeItem[]): string[] {
    const paths: string[] = [];

    const traverse = (nodes: GitHubTreeItem[]) => {
        for (const node of nodes) {
            if (node.type === 'blob' && node.selected) {
                paths.push(node.path);
            }
            if (node.children) {
                traverse(node.children);
            }
        }
    };

    traverse(tree);
    return paths;
}

/**
 * Updates selection state in tree (handles parent-child relationships)
 */
export function updateTreeSelection(
    tree: GitHubTreeItem[],
    targetPath: string,
    selected: boolean
): GitHubTreeItem[] {
    const newTree = JSON.parse(JSON.stringify(tree)) as GitHubTreeItem[];

    const findAndUpdate = (nodes: GitHubTreeItem[], path: string): boolean => {
        for (const node of nodes) {
            if (node.path === path) {
                // Update this node
                node.selected = selected;
                // If it's a directory, update all children
                if (node.children) {
                    updateAllChildren(node.children, selected);
                }
                return true;
            }
            if (node.children && findAndUpdate(node.children, path)) {
                // Update parent selection state based on children
                updateParentState(node);
                return true;
            }
        }
        return false;
    };

    const updateAllChildren = (nodes: GitHubTreeItem[], selected: boolean) => {
        for (const node of nodes) {
            node.selected = selected;
            if (node.children) {
                updateAllChildren(node.children, selected);
            }
        }
    };

    const updateParentState = (node: GitHubTreeItem) => {
        if (!node.children) return;
        const allSelected = node.children.every(child => child.selected);
        const someSelected = node.children.some(child => child.selected);
        node.selected = allSelected;
        // Note: For indeterminate state, we'd need a separate property
    };

    findAndUpdate(newTree, targetPath);

    return newTree;
}

/**
 * Selects or deselects all items in the tree
 */
export function selectAllInTree(tree: GitHubTreeItem[], selected: boolean): GitHubTreeItem[] {
    const newTree = JSON.parse(JSON.stringify(tree)) as GitHubTreeItem[];

    const updateAll = (nodes: GitHubTreeItem[]) => {
        for (const node of nodes) {
            node.selected = selected;
            if (node.children) {
                updateAll(node.children);
            }
        }
    };

    updateAll(newTree);
    return newTree;
}

// --- User & Repo Fetching ---

export interface GitHubOrg {
    login: string;
    id: number;
    avatar_url: string;
    description: string | null;
}

export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    html_url: string;
    description: string | null;
    updated_at: string;
    default_branch: string;
    owner: {
        login: string;
        avatar_url: string;
    };
    stargazers_count: number;
    language: string | null;
}

/**
 * Fetches the list of organizations the user belongs to
 */
export async function fetchUserOrgs(token: string): Promise<GitHubOrg[]> {
    const response = await fetch('https://api.github.com/user/orgs', {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch organizations: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Fetches repositories for the authenticated user or a specific organization
 * @param token - GitHub access token
 * @param page - Page number (1-based)
 * @param owner - Optional organization name. If null, fetches user's personal repos.
 * @param search - Optional search query
 */
export async function fetchUserRepos(
    token: string,
    page: number = 1,
    owner?: string,
    search?: string
): Promise<{ repos: GitHubRepo[]; hasMore: boolean }> {
    const PER_PAGE = 30;
    let url: string;

    // Use search API for better filtering (and it supports 'user:name' or 'org:name')
    // This allows us to search strictly within the context
    if (search) {
        const qualifier = owner ? `org:${owner}` : `user:@me`;
        const query = encodeURIComponent(`${search} ${qualifier} sort:updated-desc`);
        url = `https://api.github.com/search/repositories?q=${query}&page=${page}&per_page=${PER_PAGE}`;
    } else {
        // List API is faster/simpler when not searching
        if (owner) {
            url = `https://api.github.com/orgs/${owner}/repos?sort=updated&direction=desc&page=${page}&per_page=${PER_PAGE}`;
        } else {
            url = `https://api.github.com/user/repos?sort=updated&direction=desc&page=${page}&per_page=${PER_PAGE}&affiliation=owner,collaborator`;
        }
    }

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch repositories: ${response.statusText}`);
    }

    const data = await response.json();

    // search API returns { items: [] }, list API returns []
    const repos = Array.isArray(data) ? data : data.items || [];

    return {
        repos,
        hasMore: repos.length === PER_PAGE
    };
}
