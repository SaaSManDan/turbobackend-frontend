"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function IndexPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth(); // Check if the user is signed in

  useEffect(() => {
    // Redirect based on authentication status
    if (isSignedIn) {
      router.push('/dashboard'); // Redirect to dashboard if logged in
    } else {
      router.push('/login'); // Redirect to login if not logged in
    }
  }, [router, isSignedIn]);

  return null; // No UI to render
}
