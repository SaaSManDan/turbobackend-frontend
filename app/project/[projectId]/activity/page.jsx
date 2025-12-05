"use client";

import { use, useState } from 'react';
import { useApi } from '@/lib/client/hooks/useApi';
import { 
    Loader2, 
    Activity, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    AlertCircle,
    ChevronDown,
    ChevronRight,
    Code2,
    Database,
    Server,
    Rocket,
    Zap
} from 'lucide-react';

export default function ActivityPage({ params }) {
    const { projectId } = use(params);
    const [expandedActions, setExpandedActions] = useState({});

    // Fetch project actions
    const { data: actionsData, loading, error } = useApi(
        `/v1/getProjectActions?projectId=${projectId}&environment=development`,
        { method: 'GET', immediate: true }
    );

    function toggleAction(actionId) {
        setExpandedActions(function(prev) {
            return {
                ...prev,
                [actionId]: !prev[actionId]
            };
        });
    }

    function getStatusIcon(status) {
        const statusLower = status?.toLowerCase();
        
        if (statusLower === 'completed' || statusLower === 'success') {
            return <CheckCircle2 className="h-5 w-5 text-green-400" />;
        } else if (statusLower === 'failed' || statusLower === 'error') {
            return <XCircle className="h-5 w-5 text-red-400" />;
        } else if (statusLower === 'pending' || statusLower === 'in_progress' || statusLower === 'processing') {
            return <Clock className="h-5 w-5 text-yellow-400" />;
        } else {
            return <AlertCircle className="h-5 w-5 text-gray-400" />;
        }
    }

    function getStatusColor(status) {
        const statusLower = status?.toLowerCase();
        
        if (statusLower === 'completed' || statusLower === 'success') {
            return 'bg-green-500/20 text-green-300 border-green-500/30';
        } else if (statusLower === 'failed' || statusLower === 'error') {
            return 'bg-red-500/20 text-red-300 border-red-500/30';
        } else if (statusLower === 'pending' || statusLower === 'in_progress' || statusLower === 'processing') {
            return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
        } else {
            return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
        }
    }

    function getActionTypeIcon(actionType) {
        const typeLower = actionType?.toLowerCase();
        
        if (typeLower?.includes('database') || typeLower?.includes('schema')) {
            return <Database className="h-5 w-5 text-blue-400" />;
        } else if (typeLower?.includes('api') || typeLower?.includes('endpoint')) {
            return <Server className="h-5 w-5 text-purple-400" />;
        } else if (typeLower?.includes('deploy')) {
            return <Rocket className="h-5 w-5 text-orange-400" />;
        } else if (typeLower?.includes('code') || typeLower?.includes('file')) {
            return <Code2 className="h-5 w-5 text-cyan-400" />;
        } else if (typeLower?.includes('function')) {
            return <Zap className="h-5 w-5 text-yellow-400" />;
        } else {
            return <Activity className="h-5 w-5 text-gray-400" />;
        }
    }

    function formatTimestamp(timestamp) {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        // Show relative time for recent actions
        if (diffMins < 1) {
            return 'Just now';
        } else if (diffMins < 60) {
            return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        }

        // Show full date for older actions
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatActionType(actionType) {
        if (!actionType) return 'Unknown Action';
        
        // Convert snake_case or camelCase to Title Case
        return actionType
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .split(' ')
            .map(function(word) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ')
            .trim();
    }

    function renderActionDetails(details) {
        if (!details) {
            return <p className="text-sm text-gray-400">No additional details available</p>;
        }

        // If details is a string, try to parse it as JSON
        let parsedDetails = details;
        if (typeof details === 'string') {
            try {
                parsedDetails = JSON.parse(details);
            } catch (err) {
                // If parsing fails, display as plain text
                return (
                    <div className="text-sm text-white whitespace-pre-wrap break-words">
                        {details}
                    </div>
                );
            }
        }

        // If it's an object after parsing, display key-value pairs
        if (typeof parsedDetails === 'object' && parsedDetails !== null) {
            return (
                <div className="space-y-2">
                    {Object.entries(parsedDetails).map(function([key, value]) {
                        const formattedKey = key
                            .replace(/_/g, ' ')
                            .replace(/([A-Z])/g, ' $1')
                            .split(' ')
                            .map(function(word) {
                                return word.charAt(0).toUpperCase() + word.slice(1);
                            })
                            .join(' ');

                        let displayValue = value;
                        if (typeof value === 'object') {
                            displayValue = JSON.stringify(value, null, 2);
                        }

                        return (
                            <div key={key} className="flex gap-2">
                                <span className="text-sm text-gray-400 min-w-[120px]">{formattedKey}:</span>
                                <span className="text-sm text-white font-mono break-all">{displayValue}</span>
                            </div>
                        );
                    })}
                </div>
            );
        }

        // Fallback for other types
        return (
            <div className="text-sm text-white whitespace-pre-wrap break-words">
                {String(parsedDetails)}
            </div>
        );
    }

    function renderReferenceIds(referenceIds) {
        if (!referenceIds) {
            return null;
        }

        // If referenceIds is a string, try to parse it as JSON
        let parsedReferenceIds = referenceIds;
        if (typeof referenceIds === 'string') {
            try {
                parsedReferenceIds = JSON.parse(referenceIds);
            } catch (err) {
                // If parsing fails, display as plain text
                return (
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Reference IDs</h4>
                        <div className="text-xs text-gray-400 font-mono">{referenceIds}</div>
                    </div>
                );
            }
        }

        // Check if it's an object with entries
        if (typeof parsedReferenceIds !== 'object' || parsedReferenceIds === null || Object.keys(parsedReferenceIds).length === 0) {
            return null;
        }

        return (
            <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Reference IDs</h4>
                <div className="space-y-1">
                    {Object.entries(parsedReferenceIds).map(function([key, value]) {
                        return (
                            <div key={key} className="flex gap-2 text-xs">
                                <span className="text-gray-500">{key}:</span>
                                <span className="text-gray-400 font-mono">{value}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    function renderAction(action, index, totalActions) {
        const isExpanded = expandedActions[action.action_id];
        const isLast = index === totalActions - 1;

        return (
            <div key={action.action_id} className="relative">
                {/* Timeline line */}
                {!isLast && (
                    <div className="absolute left-[22px] top-12 bottom-0 w-0.5 bg-white/10" />
                )}

                {/* Action Card */}
                <div className="flex gap-4">
                    {/* Timeline dot with icon */}
                    <div className="relative flex-shrink-0 mt-1">
                        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-[#0f0f23] border-2 border-white/20">
                            {getActionTypeIcon(action.action_type)}
                        </div>
                    </div>

                    {/* Action content */}
                    <div className="flex-1 pb-8">
                        <button
                            onClick={function() { toggleAction(action.action_id); }}
                            className="w-full text-left border border-white/10 rounded-lg p-4 bg-[#0f0f23] hover:border-white/20 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        {getStatusIcon(action.status)}
                                        <h3 className="text-lg font-semibold text-white">
                                            {formatActionType(action.action_type)}
                                        </h3>
                                        <div className={`px-2 py-1 rounded-md border text-xs font-bold uppercase ${getStatusColor(action.status)}`}>
                                            {action.status}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400">{formatTimestamp(action.created_at)}</p>
                                </div>
                                <div className="flex-shrink-0">
                                    {isExpanded ? (
                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                    )}
                                </div>
                            </div>
                        </button>

                        {/* Expanded details */}
                        {isExpanded && (
                            <div className="mt-3 border border-white/10 rounded-lg p-4 bg-white/5">
                                <div className="space-y-4">
                                    {/* Action Details */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Details</h4>
                                        {renderActionDetails(action.action_details)}
                                    </div>

                                    {/* Environment */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-400">Environment:</span>
                                        <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                            {action.environment}
                                        </span>
                                    </div>

                                    {/* Request ID */}
                                    {action.request_id && (
                                        <div className="flex gap-2 text-xs">
                                            <span className="text-gray-500">Request ID:</span>
                                            <span className="text-gray-400 font-mono">{action.request_id}</span>
                                        </div>
                                    )}

                                    {/* Reference IDs */}
                                    {renderReferenceIds(action.reference_ids)}
                                </div>
                            </div>
                        )}
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
                <div className="text-red-400">Error loading activity: {error}</div>
            </div>
        );
    }

    const actions = actionsData?.actions || [];

    return (
        <div className="w-full max-w-4xl">
            {/* Header */}
            <div className="px-6 py-4 mb-6 border border-white/10 rounded-lg bg-[#0f0f23]">
                <h1 className="text-2xl font-bold text-white">Activity</h1>
                <p className="text-sm text-gray-400 mt-1">
                    {actions.length} action{actions.length !== 1 ? 's' : ''} recorded
                </p>
            </div>

            {/* Activity Timeline */}
            {actions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Activity className="h-16 w-16 text-gray-600 mb-4" />
                    <div className="text-gray-400 mb-2">No activity yet</div>
                    <div className="text-sm text-gray-500">
                        Actions performed on your project will appear here
                    </div>
                </div>
            ) : (
                <div className="pl-2">
                    {actions.map(function(action, index) {
                        return renderAction(action, index, actions.length);
                    })}
                </div>
            )}
        </div>
    );
}
