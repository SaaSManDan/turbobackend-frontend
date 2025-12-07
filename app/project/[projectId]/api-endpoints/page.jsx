"use client";

import { use, useState } from 'react';
import { useApi } from '@/lib/client/hooks/useApi';
import { Loader2, ChevronDown, ChevronRight, Lock, Unlock } from 'lucide-react';

export default function ApiEndpointsPage({ params }) {
    const { projectId } = use(params);
    const [expandedEndpoints, setExpandedEndpoints] = useState(new Set());

    // Fetch API blueprints
    const { data: blueprintsData, loading, error } = useApi(
        `/v1/getApiBlueprints?projectId=${projectId}&environment=development`,
        { method: 'GET', immediate: true }
    );

    function toggleEndpoint(endpointId) {
        setExpandedEndpoints(function(prev) {
            const newSet = new Set(prev);
            if (newSet.has(endpointId)) {
                newSet.delete(endpointId);
            } else {
                newSet.add(endpointId);
            }
            return newSet;
        });
    }

    function getMethodColor(method) {
        const colors = {
            GET: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            POST: 'bg-green-500/20 text-green-300 border-green-500/30',
            PUT: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
            PATCH: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
            DELETE: 'bg-red-500/20 text-red-300 border-red-500/30'
        };
        return colors[method] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }

    function renderJsonSchema(schema, title) {
        if (!schema) return null;

        return (
            <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white">{title}</h4>
                <pre className="bg-black/30 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto border border-white/10">
                    <code>{JSON.stringify(schema, null, 2)}</code>
                </pre>
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
                <div className="text-red-400">Error loading API blueprints: {error}</div>
            </div>
        );
    }

    // Parse blueprint content
    let endpoints = [];
    if (blueprintsData?.success && blueprintsData?.blueprints && blueprintsData.blueprints.length > 0) {
        try {
            // Get the most recent blueprint
            const latestBlueprint = blueprintsData.blueprints[0];
            const parsedContent = JSON.parse(latestBlueprint.blueprint_content);
            endpoints = parsedContent.endpoints || [];
        } catch (err) {
            console.error('Failed to parse blueprint content:', err);
        }
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="px-6 py-4 mb-6 border border-white/10 rounded-lg bg-[#0f0f23]">
                <h1 className="text-2xl font-bold text-white">API Endpoints</h1>
                <p className="text-sm text-gray-400 mt-1">
                    {endpoints.length} endpoint{endpoints.length !== 1 ? 's' : ''} available
                </p>
            </div>

            {/* Endpoints List */}
            {endpoints.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="text-gray-400 mb-2">No API endpoints found</div>
                    <div className="text-sm text-gray-500">
                        Create endpoints using the TurboBackend MCP in your AI IDE
                    </div>
                </div>
            ) : (
                <div className="space-y-4 max-w-6xl">
                    {endpoints.map(function(endpoint, index) {
                        const isExpanded = expandedEndpoints.has(endpoint.id);
                        
                        return (
                            <div key={index} className="border border-white/10 rounded-lg overflow-hidden bg-[#0f0f23]">
                                {/* Endpoint Header */}
                                <div
                                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                                    onClick={() => toggleEndpoint(endpoint.id)}
                                >
                                    <div className="flex-shrink-0">
                                        {isExpanded ? (
                                            <ChevronDown className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                        )}
                                    </div>
                                    <div className={`px-3 py-1 rounded-md border text-xs font-bold uppercase ${getMethodColor(endpoint.method)}`}>
                                        {endpoint.method}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-mono text-sm text-white">{endpoint.path}</div>
                                        {endpoint.description && (
                                            <div className="text-xs text-gray-400 mt-1">{endpoint.description}</div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        {endpoint.authentication === 'none' ? (
                                            <div className="flex items-center gap-1 text-gray-400">
                                                <Unlock className="h-4 w-4" />
                                                <span>Public</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-yellow-400">
                                                <Lock className="h-4 w-4" />
                                                <span>Auth Required</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Endpoint Details */}
                                {isExpanded && (
                                    <div className="border-t border-white/10 p-6 space-y-6 bg-[#0a0a15]">
                                        {/* Request Parameters */}
                                        {endpoint.requestParams && (
                                            <div>
                                                {renderJsonSchema(endpoint.requestParams, 'Request Parameters')}
                                            </div>
                                        )}

                                        {/* Request Body */}
                                        {endpoint.requestBody && (
                                            <div>
                                                {renderJsonSchema(endpoint.requestBody, 'Request Body')}
                                            </div>
                                        )}

                                        {/* Response Schema */}
                                        {endpoint.responseSchema && (
                                            <div>
                                                {renderJsonSchema(endpoint.responseSchema, 'Response Schema')}
                                            </div>
                                        )}

                                        {/* Response Example */}
                                        {endpoint.responseExample && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-white mb-2">Response Example</h4>
                                                <pre className="bg-black/30 rounded-lg p-3 text-xs text-green-300 overflow-x-auto border border-white/10">
                                                    <code>{JSON.stringify(endpoint.responseExample, null, 2)}</code>
                                                </pre>
                                            </div>
                                        )}

                                        {/* Error Responses */}
                                        {endpoint.errorResponses && endpoint.errorResponses.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-white mb-3">Error Responses</h4>
                                                <div className="space-y-2">
                                                    {endpoint.errorResponses.map(function(errorResponse, index) {
                                                        return (
                                                            <div key={index} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-red-400 font-bold text-sm">{errorResponse.status}</span>
                                                                    <span className="text-red-300 text-xs">{errorResponse.description}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
