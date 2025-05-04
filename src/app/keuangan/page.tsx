'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { setAuthToken } from '@/utils/api';

const KeuanganPage = () => {
  const [keuangan, setKeuangan] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [keterangan, setKeterangan] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [totalSaldo, setTotalSaldo] = useState<number>(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
  
    if (!token) {
      router.push('/login');
    } else {
      setAuthToken(token);
      setUserRole(role);
      fetchKeuangan();
    }
  }, [router]);
  

  const fetchKeuangan = async () => {
    try {
      const response = await api.get('/keuangan');
      const data = response.data;
      setKeuangan(data);
      hitungTotalSaldo(data);
    } catch (err: any) {
      console.error('Fetch Error:', err);
      setError(err?.response?.data?.message || 'Failed to fetch keuangan data');
    }
  };

  const hitungTotalSaldo = (data: any[]) => {
      let total = 0;
      data.forEach((item) => {
        const jumlah = parseFloat(item.jumlah.replace('Rp', '').replace(',', '').trim());
        if (item.tipe_keuangan_id === 1) {
          total += jumlah;
        } else if (item.tipe_keuangan_id === 2) {
          total -= jumlah;
        }
      });
      setTotalSaldo(total);
  };

  const handleCreatePengeluaran = async () => {
    if (!keterangan || !jumlah || !tanggal) {
      alert('Semua field harus diisi!');
      return;
    }

    try {
      await api.post('/keuangan', {
        keterangan,
        jumlah: parseFloat(jumlah),
        tanggal,
        tipe_keuangan_id: 2, 
      });
      setShowModal(false);
      setKeterangan('');
      setJumlah('');
      setTanggal('');
      fetchKeuangan(); 
    } catch (err) {
      console.error('Error tambah pengeluaran:', err);
      alert('Gagal menambah pengeluaran');
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black">
      <div className="w-full max-w-5xl p-8 border border-gray-300 shadow-lg rounded-lg relative">
        <button
          onClick={handleBack}
          className="text-blue-500 hover:text-blue-700 mb-4"
        >
          Kembali ke Dashboard
        </button>
        <div className="flex items-center justify-between mb-6 relative">
          <h1 className="text-2xl font-bold text-center w-full">Histori Keuangan</h1>

          {(userRole === 'admin' || userRole === 'takmir') && (
            <div className="absolute top-0 right-0 flex space-x-2">
              <button
                onClick={() => setShowModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Buat Pengeluaran
              </button>
              <button
                onClick={() => router.push('/laporan-keuangan')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Laporan Keuangan
              </button>
            </div>
          )}
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold">Total Saldo</h2>
          <p className={`text-2xl font-bold ${totalSaldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Rp {totalSaldo.toLocaleString('id-ID')}
          </p>
        </div>
        
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

        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-center">Buat Pengeluaran</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Keterangan"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full border p-2 rounded"
                />
                <input
                  type="number"
                  placeholder="Jumlah"
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  className="w-full border p-2 rounded"
                />
                <input
                  type="date"
                  placeholder="Tanggal"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                >
                  Batal
                </button>
                <button
                  onClick={handleCreatePengeluaran}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default KeuanganPage;
