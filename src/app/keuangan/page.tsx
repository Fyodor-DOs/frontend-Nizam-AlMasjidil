'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '@/utils/api';

const KeuanganPage = () => {
  const [keuangan, setKeuangan] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedKeuangan, setSelectedKeuangan] = useState<any | null>(null);
  const [keterangan, setKeterangan] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [totalSaldo, setTotalSaldo] = useState<number>(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (showModal || showDetailModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal, showDetailModal]);

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
      const jumlahString = String(item.jumlah);
      const jumlahAngka = parseFloat(jumlahString); 
      if (!isNaN(jumlahAngka)) { 
        if (item.tipe_keuangan_id === 1) { 
          total += jumlahAngka;
        } else if (item.tipe_keuangan_id === 2) { 
          total -= jumlahAngka;
        }
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

  const handleShowDetail = (item: any) => {
    setSelectedKeuangan(item);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1614] text-white px-4 py-10">
      <div className="w-full max-w-5xl p-6 border border-white/10 bg-white/5 backdrop-blur-md shadow-xl rounded-2xl">
        <button onClick={handleBack} className="text-yellow-300 hover:text-yellow-400 mb-4">
          &larr; Kembali ke Dashboard
        </button>

        <div className="flex items-center justify-between mb-6 relative">
          <h1 className="text-2xl font-bold text-center w-full text-yellow-400">Histori Keuangan</h1>
          {(userRole === 'admin' || userRole === 'takmir') && (
            <div className="absolute top-0 right-0 flex space-x-2">
              <button
                onClick={() => setShowModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm sm:text-base"
              >
                Buat Pengeluaran
              </button>
              <button
                onClick={() => router.push('/laporan-keuangan')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm sm:text-base"
              >
                Laporan Keuangan
              </button>
            </div>
          )}
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold">Total Saldo</h2>
          <p className={`text-2xl font-bold ${totalSaldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            Rp {totalSaldo.toLocaleString('id-ID')}
          </p>
        </div>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2"> 
          {keuangan.length > 0 ? (
            keuangan.map((item) => (
              <div
                key={item.id}
                onClick={() => handleShowDetail(item)}
                className="p-4 border border-white/10 bg-white/10 backdrop-blur rounded-xl hover:bg-white/20 transition cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-yellow-300">{item.keterangan}</p>
                    <p className="text-sm text-gray-300">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className={`font-bold ${item.tipe_keuangan_id === 1 ? 'text-green-400' : 'text-red-400'}`}>
                    {item.tipe_keuangan_id === 1 ? '+' : '-'} Rp {parseFloat(String(item.jumlah).replace(/[^\d.-]/g, '')).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">Belum ada histori keuangan.</p>
          )}
        </div>

        {/* Modal Detail */}
        {showDetailModal && selectedKeuangan && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="border border-gray-700 bg-[#1F1B19] p-6 rounded-lg shadow-2xl w-full max-w-md text-white max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 text-center text-yellow-400">Detail Transaksi</h2>
              <div className="space-y-3">
                <p><strong>Keterangan:</strong> {selectedKeuangan.keterangan}</p>
                <p><strong>Tanggal:</strong> {new Date(selectedKeuangan.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Jumlah:</strong>
                  <span className={selectedKeuangan.tipe_keuangan_id === 1 ? 'text-green-400' : 'text-red-400'}>
                    {' '}Rp {parseFloat(String(selectedKeuangan.jumlah).replace(/[^\d.-]/g, '')).toLocaleString('id-ID')}
                  </span>
                </p>
                <p><strong>Tipe:</strong>
                  <span className={`font-semibold ${selectedKeuangan.tipe_keuangan_id === 1 ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedKeuangan.tipe_keuangan_id === 1 ? ' Pemasukan' : ' Pengeluaran'}
                  </span>
                </p>
                {selectedKeuangan.user && (
                  <p><strong>Dicatat oleh:</strong> {selectedKeuangan.user.nama}</p>
                )}
                {selectedKeuangan.payment_method && ( 
                  <p><strong>Metode Pembayaran:</strong> {selectedKeuangan.payment_method}</p>
                )}
                {selectedKeuangan.nama_donatur && ( 
                  <p><strong>Nama Donatur:</strong> {selectedKeuangan.nama_donatur}</p>
                )}
              </div>
              <div className="flex justify-end mt-8">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedKeuangan(null);
                  }}
                  className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Tambah Pengeluaran */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="border border-gray-700 bg-[#1F1B19] p-6 rounded-lg shadow-2xl w-full max-w-md text-white max-h-[90vh] overflow-y-auto">
              {/* ^^^ TAMBAHKAN max-h-[90vh] overflow-y-auto di sini */}
              <h2 className="text-2xl font-bold mb-6 text-center text-yellow-400">Buat Pengeluaran Baru</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Keterangan Pengeluaran"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full border border-gray-600 p-3 rounded bg-gray-800 text-white placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500"
                />
                <input
                  type="number"
                  placeholder="Jumlah (contoh: 50000)"
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  className="w-full border border-gray-600 p-3 rounded bg-gray-800 text-white placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500"
                />
                <input
                  type="date"
                  placeholder="Tanggal"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full border border-gray-600 p-3 rounded bg-gray-800 text-white placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setKeterangan(''); setJumlah(''); setTanggal(''); // Reset form
                  }}
                  className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
                >
                  Batal
                </button>
                <button
                  onClick={handleCreatePengeluaran}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
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