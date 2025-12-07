"use client";

import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { useProject } from './layout';
import {
    LayoutDashboard,
    Code2,
    Database,
    Server,
    Rocket,
    Zap,
    Cpu,
    Activity,
    Settings,
    KeyRound,
    ChevronLeft,
    ChevronRight,
    LogOut
} from 'lucide-react';

const menuItems = [
    { slug: 'overview', label: 'Overview', icon: LayoutDashboard },
    { slug: 'code', label: 'Code', icon: Code2 },
    { slug: 'database', label: 'Database', icon: Database },
    { slug: 'api-endpoints', label: 'API Endpoints', icon: Server },
    { slug: 'deployments', label: 'Deployments', icon: Rocket },
    // { slug: 'functions', label: 'Functions', icon: Zap },
    // { slug: 'workers', label: 'Workers', icon: Cpu },
    { slug: 'activity', label: 'Activity', icon: Activity },
    { slug: 'cloud-credentials', label: 'Cloud Credentials', icon: KeyRound },
    { slug: 'project-settings', label: 'Project Settings', icon: Settings }
];

export default function ProjectSidebar({ projectId, collapsed, setCollapsed }) {
    const activeSegment = useSelectedLayoutSegment();
    const { projectName } = useProject();

    return (
        <aside
            className={`relative flex flex-col overflow-visible border-r border-white/10 transition-all duration-300 ease-in-out bg-[#0f0f23] ${
                collapsed ? 'w-20' : 'w-72'
            }`}
        >
            <div className="relative flex items-center justify-between px-4 py-4 border-b border-white/10">
                <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
                    {/* <div
                        className={`flex items-center justify-center rounded-lg bg-white/10 text-lg font-semibold text-white ${
                            collapsed ? 'h-12 w-12' : 'h-10 w-10'
                        }`}
                    >
                       <ChevronLeft />
                    </div> */}
                    {!collapsed && (
                        <div className="leading-tight">
                            <p className="text-xs uppercase tracking-wide text-gray-400">Project</p>
                            <p className="text-base font-semibold text-white truncate">
                                {projectName || projectId}
                            </p>
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => setCollapsed((value) => !value)}
                    className={`flex items-center justify-center text-gray-200 transition hover:bg-white/20 focus:outline-none ${
                        collapsed
                            ? 'absolute left-full top-4 z-20 h-12 w-7 translate-x-[1px] rounded-r-2xl rounded-l-none border border-white/10 bg-white/10 shadow-lg'
                            : 'h-9 w-9 rounded-md bg-white/10'
                    }`}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
            </div>

            <nav className="flex-1 space-y-1 px-2 py-4">
                {menuItems.map(({ slug, label, icon: Icon }) => {
                    const isActive = activeSegment === slug || (slug === 'overview' && activeSegment === null);

                    return (
                        <Link
                            key={slug}
                            href={`/project/${projectId}/${slug}`}
                            title={label}
                            className={`group flex items-center rounded-xl text-sm font-bold text-gray-300 transition-colors duration-200 hover:text-white ${
                                collapsed ? 'justify-center h-12' : 'gap-3 px-3 py-2'
                            } ${isActive ? 'bg-blue-500/20 text-blue-200': 'hover:bg-white/10'}`}
                        >
                            <Icon className="h-5 w-5" />
                            <span className={collapsed ? 'sr-only' : ''}>{label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="px-4 py-4">
                <Link
                    href="/dashboard"
                    className={`group flex items-center rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-white transition hover:border-blue-400/60 hover:bg-blue-500/10 hover:text-blue-200 ${
                        collapsed ? 'justify-center' : 'gap-3'
                    }`}
                >
                    <LogOut className="h-5 w-5" />
                    <span className={collapsed ? 'sr-only' : ''}>Exit Project</span>
                </Link>
            </div>

            {/* <div className="px-4 py-5 border-t border-white/10">
                <div
                    className={`flex items-center rounded-lg bg-white/5 p-3 text-sm text-gray-200 ${
                        collapsed ? 'justify-center' : 'gap-3'
                    }`}
                >
                    <div className="h-9 w-9 overflow-hidden rounded-full border border-white/20">
                        <img
                            src="https://i.pravatar.cc/80"
                            alt="Project Owner"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    {!collapsed && (
                        <div>
                            <p className="font-semibold text-white">Project Owner</p>
                            <p className="text-xs text-gray-400">owner@example.com</p>
                        </div>
                    )}
                </div>
            </div> */}
        </aside>
    );
}
