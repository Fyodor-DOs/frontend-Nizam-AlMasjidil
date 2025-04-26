'use client';

import React, { useEffect, useState } from 'react';
import api, { setAuthToken } from '@/utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Dashboard = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
    } else {
      setAuthToken(token);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black">
      <div className="w-full max-w-3xl p-8 border border-gray-300 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Dashboard</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="flex flex-col items-center space-y-4 mb-6">
          {/* Tombol ke Halaman Donasi */}
          <Link href="/donasi">
            <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded">
              Donasi
            </button>
          </Link>

          {/* Tombol ke Halaman Keuangan */}
          <Link href="/keuangan">
            <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded">
              Keuangan
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
