'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api, { setAuthToken } from '@/utils/api';

const KeuanganDetailPage = () => {
  const [keuangan, setKeuangan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
    } else {
      setAuthToken(token);
      fetchKeuanganDetail();
    }
  }, [router]);

  const fetchKeuanganDetail = async () => {
    try {
      const response = await api.get(`/keuangan/${params.id}`);
      setKeuangan(response.data);
    } catch (err: any) {
      console.error('Fetch Error:', err);
      setError(err?.response?.data?.message || 'Failed to fetch keuangan detail');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!keuangan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black">
      <div className="w-full max-w-md p-8 border border-gray-300 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Detail Keuangan</h1>

        <div className="space-y-4">
          <div>
            <p className="text-gray-600">Keterangan:</p>
            <p className="font-semibold">{keuangan.keterangan}</p>
          </div>
          <div>
            <p className="text-gray-600">Jumlah:</p>
            <p className={`font-bold ${keuangan.tipe_keuangan_id === 1 ? 'text-green-500' : 'text-red-500'}`}>
              Rp {keuangan.jumlah.toLocaleString('id-ID')}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Tanggal:</p>
            <p className="font-semibold">
              {new Date(keuangan.tanggal).toLocaleDateString('id-ID')}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Tipe Keuangan:</p>
            <p className="font-semibold">
              {keuangan.tipe_keuangan_id === 1 ? 'Pemasukan' : 'Pengeluaran'}
            </p>
          </div>
        </div>
        <div className="mt-6">
          <Link href="/keuangan">
            <button className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded">
              Kembali ke Keuangan
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default KeuanganDetailPage;
