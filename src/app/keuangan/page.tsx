'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '@/utils/api';
import Navbar from '@/components/Navbar';
import { PlusCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image'; 

interface User {
  id: number;
  nama: string;
  email: string;
  role: string;
}

interface KeuanganItem {
  id: number;
  tanggal: string;
  keterangan: string;
  jumlah: string;
  tipe_keuangan_id: 1 | 2; 
  gambar?: string;
  user?: {
    nama: string;
  };
  payment_method?: string;
  nama_donatur?: string;
}

const KeuanganPage = () => {
  const [keuangan, setKeuangan] = useState<KeuanganItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedKeuangan, setSelectedKeuangan] = useState<KeuanganItem | null>(null);
  const [keterangan, setKeterangan] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [gambar, setGambar] = useState<File | null>(null);
  const [totalSaldo, setTotalSaldo] = useState<number>(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
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

  const fetchUserData = useCallback(async () => {
    try {
      const response = await api.get('/user');
      setUser(response.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  }, []);

  const hitungTotalSaldo = (data: KeuanganItem[]) => {
    let total = 0;
    data.forEach((item) => {
      const jumlahAngka = parseFloat(String(item.jumlah));
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

  const fetchKeuangan = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/keuangan');
      const data: KeuanganItem[] = response.data;
      const sortedData = data.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
      setKeuangan(sortedData);
      hitungTotalSaldo(sortedData);
    } catch (err: unknown) { 
      console.error('Fetch Error:', err);
      if (typeof err === 'object' && err !== null && 'response' in err) {
          const response = err.response as { data?: { message?: string } };
          setError(response.data?.message || 'Gagal mengambil data keuangan');
      } else {
          setError('Gagal mengambil data keuangan');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

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
  }, [router, fetchUserData, fetchKeuangan]); 
  const handleCreatePengeluaran = async () => {
    if (!keterangan || !jumlah || !tanggal || !gambar) {
      setError('Semua field harus diisi, termasuk bukti pengeluaran!');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('keterangan', keterangan);
      formData.append('jumlah', jumlah);
      formData.append('tanggal', tanggal);
      formData.append('tipe_keuangan_id', '2');
      if (gambar) {
        formData.append('gambar', gambar);
      }

      await api.post('/keuangan', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      setShowModal(false);
      setKeterangan('');
      setJumlah('');
      setTanggal('');
      setGambar(null);
      await fetchKeuangan();
    } catch (err: unknown) {
      console.error('Error tambah pengeluaran:', err);
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const response = err.response as { data?: { message?: string } };
        setError(response.data?.message || 'Gagal menambah pengeluaran');
      } else {
        setError('Gagal menambah pengeluaran');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = keuangan.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(keuangan.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
  const sectionVariants = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } } };
  const cardVariants = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } } };
  const modalVariants = { hidden: { opacity: 0, scale: 0.8, y: -50 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 300 } }, exit: { opacity: 0, scale: 0.8, y: 50, transition: { duration: 0.2 } } };
  const buttonHoverTap = { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } };
  const tableRowVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
  const messageVariants = { hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }, exit: { opacity: 0, y: 20, transition: { duration: 0.3 } } };

  return (
    <div className="min-h-screen bg-[#1A1614] text-white">
      <Navbar role={userRole} user={user} />

      <div className="relative h-96 w-full flex items-center justify-center overflow-hidden">
        <Image
          src="/images/masjid7.jpg"
          alt="Masjid"
          fill
          priority
          className="object-cover opacity-50"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1614] via-[#1A1614]/50 to-transparent"></div>
        <motion.div
          className="relative z-10 text-center p-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-white drop-shadow-lg" variants={itemVariants} >
            Transparansi Keuangan Masjid
          </motion.h1>
          <motion.p className="mt-4 text-xl md:text-2xl font-light text-gray-200" variants={itemVariants} >
            Catat dan kelola setiap pemasukan dan pengeluaran dengan akurat.
          </motion.p>
        </motion.div>
      </div>

      <div className="container mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <motion.div
          className="text-center md:text-left"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2 className="text-4xl font-bold mb-6 text-yellow-400" variants={itemVariants}>
            Jaga Amanah Umat
          </motion.h2>
          <motion.p className="text-lg leading-relaxed mb-6 text-gray-300" variants={itemVariants}>
            Halaman keuangan ini menyediakan ringkasan lengkap semua transaksi, memastikan bahwa setiap rupiah dikelola dengan penuh tanggung jawab dan transparan.
          </motion.p>
          <motion.ul className="list-disc list-inside text-lg space-y-3 mb-8 text-gray-300" variants={containerVariants}>
            <motion.li variants={itemVariants}>**Pemasukan:** Donasi, infak, dan sumber pendapatan lainnya.</motion.li>
            <motion.li variants={itemVariants}>**Pengeluaran:** Biaya operasional, program sosial, pemeliharaan, dll.</motion.li>
            <motion.li variants={itemVariants}>**Total Saldo:** Gambaran instan tentang kondisi keuangan masjid.</motion.li>
            <motion.li variants={itemVariants}>**Histori Transaksi:** Detail setiap transaksi untuk audit dan pelaporan.</motion.li>
          </motion.ul>
          <motion.p className="text-xl leading-relaxed font-semibold text-yellow-300" variants={itemVariants}>
            Setiap catatan adalah wujud komitmen kami terhadap transparansi.
          </motion.p>
          <motion.div className="mt-8" variants={itemVariants}>
            <motion.button
              onClick={() => router.push('/dashboard')}
              className="bg-yellow-400 text-black font-semibold py-3 px-6 rounded-full hover:bg-yellow-500 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              {...buttonHoverTap}
            >
              Kembali ke Beranda
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          className="bg-black rounded-2xl shadow-2xl overflow-hidden"
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="bg-yellow-400 text-black py-4 px-6 text-center font-bold text-lg relative">
            Histori Keuangan Masjid
            {(userRole === 'admin' || userRole === 'takmir') && (
              <motion.div
                className="absolute right-4 top-1/2 transform -translate-y-1/2 flex space-x-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  onClick={() => router.push('/laporan-keuangan')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 flex items-center gap-1"
                  {...buttonHoverTap}
                >
                  <FileText size={16} />
                  Laporan
                </motion.button>
              </motion.div>
            )}
          </div>

          <div className="p-8">
            <AnimatePresence>
              {error && (
                <motion.div
                  className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-400 text-center text-sm"
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="text-center mb-6 p-4 bg-[#1A1614] border border-yellow-400/20 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-yellow-400">Total Saldo Kas Masjid</h3>
              <motion.p
                className={`text-3xl font-bold ${totalSaldo >= 0 ? 'text-green-400' : 'text-red-400'}`}
                key={totalSaldo}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Rp {totalSaldo.toLocaleString('id-ID')}
              </motion.p>
            </motion.div>

            {isLoading ? (
              <div className="text-center py-8">
                <motion.div
                  className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-yellow-400 border-t-transparent"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ ease: "linear", duration: 1, repeat: Infinity }}
                ></motion.div>
                <motion.p
                  className="mt-4 text-gray-400 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Memuat data keuangan...
                </motion.p>
              </div>
            ) : keuangan.length === 0 ? (
              <motion.p
                className="text-center text-gray-400 py-8 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Belum ada histori keuangan yang tercatat.
              </motion.p>
            ) : (
              <>
                <motion.div
                  className="overflow-x-auto rounded-lg border border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
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
                      <AnimatePresence mode="wait">
                        {currentItems.map((item) => (
                          <motion.tr
                            key={item.id}
                            className="hover:bg-[#1A1614] transition duration-200 cursor-pointer"
                            onClick={() => { setShowDetailModal(true); setSelectedKeuangan(item); }}
                            variants={tableRowVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            layout
                          >
                            <td className="px-4 py-3 text-gray-300 text-sm">
                              {new Date(item.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
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
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.tipe_keuangan_id === 1 ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}`}>
                                {item.tipe_keuangan_id === 1 ? 'Pemasukan' : 'Pengeluaran'}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </motion.div>

                {totalPages > 1 && (
                  <motion.div
                    className="flex justify-center items-center space-x-2 mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`px-4 py-2 rounded-lg font-semibold ${currentPage === 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-[#2a2421] text-yellow-400 hover:bg-[#3a3231] transition-colors duration-200'}`} {...buttonHoverTap} >
                      ← Sebelumnya
                    </motion.button>
                    {[...Array(totalPages)].map((_, index) => (
                      <motion.button key={index + 1} onClick={() => handlePageChange(index + 1)} className={`px-4 py-2 rounded-lg font-semibold ${currentPage === index + 1 ? 'bg-yellow-400 text-black' : 'bg-[#2a2421] text-yellow-400 hover:bg-[#3a3231]'} transition-colors duration-200`} {...buttonHoverTap}>
                        {index + 1}
                      </motion.button>
                    ))}
                    <motion.button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`px-4 py-2 rounded-lg font-semibold ${currentPage === totalPages ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-[#2a2421] text-yellow-400 hover:bg-[#3a3231] transition-colors duration-200'}`} {...buttonHoverTap} >
                      Selanjutnya →
                    </motion.button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>

      {(userRole === 'admin' || userRole === 'takmir') && (
        <motion.button onClick={() => setShowModal(true)} className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-transform transform hover:scale-105 duration-200 z-40 flex items-center justify-center" title="Buat Pengeluaran Baru" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.8 }} {...buttonHoverTap} >
          <PlusCircle size={28} />
          <span className="sr-only">Buat Pengeluaran</span>
        </motion.button>
      )}

      <AnimatePresence>
        {showDetailModal && selectedKeuangan && (
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} >
            <motion.div className="border border-gray-700 bg-[#1A1614] rounded-lg shadow-2xl w-full max-w-2xl text-white flex flex-col max-h-[90vh]" variants={modalVariants} initial="hidden" animate="visible" exit="exit" >
              <div className="p-8 overflow-y-auto">
                <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">Detail Transaksi</h2>
                {selectedKeuangan.tipe_keuangan_id === 2 && selectedKeuangan.gambar && (
                  <motion.div className="mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} >
                    <div className="relative w-full h-auto max-h-[50vh] overflow-hidden rounded-lg border border-gray-700">
                       <Image
                        src={`http://localhost:8000${selectedKeuangan.gambar}`}
                        alt="Bukti Pengeluaran"
                        width={800}
                        height={600}
                        style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                      />
                    </div>
                    <p className="text-sm text-gray-400 mt-2 text-center">Bukti Pengeluaran</p>
                  </motion.div>
                )}
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
                  {selectedKeuangan.user && (<p><strong>Dicatat oleh:</strong> <span className="text-gray-200">{selectedKeuangan.user.nama}</span></p>)}
                  {selectedKeuangan.payment_method && (<p><strong>Metode Pembayaran:</strong> <span className="text-gray-200">{selectedKeuangan.payment_method}</span></p>)}
                  {selectedKeuangan.nama_donatur && (<p><strong>Nama Donatur:</strong> <span className="text-gray-200">{selectedKeuangan.nama_donatur}</span></p>)}
                </div>
                <div className="flex justify-center mt-8">
                  <motion.button onClick={() => { setShowDetailModal(false); setSelectedKeuangan(null); }} className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-lg font-semibold transition-colors duration-200" {...buttonHoverTap} >
                    Tutup
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="border border-gray-700 bg-[#1A1614] p-8 rounded-lg shadow-2xl w-full max-w-md text-white" variants={modalVariants} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">Buat Pengeluaran Baru</h2>
              <AnimatePresence>
                {error && (
                  <motion.div className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-400 text-center text-sm" variants={messageVariants} initial="hidden" animate="visible" exit="exit">
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-5">
                <motion.div variants={itemVariants}>
                  <label className="block mb-2 font-semibold text-gray-300">Keterangan Pengeluaran</label>
                  <input type="text" placeholder="Contoh: Pembelian alat kebersihan" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} className="w-full p-4 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 text-lg" required />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label className="block mb-2 font-semibold text-gray-300">Jumlah (Rp)</label>
                  <input type="number" placeholder="Contoh: 150.000" value={jumlah} onChange={(e) => setJumlah(e.target.value)} className="w-full p-4 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 text-lg" required />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label className="block mb-2 font-semibold text-gray-300">Tanggal</label>
                  <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full p-4 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-yellow-500 focus:border-yellow-500 text-lg" required />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label htmlFor="gambar" className="block font-semibold mb-2 text-gray-300 text-lg">Bukti Pengeluaran</label>
                  <input type="file" id="gambar" name="gambar" accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setGambar(file);
                      } else {
                        setGambar(null);
                      }
                    }}
                    className="w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-gray-900 hover:file:bg-yellow-600 transition duration-200 cursor-pointer"
                  />
                </motion.div>
              </div>
              <div className="flex justify-end space-x-4 mt-8">
                <motion.button onClick={() => { setShowModal(false); setKeterangan(''); setJumlah(''); setTanggal(''); setGambar(null); setError(null); }} className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-lg font-semibold transition-colors duration-200" disabled={isLoading} {...buttonHoverTap}>
                  Batal
                </motion.button>
                <motion.button onClick={handleCreatePengeluaran} className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-md text-lg font-semibold disabled:opacity-50 transition-colors duration-200 flex items-center gap-2" disabled={isLoading} {...buttonHoverTap}>
                  {isLoading ? (
                    <>
                      <motion.svg className="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ ease: "linear", duration: 1, repeat: Infinity }}>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </motion.svg>
                      <span>Menyimpan...</span>
                    </>
                  ) : 'Simpan Pengeluaran'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KeuanganPage; 