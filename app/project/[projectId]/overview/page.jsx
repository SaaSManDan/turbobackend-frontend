"use client";

import { use, useState } from 'react';
import { useApi } from '../../../../lib/client/hooks/useApi';
import Link from 'next/link';

export default function OverviewPage({ params }) {
    const { projectId } = use(params);
    const [copied, setCopied] = useState(false);
    
    const { data, loading, error } = useApi(`/v1/getMcpKey?project_id=${projectId}`, {
        immediate: true
    });

    const { data: projectData, loading: projectLoading } = useApi(`/v1/getProjectDetails?projectId=${projectId}`, {
        immediate: true
    });

    const { data: credentialsData } = useApi(`/v1/getCloudCredentials?projectId=${projectId}`, {
        immediate: true
    });

    const isDev = process.env.NODE_ENV === 'development';

    const mcpConfig = data?.mcpKey ? (isDev ? {
        mcpServers: {
            turbobackend: {
                command: "turbobackend-mcp",
                env: {
                    TURBOBACKEND_API_KEY: data.mcpKey,
                    TURBOBACKEND_API_URL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL
                }
            }
        }
    } : {
        mcpServers: {
            turbobackend: {
                command: "npx",
                args: ["-y", "@turbobackend/mcp-server"],
                env: {
                    TURBOBACKEND_API_KEY: data.mcpKey,
                    TURBOBACKEND_API_URL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL
                }
            }
        }
    }) : null;

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

    const missingCredentials = credentialsData?.credentials?.filter(function(cred) {
        return cred.hasMissingFields;
    }) || [];

    return (
        <div className="space-y-8">
            <header>
                <p className="text-sm uppercase tracking-widest text-blue-300/80">Project Overview</p>
                <h1 className="text-3xl font-bold mt-2">
                    {projectLoading ? 'Loading...' : projectData?.project?.project_name || '[Project Name]'}
                </h1>
            </header>

            {missingCredentials.length > 0 && (
                <section className="rounded-2xl border border-red-500/50 bg-red-500/10 p-6">
                    <h3 className="text-lg font-semibold text-red-300 mb-2">Missing Cloud Credentials</h3>
                    <p className="text-sm text-red-200 mb-3">
                        The following credentials need to be configured:
                    </p>
                    <ul className="list-disc list-inside text-sm text-red-200 mb-4 space-y-1">
                        {missingCredentials.map(function(cred) {
                            return (
                                <li key={cred.credentialId}>{cred.credentialName}</li>
                            );
                        })}
                    </ul>
                    <Link
                        href={`/project/${projectId}/project-settings`}
                        className="inline-block px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-colors"
                    >
                        Go to Project Settings
                    </Link>
                </section>
            )}

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
