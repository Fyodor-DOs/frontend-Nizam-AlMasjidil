'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '@/utils/api';
import Navbar from '@/components/Navbar';
import { PlusCircle, FileText } from 'lucide-react'; // Import icons from lucide-react

interface User {
  id: number;
  nama: string;
  email: string;
  role: string;
}

const KeuanganPage = () => {
  const [keuangan, setKeuangan] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false); // For Add Pengeluaran
  const [showDetailModal, setShowDetailModal] = useState(false); // For Detail Transaction
  const [selectedKeuangan, setSelectedKeuangan] = useState<any | null>(null);
  const [keterangan, setKeterangan] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [totalSaldo, setTotalSaldo] = useState<number>(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); // Explicitly type user
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
      setError(err?.response?.data?.message || 'Gagal mengambil data keuangan');
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
        if (item.tipe_keuangan_id === 1) { // Pemasukan
          total += jumlahAngka;
        } else if (item.tipe_keuangan_id === 2) { // Pengeluaran
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
        tipe_keuangan_id: 2, // Hardcoded for Pengeluaran
      });
      setShowModal(false);
      setKeterangan('');
      setJumlah('');
      setTanggal('');
      await fetchKeuangan(); // Re-fetch to update the list and total saldo
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
    <div className="min-h-screen bg-[#1A1614] text-white">
      <Navbar role={userRole} user={user} />

      {/* Hero Section (Banner) */}
      <div className="relative h-96 w-full flex items-center justify-center overflow-hidden">
        <img
          src="/images/masjid7.jpg" // Using the same image as Donasi page
          alt="Masjid"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1614] via-[#1A1614]/50 to-transparent"></div>
        <div className="relative z-10 text-center p-4">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-white drop-shadow-lg">
            Transparansi Keuangan Masjid
          </h1>
          <p className="mt-4 text-xl md:text-2xl font-light text-gray-200">
            Catat dan kelola setiap pemasukan dan pengeluaran dengan akurat.
          </p>
        </div>
      </div>

      {/* Main Content - Description and Table */}
      <div className="container mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Description Section */}
        <div className="text-center md:text-left">
          <h2 className="text-4xl font-bold mb-6 text-yellow-400">
            Jaga Amanah Umat
          </h2>
          <p className="text-lg leading-relaxed mb-6 text-gray-300">
            Halaman keuangan ini menyediakan ringkasan lengkap semua transaksi, memastikan bahwa setiap rupiah dikelola dengan penuh tanggung jawab dan transparan.
          </p>
          <ul className="list-disc list-inside text-lg space-y-3 mb-8 text-gray-300">
            <li>**Pemasukan:** Donasi, infak, dan sumber pendapatan lainnya.</li>
            <li>**Pengeluaran:** Biaya operasional, program sosial, pemeliharaan, dll.</li>
            <li>**Total Saldo:** Gambaran instan tentang kondisi keuangan masjid.</li>
            <li>**Histori Transaksi:** Detail setiap transaksi untuk audit dan pelaporan.</li>
          </ul>
          <p className="text-xl leading-relaxed font-semibold text-yellow-300">
            Setiap catatan adalah wujud komitmen kami terhadap transparansi.
          </p>
          {/* "Kembali ke Beranda" Button - Moved here */}
          <div className="mt-8"> {/* Added margin-top for spacing */}
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-yellow-400 text-black font-semibold py-3 px-6 rounded-full hover:bg-yellow-500 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              ← Kembali ke Beranda
            </button>
          </div>
        </div>

        {/* Keuangan Data Section (resembling donation form card) */}
        <div className="bg-black rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-yellow-400 text-black py-4 px-6 text-center font-bold text-lg relative">
            Histori Keuangan Masjid
            {(userRole === 'admin' || userRole === 'takmir') && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex space-x-2">
                <button
                  onClick={() => router.push('/laporan-keuangan')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 flex items-center gap-1" // Added flex and gap for icon
                >
                  <FileText size={16} /> {/* Laporan Icon */}
                  Laporan
                </button>
              </div>
            )}
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-400 text-center text-sm">
                {error}
              </div>
            )}

            <div className="text-center mb-6 p-4 bg-[#1A1614] border border-yellow-400/20 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-400">Total Saldo Kas Masjid</h3>
              <p className={`text-3xl font-bold ${totalSaldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                Rp {totalSaldo.toLocaleString('id-ID')}
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-yellow-400 border-t-transparent"></div>
                <p className="mt-4 text-gray-400 text-lg">Memuat data keuangan...</p>
              </div>
            ) : keuangan.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-lg">Belum ada histori keuangan yang tercatat.</p>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-[#2a2421]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">Tanggal</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">Keterangan</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">Jumlah</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">Tipe</th>
                      </tr>
                    </thead>
                    <tbody className="bg-black divide-y divide-gray-800">
                      {currentItems.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-[#1A1614] transition duration-200 cursor-pointer"
                          onClick={() => {
                            setShowDetailModal(true);
                            setSelectedKeuangan(item);
                          }}
                        >
                          <td className="px-4 py-3 text-gray-300 text-sm">
                            {new Date(item.tanggal).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="text-yellow-400 font-medium">{item.keterangan}</span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`font-bold ${item.tipe_keuangan_id === 1 ? 'text-green-400' : 'text-red-400'}`}>
                              {item.tipe_keuangan_id === 1 ? '+' : '-'} Rp {parseFloat(String(item.jumlah).replace(/[^\d.-]/g, '')).toLocaleString('id-ID')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
                  <div className="flex justify-center items-center space-x-2 mt-6">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-semibold ${
                        currentPage === 1
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-[#2a2421] text-yellow-400 hover:bg-[#3a3231] transition-colors duration-200'
                      }`}
                    >
                      ← Sebelumnya
                    </button>

                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-4 py-2 rounded-lg font-semibold ${
                          currentPage === index + 1
                            ? 'bg-yellow-400 text-black'
                            : 'bg-[#2a2421] text-yellow-400 hover:bg-[#3a3231]'
                        } transition-colors duration-200`}
                      >
                        {index + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg font-semibold ${
                        currentPage === totalPages
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-[#2a2421] text-yellow-400 hover:bg-[#3a3231] transition-colors duration-200'
                      }`}
                    >
                      Selanjutnya →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button for 'Buat Pengeluaran' */}
      {(userRole === 'admin' || userRole === 'takmir') && (
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-transform transform hover:scale-105 duration-200 z-40 flex items-center justify-center"
          title="Buat Pengeluaran Baru"
        >
          <PlusCircle size={28} />
          <span className="sr-only">Buat Pengeluaran</span> {/* Accessibility for screen readers */}
        </button>
      )}


      {/* Modal Detail */}
      {showDetailModal && selectedKeuangan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="border border-gray-700 bg-[#1A1614] p-8 rounded-lg shadow-2xl w-full max-w-md text-white transform scale-100 transition-transform duration-300">
            <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">Detail Transaksi</h2>
            <div className="space-y-4 text-lg">
              <p><strong>Keterangan:</strong> <span className="text-gray-200">{selectedKeuangan.keterangan}</span></p>
              <p><strong>Tanggal:</strong> <span className="text-gray-200">{new Date(selectedKeuangan.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
              <p><strong>Jumlah:</strong>
                <span className={`font-bold ${selectedKeuangan.tipe_keuangan_id === 1 ? 'text-green-400' : 'text-red-400'}`}>
                  {' '}Rp {parseFloat(String(selectedKeuangan.jumlah).replace(/[^\d.-]/g, '')).toLocaleString('id-ID')}
                </span>
              </p>
              <p><strong>Tipe:</strong>
                <span className={`font-semibold ${selectedKeuangan.tipe_keuangan_id === 1 ? 'text-green-400' : 'text-red-400'}`}>
                  {selectedKeuangan.tipe_keuangan_id === 1 ? ' Pemasukan' : ' Pengeluaran'}
                </span>
              </p>
              {selectedKeuangan.user && (
                <p><strong>Dicatat oleh:</strong> <span className="text-gray-200">{selectedKeuangan.user.nama}</span></p>
              )}
              {selectedKeuangan.payment_method && (
                <p><strong>Metode Pembayaran:</strong> <span className="text-gray-200">{selectedKeuangan.payment_method}</span></p>
              )}
              {selectedKeuangan.nama_donatur && (
                <p><strong>Nama Donatur:</strong> <span className="text-gray-200">{selectedKeuangan.nama_donatur}</span></p>
              )}
            </div>
            <div className="flex justify-center mt-8">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedKeuangan(null);
                }}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-lg font-semibold transition-colors duration-200"
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
          <div className="border border-gray-700 bg-[#1A1614] p-8 rounded-lg shadow-2xl w-full max-w-md text-white transform scale-100 transition-transform duration-300">
            <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">Buat Pengeluaran Baru</h2>
            {error && (
              <div className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-400 text-center text-sm">
                {error}
              </div>
            )}
            <div className="space-y-5">
              <div>
                <label className="block mb-2 font-semibold text-gray-300">Keterangan Pengeluaran</label>
                <input
                  type="text"
                  placeholder="Contoh: Pembelian alat kebersihan"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full p-4 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 text-lg"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-300">Jumlah (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 150.000"
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  className="w-full p-4 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 text-lg"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-300">Tanggal</label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full p-4 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-yellow-500 focus:border-yellow-500 text-lg"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => {
                  setShowModal(false);
                  setKeterangan('');
                  setJumlah('');
                  setTanggal('');
                  setError(null); // Clear error on cancel
                }}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-lg font-semibold transition-colors duration-200"
                disabled={isLoading}
              >
                Batal
              </button>
              <button
                onClick={handleCreatePengeluaran}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-md text-lg font-semibold disabled:opacity-50 transition-colors duration-200 flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  'Simpan Pengeluaran'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeuanganPage;