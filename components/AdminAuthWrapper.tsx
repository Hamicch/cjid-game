'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

export default function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if admin is authenticated
    const adminAuth = localStorage.getItem('adminAuthenticated');
    const loginTime = localStorage.getItem('adminLoginTime');

    if (adminAuth === 'true' && loginTime) {
      // Check if login is still valid (24 hours)
      const loginTimestamp = parseInt(loginTime);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (now - loginTimestamp < twentyFourHours) {
        setIsAuthenticated(true);
      } else {
        // Session expired
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('adminLoginTime');
        router.push('/admin/login');
      }
    } else {
      router.push('/admin/login');
    }

    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminLoginTime');
    router.push('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="mx-auto w-8 h-8 rounded-full border-b-2 border-yellow-400 animate-spin"></div>
          <p className="mt-2 text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Admin Header */}
      <div className="flex-shrink-0 p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex justify-between items-center mx-auto max-w-7xl">
          <h1 className="text-xl font-bold text-yellow-400">Admin Dashboard</h1>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-400">Admin Mode</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="overflow-y-auto flex-1">
        {children}
      </div>
    </div>
  );
}