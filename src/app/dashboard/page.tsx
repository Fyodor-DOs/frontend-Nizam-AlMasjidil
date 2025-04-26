'use client';

import React, { useEffect, useState } from 'react';
import api, { setAuthToken } from '@/utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Dashboard = () => {
  const [keuangan, setKeuangan] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);

      const fetchData = async () => {
        try {
          const response = await api.get('/keuangan');
          setKeuangan(response.data);
        } catch (err: any) {
          console.error('Fetch Error:', err);
          setError(err?.response?.data?.message || 'Failed to fetch data');
          router.push('/login');
        }
      };

      fetchData();
    } else {
      // Kalau tidak ada token, langsung redirect
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black">
      <div className="w-full max-w-3xl p-8 border border-gray-300 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Dashboard</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Tombol navigasi ke halaman Donasi */}
        <div className="flex justify-center mb-6">
          <Link href="/donasi">
            <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded">
              Ke Halaman Donasi
            </button>
          </Link>
        </div>

        {/* Data Keuangan */}
        <div className="space-y-4">
          {keuangan.length > 0 ? (
            keuangan.map((item) => (
              <div
                key={item.id}
                className="p-4 border border-gray-200 rounded-lg shadow-sm"
              >
                <p className="font-semibold">{item.keterangan}</p>
                <p className="text-gray-600">Rp {item.jumlah.toLocaleString('id-ID')}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">Belum ada data keuangan.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
