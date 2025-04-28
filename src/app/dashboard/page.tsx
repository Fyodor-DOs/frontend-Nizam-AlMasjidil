'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { setAuthToken } from '@/utils/api';

const Dashboard = () => {
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('role');

    if (!token || !userRole) {
      router.push('/login');
    } else {
      setAuthToken(token);
      setRole(userRole);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('role');
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1A1614] px-6 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Selamat datang di AlMasjid Digital Platform</p>
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-400 text-sm rounded p-2 mb-6 text-center w-full max-w-2xl">
          {error}
        </div>
      )}

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
        <Link href="/donasi" className="group">
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center shadow-lg transition-all hover:scale-105 hover:shadow-2xl cursor-pointer">
            <h2 className="text-xl font-bold text-yellow-400 mb-2 group-hover:text-yellow-300">Donasi</h2>
            <p className="text-gray-400 text-sm">Kelola donasi jamaah dengan mudah dan transparan.</p>
          </div>
        </Link>

        <Link href="/keuangan" className="group">
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center shadow-lg transition-all hover:scale-105 hover:shadow-2xl cursor-pointer">
            <h2 className="text-xl font-bold text-green-400 mb-2 group-hover:text-green-300">Keuangan</h2>
            <p className="text-gray-400 text-sm">Atur laporan pemasukan dan pengeluaran masjid.</p>
          </div>
        </Link>

        {role === 'admin' && (
          <Link href="/users" className="group">
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center shadow-lg transition-all hover:scale-105 hover:shadow-2xl cursor-pointer">
              <h2 className="text-xl font-bold text-purple-400 mb-2 group-hover:text-purple-300">Kelola User</h2>
              <p className="text-gray-400 text-sm">Manajemen user untuk akses sistem AlMasjid.</p>
            </div>
          </Link>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="mt-12 px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
