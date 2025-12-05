"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import MenuBar from '../components/MenuBar';
import BackgroundGridStyling from '../components/BackgroundGridStyling';
import NewProjectPopup from '../components/NewProjectPopup';

function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const { isLoaded, isSignedIn, getToken } = useAuth();

    async function loadProjects() {
        try {
            setLoading(true);
            setError("");
            const token = await getToken()

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/getAllProjects`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log("Data:", JSON.stringify(data, null, 2));

            if (data.success && data.projects) {
                setProjects(data.projects);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            setError(`Failed to load projects: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // Wait for Clerk to load before making API calls
        if (!isLoaded) {
            console.log("Waiting for Clerk to load...");
            return;
        }

        if (!isSignedIn) {
            setError("Not signed in");
            return;
        }

        console.log("useEffect is executing - Clerk loaded and signed in");
        loadProjects();
    }, [isLoaded, isSignedIn]);

    // Show loading state while Clerk initializes
    if (!isLoaded) {
        return (
            <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#0f0f23] via-[#1a1a3e] to-[#111827] text-white relative">
                <BackgroundGridStyling />
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
                    <p>Loading authentication...</p>
                </div>
            </div>
        );
    }

    if (!isSignedIn) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#111827] text-white relative">
                <div className="absolute inset-0 w-full h-full opacity-30" style={{
                    backgroundImage: `
                        linear-gradient(#4a5573 1px, transparent 1px),
                        linear-gradient(90deg, #4a5573 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    zIndex: 0
                }}>
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
                    <p>Not authenticated. Please log in.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#0f0f23] via-[#1a1a3e] to-[#111827] text-white relative">
            <BackgroundGridStyling />

            {/* Animated Background Elements */}
            <div className="fixed inset-0 -z-5">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-transparent"></div>
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>

            {/* Menu Bar */}
            <MenuBar />

            <div className="relative z-10 blueprint-bg flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl sm:text-3xl font-bold">Projects</h1>
                    <button
                        onClick={function() { setIsPopupOpen(true); }}
                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500"
                    >
                        New Project
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {loading && (
                    <p className="text-gray-400">Loading projects...</p>
                )}

                {!loading && projects.length === 0 && !error && (
                    <p className="text-gray-400">No projects found.</p>
                )}

                {!loading && projects.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(function(project) {
                            return (
                                <Link
                                    key={project.project_id}
                                    href={`/project/${project.project_id}/overview`}
                                    className="group block bg-gradient-to-br from-[#1f2937] to-[#111827] rounded-2xl p-6 border border-white/10 hover:border-blue-400/30 shadow-2xl transition-all duration-300 transform hover:scale-105"
                                >
                                    <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                                        {project.project_name}
                                    </h2>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            <NewProjectPopup 
                isOpen={isPopupOpen} 
                onClose={function() { setIsPopupOpen(false); }} 
            />
        </div>
    )
}

export default Dashboard;
