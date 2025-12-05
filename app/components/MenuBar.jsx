"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { User, Settings, LogOut } from 'lucide-react';

function MenuBar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { signOut } = useAuth();
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    function handleLogout() {
        signOut();
    }

    function toggleDropdown() {
        setDropdownOpen(!dropdownOpen);
    }

    return (
        <nav className="relative z-20 bg-[#0f0f23] border-b border-white/10">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo Placeholder */}
                    <div className="flex-shrink-0 flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#374151] rounded flex items-center justify-center text-sm text-gray-400">
                            D
                        </div>
                        <span className="text-lg font-semibold text-white">TurboBackend</span>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={toggleDropdown}
                            className="w-10 h-10 rounded-full bg-[#374151] hover:bg-[#4b5563] transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <User className="w-5 h-5 text-gray-300" />
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-[#0f0f23] rounded-lg shadow-lg overflow-hidden">
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            // Add settings navigation logic here
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-[#374151] transition-colors duration-150 flex items-center gap-3"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </button>
                                    <button
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-[#374151] transition-colors duration-150 flex items-center gap-3"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default MenuBar;
