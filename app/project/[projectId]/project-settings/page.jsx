"use client";

import { use, useState, useEffect } from 'react';
import { useApi } from '@/lib/client/hooks/useApi';
import { useProject } from '../layout';
import { Loader2 } from 'lucide-react';

export default function ProjectSettingsPage({ params }) {
    const { projectId } = use(params);
    const { projectName: contextProjectName, setProjectName: setContextProjectName, loading: contextLoading } = useProject();
    const [projectName, setProjectName] = useState('');
    const [saveState, setSaveState] = useState(null);

    // Update project name API
    const { execute: updateProjectName } = useApi('/v1/updateProjectName', {
        method: 'POST'
    });

    // Set initial project name from context when it loads
    useEffect(function() {
        if (contextProjectName) {
            setProjectName(contextProjectName);
        }
    }, [contextProjectName]);

    async function handleUpdateProjectName() {
        if (!projectName || projectName.trim() === '') {
            return;
        }

        setSaveState('saving');

        try {
            await updateProjectName({
                projectId: projectId,
                projectName: projectName.trim()
            });

            // Update the context so sidebar reflects the change
            setContextProjectName(projectName.trim());

            setSaveState('success');

            // Clear success state after 2 seconds
            setTimeout(function() {
                setSaveState(null);
            }, 2000);

        } catch (err) {
            setSaveState('error');

            setTimeout(function() {
                setSaveState(null);
            }, 3000);
        }
    }

    if (contextLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Project Settings</h1>
                <p className="text-sm text-gray-400 mt-2">
                    Manage your project settings
                </p>
            </div>

            {/* Project Name Section */}
            <div className="border border-white/10 rounded-lg p-6 bg-[#0f0f23]">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-white">Project Name</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Update the name of your project
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={projectName}
                            onChange={function(e) {
                                setProjectName(e.target.value);
                            }}
                            placeholder="Enter project name"
                            className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/20 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500/30 transition-colors"
                        />
                    </div>

                    <button
                        onClick={handleUpdateProjectName}
                        disabled={!projectName || projectName.trim() === '' || saveState === 'saving'}
                        className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {saveState === 'saving' ? (
                            'Saving...'
                        ) : saveState === 'success' ? (
                            'Saved'
                        ) : saveState === 'error' ? (
                            'Error'
                        ) : (
                            'Update Name'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
