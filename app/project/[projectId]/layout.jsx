"use client";

import { use, useState, createContext, useContext } from 'react';
import BackgroundGridStyling from '../../components/BackgroundGridStyling';
import ProjectSidebar from './ProjectSidebar';

// Create context for sidebar state
const SidebarContext = createContext();

export function useSidebarCollapsed() {
    return useContext(SidebarContext);
}

export default function ProjectLayout({ children, params }) {
    const { projectId, projectName } = use(params);
    const [collapsed, setCollapsed] = useState(false);

    return (
        <SidebarContext.Provider value={collapsed}>
            <div className="relative flex h-screen min-h-screen overflow-hidden bg-gradient-to-b from-[#0f0f23] via-[#1a1a3e] to-[#111827] text-white">
                <BackgroundGridStyling />

                {/* Animated background accents */}
                <div className="fixed inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-transparent"></div>
                    <div className="absolute top-16 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-16 right-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" style={{ animationDelay: '1s' }}></div>
                </div>

                <ProjectSidebar projectId={projectId} collapsed={collapsed} setCollapsed={setCollapsed} />

                <main className="relative z-10 flex-1 overflow-y-auto p-6 lg:p-10 blueprint-bg">
                    {children}
                </main>
            </div>
        </SidebarContext.Provider>
    );
}
