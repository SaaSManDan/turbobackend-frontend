"use client";

import { use, useState } from 'react';
import { useApi } from '@/lib/client/hooks/useApi';
import { Loader2, ExternalLink, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function DeploymentsPage({ params }) {
    const { projectId } = use(params);

    // Fetch project deployments
    const { data: deploymentsData, loading, error } = useApi(
        `/v1/getProjectDeployments?projectId=${projectId}&environment=development`,
        { method: 'GET', immediate: true }
    );

    function getStatusIcon(status) {
        const statusLower = status?.toLowerCase();
        
        if (statusLower === 'active' || statusLower === 'deployed' || statusLower === 'running') {
            return <CheckCircle2 className="h-5 w-5 text-green-400" />;
        } else if (statusLower === 'failed' || statusLower === 'error') {
            return <XCircle className="h-5 w-5 text-red-400" />;
        } else if (statusLower === 'pending' || statusLower === 'deploying') {
            return <Clock className="h-5 w-5 text-yellow-400" />;
        } else {
            return <AlertCircle className="h-5 w-5 text-gray-400" />;
        }
    }

    function getStatusColor(status) {
        const statusLower = status?.toLowerCase();
        
        if (statusLower === 'active' || statusLower === 'deployed' || statusLower === 'running') {
            return 'bg-green-500/20 text-green-300 border-green-500/30';
        } else if (statusLower === 'failed' || statusLower === 'error') {
            return 'bg-red-500/20 text-red-300 border-red-500/30';
        } else if (statusLower === 'pending' || statusLower === 'deploying') {
            return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
        } else {
            return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
        }
    }

    function formatTimestamp(timestamp) {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp * 1000);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function renderDeployment(deployment) {
        return (
            <div key={deployment.deployment_id} className="border border-white/10 rounded-lg p-6 bg-[#0f0f23] hover:border-white/20 transition-colors">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {getStatusIcon(deployment.status)}
                        <div>
                            <h3 className="text-lg font-semibold text-white">{deployment.app_name}</h3>
                            {/* <p className="text-sm text-gray-400 mt-1">Platform: {deployment.platform}</p> */}
                        </div>
                    </div>
                    <div className={`px-3 py-1 rounded-md border text-xs font-bold uppercase ${getStatusColor(deployment.status)}`}>
                        {deployment.status}
                    </div>
                </div>

                <div className="space-y-3">
                    {deployment.url && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400 w-32">URL:</span>
                            <a
                                href={deployment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
                            >
                                {deployment.url}
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 w-32">Deployed:</span>
                        <span className="text-sm text-gray-300">{formatTimestamp(deployment.deployed_at)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 w-32">Last Updated:</span>
                        <span className="text-sm text-gray-300">{formatTimestamp(deployment.last_updated)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 w-32">Deployment ID:</span>
                        <span className="text-xs text-gray-500 font-mono">{deployment.deployment_id}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-red-400">Error loading deployments: {error}</div>
            </div>
        );
    }

    const deployments = deploymentsData?.deployments || [];

    return (
        <div className="w-full">
            {/* Header */}
            <div className="px-6 py-4 mb-6 border border-white/10 rounded-lg bg-[#0f0f23]">
                <h1 className="text-2xl font-bold text-white">Deployments</h1>
                <p className="text-sm text-gray-400 mt-1">
                    {deployments.length} deployment{deployments.length !== 1 ? 's' : ''} found
                </p>
            </div>

            {/* Deployments List */}
            {deployments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="text-gray-400 mb-2">No deployments found</div>
                    <div className="text-sm text-gray-500">
                        Deploy your backend using the TurboBackend MCP in your AI IDE
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-7xl">
                    {deployments.map(function(deployment) {
                        return renderDeployment(deployment);
                    })}
                </div>
            )}
        </div>
    );
}
