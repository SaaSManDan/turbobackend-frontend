"use client";

import { use, useState, useEffect } from 'react';
import { useApi } from '@/lib/client/hooks/useApi';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Loader2 } from 'lucide-react';

export default function CodePage({ params }) {
    const { projectId } = use(params);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    const [fileTree, setFileTree] = useState([]);

    // Fetch project files
    const { data: filesData, loading: filesLoading, error: filesError, execute: fetchFiles } = useApi(
        `/v1/getProjectFiles?projectId=${projectId}`,
        { method: 'GET', immediate: true }
    );

    // Fetch file content
    const { data: contentData, loading: contentLoading, error: contentError, execute: fetchContent } = useApi(
        '/v1/getProjectFileContent',
        { method: 'GET' }
    );

    // Build file tree structure from flat file list
    useEffect(function() {
        if (filesData?.success && filesData?.files) {
            const tree = buildFileTree(filesData.files);
            setFileTree(tree);
        }
    }, [filesData]);

    // Update file content when contentData changes
    useEffect(function() {
        if (contentData?.success && contentData?.content) {
            setFileContent(contentData.content);
        }
    }, [contentData]);

    function buildFileTree(files) {
        const tree = [];
        const map = {};

        files.forEach(function(file) {
            const parts = file.key.split('/');
            let currentLevel = tree;
            let currentPath = '';

            parts.forEach(function(part, index) {
                currentPath = currentPath ? `${currentPath}/${part}` : part;
                const isFile = index === parts.length - 1;

                if (!map[currentPath]) {
                    const node = {
                        name: part,
                        path: currentPath,
                        isFile: isFile,
                        children: isFile ? undefined : [],
                        size: isFile ? file.size : undefined,
                        lastModified: isFile ? file.lastModified : undefined
                    };

                    map[currentPath] = node;
                    currentLevel.push(node);
                }

                if (!isFile) {
                    currentLevel = map[currentPath].children;
                }
            });
        });

        return tree;
    }

    function toggleFolder(path) {
        setExpandedFolders(function(prev) {
            const newSet = new Set(prev);
            if (newSet.has(path)) {
                newSet.delete(path);
            } else {
                newSet.add(path);
            }
            return newSet;
        });
    }

    async function handleFileSelect(filePath) {
        setSelectedFile(filePath);
        try {
            await fetchContent(null, null, { projectId, filePath });
        } catch (err) {
            console.error('Failed to fetch file content:', err);
        }
    }

    function renderTreeNode(node, level = 0) {
        const isExpanded = expandedFolders.has(node.path);
        const isSelected = selectedFile === node.path;

        if (node.isFile) {
            return (
                <div
                    key={node.path}
                    className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-white/10 transition-colors ${
                        isSelected ? 'bg-blue-500/20 text-blue-200' : 'text-gray-300'
                    }`}
                    style={{ paddingLeft: `${level * 16 + 12}px` }}
                    onClick={() => handleFileSelect(node.path)}
                >
                    <File className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm truncate">{node.name}</span>
                </div>
            );
        }

        return (
            <div key={node.path}>
                <div
                    className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-white/10 transition-colors text-gray-300"
                    style={{ paddingLeft: `${level * 16 + 12}px` }}
                    onClick={() => toggleFolder(node.path)}
                >
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    ) : (
                        <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    )}
                    {isExpanded ? (
                        <FolderOpen className="h-4 w-4 flex-shrink-0" />
                    ) : (
                        <Folder className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium truncate">{node.name}</span>
                </div>
                {isExpanded && node.children && (
                    <div>
                        {node.children.map(function(child) {
                            return renderTreeNode(child, level + 1);
                        })}
                    </div>
                )}
            </div>
        );
    }

    if (filesLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
        );
    }

    if (filesError) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-red-400">Error loading files: {filesError}</div>
            </div>
        );
    }

    return (
        <div className="flex h-full gap-4">
            {/* File Tree Sidebar */}
            <div className="w-80 flex-shrink-0 bg-[#0f0f23] border border-white/10 rounded-lg overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-white/10">
                    <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Files</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {fileTree.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-400 text-sm">
                            No files found
                        </div>
                    ) : (
                        <div className="py-2">
                            {fileTree.map(function(node) {
                                return renderTreeNode(node);
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Code Viewer */}
            <div className="flex-1 bg-[#0f0f23] border border-white/10 rounded-lg overflow-hidden flex flex-col">
                {selectedFile ? (
                    <>
                        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-sm font-medium text-white truncate">{selectedFile}</h2>
                            {contentLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-400" />}
                        </div>
                        <div className="flex-1 overflow-auto">
                            {contentError ? (
                                <div className="p-4 text-red-400">Error: {contentError}</div>
                            ) : (
                                <pre className="p-4 text-sm text-gray-300 font-mono">
                                    <code>{fileContent}</code>
                                </pre>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        Select a file to view its content
                    </div>
                )}
            </div>
        </div>
    );
}
