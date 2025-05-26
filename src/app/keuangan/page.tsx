'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '@/utils/api';
import Navbar from '@/components/Navbar';

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
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
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
      fetchUserData();
      fetchKeuangan();
    }
  }, [router]);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/user');
      setUser(response.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchKeuangan = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/keuangan');
      const data = response.data;
      // Sort data by date (newest first)
      const sortedData = data.sort((a: any, b: any) => 
        new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
      );
      setKeuangan(sortedData);
      hitungTotalSaldo(sortedData);
    } catch (err: any) {
      console.error('Fetch Error:', err);
      setError(err?.response?.data?.message || 'Failed to fetch keuangan data');
    } finally {
      setIsLoading(false);
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
      setError('Semua field harus diisi!');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
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
      await fetchKeuangan();
    } catch (err: any) {
      console.error('Error tambah pengeluaran:', err);
      setError(err?.response?.data?.message || 'Gagal menambah pengeluaran');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = keuangan.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(keuangan.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-[#1A1614] pt-15">
      <Navbar role={userRole} user={user}/>
      
      {/* Banner */}
      <div className="relative h-64 w-full">
        <img
          src="/images/masjid7.jpg"
          alt="Banner Keuangan"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-3xl md:text-4xl font-bold">Manajemen Keuangan Masjid</h1>
        </div>
      </div>

      {/* Deskripsi */}
      <div className="max-w-3xl mx-auto px-6 py-10 text-center">
        <h2 className="text-2xl font-semibold text-white mb-4">Transparansi Keuangan Masjid</h2>
        <p className="text-white text-md leading-relaxed">
          Pantau dan kelola keuangan masjid dengan transparan untuk mendukung kegiatan dakwah, pendidikan, dan sosial yang diselenggarakan.
        </p>
      </div>

      {/* Container */}
      <div className="max-w-4xl mx-auto px-4 pb-10">
        <div className="bg-black rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-yellow-400 text-black py-4 px-6 text-center font-bold text-lg relative">
            Histori Keuangan
            {(userRole === 'admin' || userRole === 'takmir') && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex space-x-2">
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm"
                >
                  Buat Pengeluaran
                </button>
                <button
                  onClick={() => router.push('/laporan-keuangan')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm"
                >
                  Laporan
                </button>
              </div>
            )}
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded text-red-500 text-center">
                {error}
              </div>
            )}

            <div className="text-center mb-6 p-4 bg-[#1A1614] border border-yellow-400/20 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-400">Total Saldo</h3>
              <p className={`text-2xl font-bold ${totalSaldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                Rp {totalSaldo.toLocaleString('id-ID')}
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-yellow-400 border-t-transparent"></div>
                <p className="mt-2 text-gray-400">Memuat data...</p>
              </div>
            ) : keuangan.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Belum ada histori keuangan.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#2a2421] text-yellow-400">
                        <th className="px-4 py-3 text-left">Tanggal</th>
                        <th className="px-4 py-3 text-left">Keterangan</th>
                        <th className="px-4 py-3 text-left">Jumlah</th>
                        <th className="px-4 py-3 text-left">Tipe</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {currentItems.map((item) => (
                        <tr 
                          key={item.id}
                          className="hover:bg-[#2a2421] transition cursor-pointer"
                          onClick={() => {
                            setShowDetailModal(true);
                            setSelectedKeuangan(item);
                          }}
                        >
                          <td className="px-4 py-3 text-gray-300">
                            {new Date(item.tanggal).toLocaleDateString('id-ID', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-yellow-400 font-medium">{item.keterangan}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-bold ${item.tipe_keuangan_id === 1 ? 'text-green-400' : 'text-red-400'}`}>
                              {item.tipe_keuangan_id === 1 ? '+' : '-'} Rp {parseFloat(String(item.jumlah).replace(/[^\d.-]/g, '')).toLocaleString('id-ID')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-sm ${
                              item.tipe_keuangan_id === 1 
                                ? 'bg-green-400/20 text-green-400' 
                                : 'bg-red-400/20 text-red-400'
                            }`}>
                              {item.tipe_keuangan_id === 1 ? 'Pemasukan' : 'Pengeluaran'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-4">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded ${
                        currentPage === 1
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-[#2a2421] text-yellow-400 hover:bg-[#3a3231]'
                      }`}
                    >
                      ←
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-3 py-1 rounded ${
                          currentPage === index + 1
                            ? 'bg-yellow-400 text-black'
                            : 'bg-[#2a2421] text-yellow-400 hover:bg-[#3a3231]'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded ${
                        currentPage === totalPages
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-[#2a2421] text-yellow-400 hover:bg-[#3a3231]'
                      }`}
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}

            <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 text-sm text-yellow-600 hover:underline block text-center"
            >
              ← Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail */}
      {showDetailModal && selectedKeuangan && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="border border-gray-700 bg-[#1A1614] p-6 rounded-lg shadow-2xl w-full max-w-md text-white">
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
                <span className={`font-semibold ${selectedKeuangan.tipe_keuangan_id === 1 ? 'text-green-400' : 'text-red-400'}`}>
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="border border-gray-700 bg-[#1A1614] p-6 rounded-lg shadow-2xl w-full max-w-md text-white">
            <h2 className="text-2xl font-bold mb-6 text-center text-yellow-400">Buat Pengeluaran Baru</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-300">Keterangan Pengeluaran</label>
                <input
                  type="text"
                  placeholder="Keterangan Pengeluaran"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-300">Jumlah (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 50000"
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-300">Tanggal</label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => {
                  setShowModal(false);
                  setKeterangan('');
                  setJumlah('');
                  setTanggal('');
                }}
                className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
                disabled={isLoading}
              >
                Batal
              </button>
              <button
                onClick={handleCreatePengeluaran}
                className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeuanganPage;