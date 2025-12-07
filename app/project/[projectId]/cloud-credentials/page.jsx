"use client";

import { use, useState, useEffect } from 'react';
import { useApi } from '@/lib/client/hooks/useApi';
import { Loader2 } from 'lucide-react';

export default function CloudCredentialsPage({ params }) {
    const { projectId } = use(params);
    const [credentialValues, setCredentialValues] = useState({});
    const [savingStates, setSavingStates] = useState({});

    // Fetch cloud credentials
    const { data: credentialsData, loading, error } = useApi(
        `/v1/getCloudCredentials?projectId=${projectId}`,
        { method: 'GET', immediate: true }
    );

    // Update credentials API
    const { execute: updateCredentials } = useApi('/v1/updateCloudCredentials', {
        method: 'POST'
    });

    // Initialize credential values when data loads
    useEffect(function() {
        if (credentialsData?.credentials) {
            const initialValues = {};
            credentialsData.credentials.forEach(function(cred) {
                const key = cred.credentialId;
                initialValues[key] = cred.credentialValue || '';
            });
            setCredentialValues(initialValues);
        }
    }, [credentialsData]);

    function handleInputChange(credentialId, value) {
        setCredentialValues(function(prev) {
            return {
                ...prev,
                [credentialId]: value
            };
        });
    }

    async function handleSaveCredential(credential) {
        const key = credential.credentialId;
        const value = credentialValues[key];

        if (!value || value.trim() === '') {
            return;
        }

        setSavingStates(function(prev) {
            return {
                ...prev,
                [key]: 'saving'
            };
        });

        try {
            await updateCredentials({
                projectId: projectId,
                credentialId: credential.credentialId,
                credentialName: credential.credentialName,
                credentialValue: value
            });

            setSavingStates(function(prev) {
                return {
                    ...prev,
                    [key]: 'success'
                };
            });

            // Clear success state after 2 seconds
            setTimeout(function() {
                setSavingStates(function(prev) {
                    return {
                        ...prev,
                        [key]: null
                    };
                });
            }, 2000);

        } catch (err) {
            setSavingStates(function(prev) {
                return {
                    ...prev,
                    [key]: 'error'
                };
            });

            setTimeout(function() {
                setSavingStates(function(prev) {
                    return {
                        ...prev,
                        [key]: null
                    };
                });
            }, 3000);
        }
    }

    function renderCredential(credential) {
        const key = credential.credentialId;
        const inputValue = credentialValues[key] || '';
        const savingState = savingStates[key];
        const isMissing = credential.hasMissingFields && (!inputValue || inputValue.trim() === '');

        return (
            <div key={credential.credentialId} className="border border-white/10 rounded-lg p-6 bg-[#0f0f23]">
                <div className="flex items-center gap-3">
                    {/* Field Name */}
                    <div className="flex-shrink-0 w-48">
                        <label className="text-sm text-gray-300">
                            {credential.credentialName}
                        </label>
                    </div>

                    {/* Input Field */}
                    <div className="flex-1">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={function(e) {
                                handleInputChange(credential.credentialId, e.target.value);
                            }}
                            placeholder={credential.credentialName}
                            className={`w-full px-3 py-2 rounded-lg bg-black/30 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors ${
                                isMissing 
                                    ? 'border border-red-500/50 focus:border-red-500 focus:ring-red-500/30' 
                                    : 'border border-white/20 focus:border-blue-500 focus:ring-blue-500/30'
                            }`}
                        />
                    </div>

                    {/* Save Button */}
                    <div className="flex-shrink-0">
                        <button
                            onClick={function() {
                                handleSaveCredential(credential);
                            }}
                            disabled={!inputValue || inputValue.trim() === '' || savingState === 'saving'}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {savingState === 'saving' ? (
                                'Saving...'
                            ) : savingState === 'success' ? (
                                'Saved'
                            ) : savingState === 'error' ? (
                                'Error'
                            ) : (
                                'Save'
                            )}
                        </button>
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
                <div className="text-red-400">Error loading credentials: {error}</div>
            </div>
        );
    }

    const credentials = credentialsData?.credentials || [];

    return (
        <div className="w-full max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Cloud Credentials</h1>
                <p className="text-sm text-gray-400 mt-2">
                    Manage your cloud provider credentials for this project
                </p>
            </div>

            {/* Cloud Credentials Section */}
            {credentials.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-white/10 rounded-lg bg-[#0f0f23]">
                    <div className="text-gray-400 mb-2">No cloud credentials configured</div>
                    <div className="text-sm text-gray-500">
                        Add cloud credentials using the TurboBackend MCP in your AI IDE
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {credentials.map(function(credential) {
                        return renderCredential(credential);
                    })}
                </div>
            )}
        </div>
    );
}
