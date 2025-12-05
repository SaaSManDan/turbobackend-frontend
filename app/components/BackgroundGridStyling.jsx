"use client";

function BackgroundGridStyling() {
    return (
        <style jsx global>{`
            :root {
                --blueprint-grid-size: 40px;
                --blueprint-bg-color: #1f2837;
                --blueprint-line-color: rgba(255, 255, 255, 0.15);
            }
            .blueprint-bg {
                background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #111827 100%);
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1' stroke-opacity='0.08'%3E%3Cpath d='M0 0 V100 M100 0 V100'/%3E%3Cpath d='M0 0 H100 M0 100 H100'/%3E%3C/g%3E%3C/svg%3E");
                background-size: var(--blueprint-grid-size) var(--blueprint-grid-size);
            }
            .glow {
                box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
            }
            .pulse-glow {
                animation: pulse-glow 2s ease-in-out infinite alternate;
            }
            @keyframes pulse-glow {
                from {
                    box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
                }
                to {
                    box-shadow: 0 0 40px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.3);
                }
            }
            .gradient-text {
                background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 25%, #1e40af 50%, #1d4ed8 75%, #2563eb 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
        `}</style>
    );
}

export default BackgroundGridStyling;
