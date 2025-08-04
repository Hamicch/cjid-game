'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAdminAccess } from '@/lib/adminAuth';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (checkAdminAccess(password)) {
      // Store admin session in localStorage
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('adminLoginTime', Date.now().toString());
      router.push('/admin');
    } else {
      setError('Invalid admin password');
    }

    setIsLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="p-8 space-y-8 w-full max-w-md">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-yellow-400">Admin Access</h1>
          <p className="text-gray-400">Enter admin password to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">
              Admin Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-3 w-full text-white bg-gray-800 rounded-lg border border-gray-600 focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-center text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-3 w-full font-medium text-black bg-yellow-500 rounded-lg transition-colors hover:bg-yellow-600 disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <div className="text-center">
          <a
            href="/"
            className="text-sm text-gray-400 transition-colors hover:text-yellow-400"
          >
            ← Back to Game
          </a>
        </div>
      </div>
    </div>
  );
}