'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Pastikan import Link
import api, { setAuthToken } from '@/utils/api';

const KeuanganPage = () => {
  const [keuangan, setKeuangan] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
    } else {
      setAuthToken(token);
      fetchKeuangan();
    }
  }, [router]);

  const fetchKeuangan = async () => {
    try {
      const response = await api.get('/keuangan');
      setKeuangan(response.data);
    } catch (err: any) {
      console.error('Fetch Error:', err);
      setError(err?.response?.data?.message || 'Failed to fetch keuangan data');
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black">
      <div className="w-full max-w-2xl p-8 border border-gray-300 shadow-lg rounded-lg">
        
        {/* Tombol Kembali ke Dashboard */}
        <button
          onClick={handleBack}
          className="text-blue-500 hover:text-blue-700 mb-4"
        >
          Kembali ke Dashboard
        </button>

        <h1 className="text-2xl font-bold mb-6 text-center">Histori Keuangan</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="space-y-4">
          {keuangan.length > 0 ? (
            keuangan.map((item) => (
              <Link key={item.id} href={`/keuangan/${item.id}`}>
                <div className="p-4 border border-gray-200 rounded hover:bg-gray-100 transition cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{item.keterangan}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(item.tanggal).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className={`font-bold ${item.tipe_keuangan_id === 1 ? 'text-green-500' : 'text-red-500'}`}>
                      Rp {item.jumlah.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-500">Belum ada histori keuangan.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default KeuanganPage;
