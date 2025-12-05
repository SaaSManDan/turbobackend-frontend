"use client";

import { use, useState, useEffect } from 'react';
import { useApi } from '@/lib/client/hooks/useApi';
import { Loader2 } from 'lucide-react';

export default function ProjectSettingsPage({ params }) {
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
                if (cred.credentialFields) {
                    Object.entries(cred.credentialFields).forEach(function([fieldName, fieldValue]) {
                        const key = `${cred.credentialId}_${fieldName}`;
                        // credentialFields now contains actual string values, not booleans
                        initialValues[key] = fieldValue || '';
                    });
                }
            });
            setCredentialValues(initialValues);
        }
    }, [credentialsData]);

    function handleInputChange(credentialId, fieldName, value) {
        const key = `${credentialId}_${fieldName}`;
        setCredentialValues(function(prev) {
            return {
                ...prev,
                [key]: value
            };
        });
    }

    async function handleSaveCredential(credential, fieldName) {
        const key = `${credential.credentialId}_${fieldName}`;
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
                credentials: {
                    [fieldName]: value
                }
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

    function renderCredentialField(credential, fieldName, fieldValue) {
        const key = `${credential.credentialId}_${fieldName}`;
        const inputValue = credentialValues[key] || '';
        const savingState = savingStates[key];
        // Check if field is missing: original value is empty AND current input is empty
        const isMissing = (!fieldValue || fieldValue.trim() === '') && (!inputValue || inputValue.trim() === '');

        return (
            <div key={fieldName} className="flex items-center gap-3">
                {/* Field Name */}
                <div className="flex-shrink-0 w-48">
                    <label className="text-sm text-gray-300">
                        {fieldName}
                    </label>
                </div>

                {/* Input Field */}
                <div className="flex-1">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={function(e) {
                            handleInputChange(credential.credentialId, fieldName, e.target.value);
                        }}
                        placeholder={fieldName}
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
                            handleSaveCredential(credential, fieldName);
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
        );
    }

    function renderCredential(credential) {
        return (
            <div key={credential.credentialId} className="border border-white/10 rounded-lg p-6 bg-[#0f0f23]">
                {/* Credential Header */}
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-white">
                        {credential.credentialName || `${credential.cloudProvider.toUpperCase()} Credentials`}
                    </h3>
                </div>

                {/* Credential Fields */}
                <div className="space-y-3">
                    {credential.credentialFields && Object.keys(credential.credentialFields).length > 0 ? (
                        Object.entries(credential.credentialFields).map(function([fieldName, fieldValue]) {
                            return renderCredentialField(credential, fieldName, fieldValue);
                        })
                    ) : (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            No credential fields configured
                        </div>
                    )}
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
                <div className="space-y-4">
                    {credentials.map(function(credential) {
                        return renderCredential(credential);
                    })}
                </div>
            )}
        </div>
    );
}
