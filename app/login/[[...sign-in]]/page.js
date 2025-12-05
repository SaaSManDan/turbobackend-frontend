import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
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
        <SignIn forceRedirectUrl="/dashboard" signUpUrl="/signup" />
      </div>
    </div>
  );
} 