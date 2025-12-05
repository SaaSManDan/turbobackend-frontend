"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useApi } from '@/lib/client/hooks/useApi';

function NewProjectPopup({ isOpen, onClose }) {
    const [projectName, setProjectName] = useState('');
    const router = useRouter();
    const { data, loading, error, execute } = useApi('/v1/createNewProject', {
        method: 'POST'
    });

    async function handleSubmit(e) {
        e.preventDefault();
        
        if (!projectName.trim()) {
            return;
        }

        try {
            const response = await execute({ projectName: projectName.trim() });
            
            if (response.success && response.projectId) {
                router.push(`/project/${response.projectId}/overview`);
            }
        } catch (err) {
            // Error is already handled by useApi hook
            console.error('Failed to create project:', err);
        }
    }

    if (!isOpen) {
        return null;
    }

    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="bg-gradient-to-br from-[#1f2937] to-[#111827] rounded-2xl p-8 border border-white/10 shadow-2xl w-full max-w-md mx-4 relative">
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Close"
                >
                    <X size={24} />
                </button>
                
                <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-2">
                            Project Name
                        </label>
                        <input
                            type="text"
                            id="projectName"
                            value={projectName}
                            onChange={function(e) { setProjectName(e.target.value); }}
                            className="w-full px-4 py-3 bg-[#0f0f23] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                            placeholder="Enter project name"
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading || !projectName.trim()}
                            className="flex-1 bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 bg-gray-700 text-white px-5 py-3 rounded-lg font-semibold hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewProjectPopup;
