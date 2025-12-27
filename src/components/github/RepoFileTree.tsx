'use client';

import { useState, useMemo, useCallback } from 'react';
import { ChevronRight, ChevronDown, Folder, FileCode, File, Check, Minus, Download, X, CheckSquare, Square } from 'lucide-react';
import { GitHubTreeItem, updateTreeSelection, selectAllInTree, getSelectedPaths } from '@/lib/github-api';

interface RepoFileTreeProps {
    tree: GitHubTreeItem[];
    repoName: string;
    onTreeChange: (newTree: GitHubTreeItem[]) => void;
    onDownload: (selectedPaths: string[]) => void;
    onCancel: () => void;
    isDownloading: boolean;
    downloadProgress: { current: number; total: number } | null;
}

// File icon based on extension
function getFileIcon(name: string) {
    const ext = name.split('.').pop()?.toLowerCase();
    const codeExtensions = ['ts', 'tsx', 'js', 'jsx', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'rb', 'php', 'cs', 'swift', 'kt'];

    if (ext && codeExtensions.includes(ext)) {
        return <FileCode className="h-4 w-4 text-indigo-400" />;
    }
    return <File className="h-4 w-4 text-slate-400" />;
}

// Tree node component
interface TreeNodeProps {
    node: GitHubTreeItem;
    level: number;
    onToggleSelect: (path: string, selected: boolean) => void;
    expandedPaths: Set<string>;
    onToggleExpand: (path: string) => void;
}

function TreeNode({ node, level, onToggleSelect, expandedPaths, onToggleExpand }: TreeNodeProps) {
    const isExpanded = expandedPaths.has(node.path);
    const isFolder = node.type === 'tree';

    // Calculate selection state for folders
    const selectionState = useMemo(() => {
        if (!node.children) return node.selected ? 'full' : 'none';

        const countSelected = (nodes: GitHubTreeItem[]): { selected: number; total: number } => {
            let selected = 0;
            let total = 0;
            for (const n of nodes) {
                if (n.type === 'blob') {
                    total++;
                    if (n.selected) selected++;
                }
                if (n.children) {
                    const childCount = countSelected(n.children);
                    selected += childCount.selected;
                    total += childCount.total;
                }
            }
            return { selected, total };
        };

        const { selected, total } = countSelected(node.children);
        if (selected === 0) return 'none';
        if (selected === total) return 'full';
        return 'partial';
    }, [node]);

    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const shouldSelect = selectionState !== 'full';
        onToggleSelect(node.path, shouldSelect);
    };

    return (
        <div className="select-none">
            <div
                className={`
          flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer
          hover:bg-white/5 transition-colors duration-150
          ${node.selected ? 'bg-indigo-500/10' : ''}
        `}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={() => isFolder && onToggleExpand(node.path)}
            >
                {/* Expand/Collapse for folders */}
                {isFolder ? (
                    <button
                        className="p-0.5 hover:bg-white/10 rounded transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleExpand(node.path);
                        }}
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                    </button>
                ) : (
                    <div className="w-5" /> // Spacer for alignment
                )}

                {/* Checkbox */}
                <button
                    className="p-0.5 hover:bg-white/10 rounded transition-colors"
                    onClick={handleCheckboxClick}
                >
                    {selectionState === 'full' ? (
                        <CheckSquare className="h-4 w-4 text-indigo-400" />
                    ) : selectionState === 'partial' ? (
                        <div className="h-4 w-4 rounded border-2 border-indigo-400 flex items-center justify-center">
                            <Minus className="h-2.5 w-2.5 text-indigo-400" />
                        </div>
                    ) : (
                        <Square className="h-4 w-4 text-slate-500" />
                    )}
                </button>

                {/* Icon */}
                {isFolder ? (
                    <Folder className={`h-4 w-4 ${isExpanded ? 'text-indigo-400' : 'text-yellow-500'}`} />
                ) : (
                    getFileIcon(node.name)
                )}

                {/* Name */}
                <span className={`text-sm truncate ${node.selected ? 'text-white' : 'text-slate-300'}`}>
                    {node.name}
                </span>

                {/* Size for files */}
                {!isFolder && node.size && (
                    <span className="text-xs text-slate-500 ml-auto">
                        {formatSize(node.size)}
                    </span>
                )}
            </div>

            {/* Children */}
            {isFolder && isExpanded && node.children && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                    {node.children.map((child) => (
                        <TreeNode
                            key={child.path}
                            node={child}
                            level={level + 1}
                            onToggleSelect={onToggleSelect}
                            expandedPaths={expandedPaths}
                            onToggleExpand={onToggleExpand}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function RepoFileTree({
    tree,
    repoName,
    onTreeChange,
    onDownload,
    onCancel,
    isDownloading,
    downloadProgress
}: RepoFileTreeProps) {
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
        // Start with root level folders expanded
        const initial = new Set<string>();
        for (const node of tree) {
            if (node.type === 'tree') {
                initial.add(node.path);
            }
        }
        return initial;
    });

    const selectedPaths = useMemo(() => getSelectedPaths(tree), [tree]);

    const totalFiles = useMemo(() => {
        const count = (nodes: GitHubTreeItem[]): number => {
            let total = 0;
            for (const n of nodes) {
                if (n.type === 'blob') total++;
                if (n.children) total += count(n.children);
            }
            return total;
        };
        return count(tree);
    }, [tree]);

    const handleToggleSelect = useCallback((path: string, selected: boolean) => {
        const newTree = updateTreeSelection(tree, path, selected);
        onTreeChange(newTree);
    }, [tree, onTreeChange]);

    const handleToggleExpand = useCallback((path: string) => {
        setExpandedPaths(prev => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    }, []);

    const handleSelectAll = () => {
        const newTree = selectAllInTree(tree, true);
        onTreeChange(newTree);
    };

    const handleDeselectAll = () => {
        const newTree = selectAllInTree(tree, false);
        onTreeChange(newTree);
    };

    const handleExpandAll = () => {
        const allPaths = new Set<string>();
        const collect = (nodes: GitHubTreeItem[]) => {
            for (const n of nodes) {
                if (n.type === 'tree') {
                    allPaths.add(n.path);
                    if (n.children) collect(n.children);
                }
            }
        };
        collect(tree);
        setExpandedPaths(allPaths);
    };

    const handleCollapseAll = () => {
        setExpandedPaths(new Set());
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Folder className="h-5 w-5 text-indigo-400" />
                        {repoName}
                    </h3>
                    <p className="text-sm text-slate-400">
                        {selectedPaths.length} of {totalFiles} files selected
                    </p>
                </div>

                <button
                    onClick={onCancel}
                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap gap-2 mb-4">
                <button
                    onClick={handleSelectAll}
                    className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 
                     text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                >
                    <Check className="h-3.5 w-3.5" />
                    Select All
                </button>
                <button
                    onClick={handleDeselectAll}
                    className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 
                     text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                >
                    <X className="h-3.5 w-3.5" />
                    Deselect All
                </button>
                <button
                    onClick={handleExpandAll}
                    className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 
                     text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                >
                    <ChevronDown className="h-3.5 w-3.5" />
                    Expand All
                </button>
                <button
                    onClick={handleCollapseAll}
                    className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 
                     text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                >
                    <ChevronRight className="h-3.5 w-3.5" />
                    Collapse All
                </button>
            </div>

            {/* Tree Container */}
            <div className="max-h-[400px] overflow-y-auto rounded-xl bg-slate-900/50 border border-white/10 p-2">
                {tree.map((node) => (
                    <TreeNode
                        key={node.path}
                        node={node}
                        level={0}
                        onToggleSelect={handleToggleSelect}
                        expandedPaths={expandedPaths}
                        onToggleExpand={handleToggleExpand}
                    />
                ))}
            </div>

            {/* Download Button */}
            <div className="mt-4 flex justify-center">
                {isDownloading ? (
                    <div className="w-full max-w-xs">
                        <div className="text-center text-sm text-slate-400 mb-2">
                            Downloading files... {downloadProgress ? `${downloadProgress.current}/${downloadProgress.total}` : ''}
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 transition-all duration-300"
                                style={{
                                    width: downloadProgress
                                        ? `${(downloadProgress.current / downloadProgress.total) * 100}%`
                                        : '0%'
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => onDownload(selectedPaths)}
                        disabled={selectedPaths.length === 0}
                        className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 
                       text-white font-semibold transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       shadow-lg shadow-green-500/20 hover:shadow-green-500/30
                       flex items-center gap-2"
                    >
                        <Download className="h-5 w-5" />
                        Download {selectedPaths.length} Files as .txt
                    </button>
                )}
            </div>
        </div>
    );
}
