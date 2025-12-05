"use client";

import { use, useState } from 'react';
import { useApi } from '../../../../lib/client/hooks/useApi';

export default function OverviewPage({ params }) {
    const { projectId } = use(params);
    const [copied, setCopied] = useState(false);
    
    const { data, loading, error } = useApi(`/v1/getMcpKey?project_id=${projectId}`, {
        immediate: true
    });

    const { data: projectData, loading: projectLoading } = useApi(`/v1/getProjectDetails?projectId=${projectId}`, {
        immediate: true
    });

    const mcpConfig = data?.mcpKey ? {
        mcpServers: {
            turbobackend: {
                command: "npx",
                args: ["-y", "@turbobackend/mcp-server"],
                env: {
                    TURBOBACKEND_API_KEY: data.mcpKey,
                    TURBOBACKEND_API_URL: "http://localhost:3001"
                }
            }
        }
    } : null;

    async function handleCopy() {
        if (!mcpConfig) return;
        
        try {
            await navigator.clipboard.writeText(JSON.stringify(mcpConfig, null, 2));
            setCopied(true);
            setTimeout(function() {
                setCopied(false);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }

    return (
        <div className="space-y-8">
            <header>
                <p className="text-sm uppercase tracking-widest text-blue-300/80">Project Overview</p>
                <h1 className="text-3xl font-bold mt-2">
                    {projectLoading ? 'Loading...' : projectData?.project?.project_name || '[Project Name]'}
                </h1>
            </header>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-blue-900/20 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">MCP Configuration</h3>
                    <button
                        onClick={handleCopy}
                        disabled={loading || !!error || !mcpConfig}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>

                {loading && (
                    <div className="text-gray-300">Loading MCP key...</div>
                )}

                {error && (
                    <div className="text-red-400">Error: {error}</div>
                )}

                {mcpConfig && (
                    <pre className="bg-black/30 rounded-lg p-4 overflow-x-auto text-sm text-gray-200 border border-white/10">
                        <code>{JSON.stringify(mcpConfig, null, 2)}</code>
                    </pre>
                )}
            </section>
        </div>
    );
}
