'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '@/utils/api';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Kegiatan = {
  id: number;
  nama_kegiatan: string;
  deskripsi: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  gambar?: string;
};

interface User {
  id: number;
  nama: string;
  email: string;
  role: string;
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7 } },
};

const slideInFromLeft = {
  hidden: { x: -100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

const slideInFromRight = {
  hidden: { x: 100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8, y: -50 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 25 } },
  exit: { opacity: 0, scale: 0.8, y: -50, transition: { duration: 0.3 } },
};

const KegiatanPage = () => {
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nama_kegiatan: '',
    deskripsi: '',
    tanggal: '',
    waktu: '',
    lokasi: '',
  });
  const [gambar, setGambar] = useState<File | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (showModal || selectedKegiatan || showDeleteDialog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal, selectedKegiatan, showDeleteDialog]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    if (token) {
      setAuthToken(token);
      setUserRole(role);
      fetchUserData();
      fetchKegiatan();
    } else {
      router.push('/login');
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

  const fetchKegiatan = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/kegiatan');
      setKegiatanList(response.data);
    } catch (err: any) {
      console.error('Fetch Kegiatan Error:', err);
      setError('Gagal mengambil data kegiatan. Silakan coba lagi nanti.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdateKegiatan = async () => {
    if (userRole !== 'admin' && userRole !== 'takmir') {
      setError('Anda tidak memiliki izin untuk melakukan aksi ini.');
      return;
    }

    const { nama_kegiatan, deskripsi, tanggal, waktu, lokasi } = formData;
    if (!nama_kegiatan || !deskripsi || !tanggal || !waktu || !lokasi) {
      setError('Mohon lengkapi semua field yang wajib diisi.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const payload = new FormData();
      payload.append('nama_kegiatan', nama_kegiatan);
      payload.append('deskripsi', deskripsi);
      payload.append('tanggal', tanggal);
      payload.append('waktu', waktu);
      payload.append('lokasi', lokasi);
      if (gambar) {
        payload.append('gambar', gambar);
      }

      if (editMode && selectedKegiatan) {
        await api.post(`/kegiatan/${selectedKegiatan.id}?_method=PUT`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/kegiatan', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setShowModal(false);
      setEditMode(false);
      setFormData({ nama_kegiatan: '', deskripsi: '', tanggal: '', waktu: '', lokasi: '' });
      setGambar(null);
      setSelectedKegiatan(null);
      fetchKegiatan();
    } catch (err: any) {
      console.error('Error during save/update:', err);
      setError(err?.response?.data?.message || (editMode ? 'Gagal mengedit kegiatan. Coba periksa input Anda.' : 'Gagal menambah kegiatan. Silakan coba lagi.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowDetail = (kegiatan: Kegiatan) => {
    setSelectedKegiatan(kegiatan);
  };

  const handleDeleteKegiatan = async (id: number) => {
    if (userRole !== 'admin' && userRole !== 'takmir') {
      setError('Anda tidak memiliki izin untuk menghapus kegiatan ini.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await api.delete(`/kegiatan/${id}`);
      setSelectedKegiatan(null);
      setShowDeleteDialog(false);
      fetchKegiatan();
    } catch (err: any) {
      console.error('Gagal menghapus kegiatan:', err);
      setError(err?.response?.data?.message || 'Gagal menghapus kegiatan. Terjadi kesalahan server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (!selectedKegiatan) return;
    setFormData({
      nama_kegiatan: selectedKegiatan.nama_kegiatan,
      deskripsi: selectedKegiatan.deskripsi,
      tanggal: selectedKegiatan.tanggal,
      waktu: selectedKegiatan.waktu,
      lokasi: selectedKegiatan.lokasi,
    });
    setEditMode(true);
    setShowModal(true);
    setSelectedKegiatan(null);
  };

  return (
    <div className="min-h-screen bg-[#1A1614] text-white flex flex-col">
      <Navbar role={userRole} user={user} />

      {/* Hero Section (Banner) */}
      <motion.section
        className="relative h-96 md:h-[500px] w-full flex items-center justify-center overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <img
          src="/images/masjid7.jpg"
          alt="Masjid"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 animate-zoom-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1614] via-[#1A1614]/60 to-transparent"></div>
        <div className="relative z-10 text-center p-4 max-w-4xl mx-auto">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight text-white drop-shadow-2xl"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Jadwal Kegiatan Masjid
          </motion.h1>
          <motion.p
            className="mt-4 text-lg sm:text-xl md:text-2xl font-light text-gray-200"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Ikuti berbagai program dan acara Islami di masjid kami.
          </motion.p>
        </div>
      </motion.section>

      {/* Main Content - Description and Kegiatan List */}
      <main className="container mx-auto px-4 md:px-8 py-16 flex flex-col lg:flex-row gap-12 lg:gap-16 items-stretch flex-grow relative">
        {/* Description Section */}
        <motion.section
          className="w-full lg:w-2/5 text-center lg:text-left flex flex-col justify-between"
          initial="hidden"
          animate="visible"
          variants={slideInFromLeft}
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-yellow-400">
              Semarakkan Syiar Islam
            </h2>
            <p className="text-base sm:text-lg leading-relaxed mb-6 text-gray-300">
              Halaman ini adalah pusat informasi untuk semua kegiatan masjid, mulai dari kajian rutin, pengajian akbar, hingga acara sosial dan peringatan hari besar Islam. Pastikan Anda tidak melewatkan kesempatan untuk memperdalam ilmu agama dan mempererat tali silaturahmi.
            </p>
            <motion.ul
              className="list-disc list-inside text-base sm:text-lg space-y-3 mb-8 text-gray-300"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              <motion.li variants={itemVariants}><strong className="text-yellow-300">Kajian Rutin:</strong> Jadwal tetap untuk memperdalam pemahaman agama.</motion.li>
              <motion.li variants={itemVariants}><strong className="text-yellow-300">Acara Spesial:</strong> Peringatan hari besar dan program tematik.</motion.li>
              <motion.li variants={itemVariants}><strong className="text-yellow-300">Kegiatan Sosial:</strong> Bakti sosial, santunan, dan program kemasyarakatan.</motion.li>
              <motion.li variants={itemVariants}><strong className="text-yellow-300">Informasi Detail:</strong> Waktu, lokasi, dan deskripsi lengkap setiap kegiatan.</motion.li>
            </motion.ul>
            <p className="text-lg sm:text-xl leading-relaxed font-semibold text-yellow-300">
              Bergabunglah dengan kami dalam setiap langkah menuju kebaikan.
            </p>
          </div>
          {/* "Kembali ke Beranda" Button moved inside this section */}
          <motion.div
            className="text-center py-12 bg-[#1A1614] lg:pt-0 lg:pb-0 lg:mt-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-yellow-400 text-black font-bold py-3 px-8 rounded-full hover:bg-yellow-500 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg animate-bounce-subtle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
              </svg>
              Kembali ke Beranda
            </Button>
          </motion.div>
        </motion.section>

        {/* Kegiatan List Section */}
        <motion.section
          className="w-full lg:w-3/5 bg-black rounded-2xl shadow-2xl overflow-hidden border border-gray-800"
          initial="hidden"
          animate="visible"
          variants={slideInFromRight}
        >
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-5 px-6 flex justify-between items-center relative">
            <h3 className="font-extrabold text-xl sm:text-2xl">Daftar Kegiatan Terbaru</h3>
            {(userRole === 'admin' || userRole === 'takmir') && (
              <Button
                onClick={() => {
                  setShowModal(true);
                  setEditMode(false);
                  setFormData({ nama_kegiatan: '', deskripsi: '', tanggal: '', waktu: '', lokasi: '' });
                  setGambar(null);
                  setError(null);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-transform transform hover:scale-105 shadow-md"
              >
                Tambah Kegiatan
              </Button>
            )}
          </div>

          <div className="p-6 sm:p-8">
            <AnimatePresence>
              {error && (
                <motion.div
                  className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-400 text-center text-sm font-medium"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {isLoading ? (
              <div className="text-center py-12">
                <motion.div
                  className="inline-block rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                ></motion.div>
                <p className="mt-6 text-gray-400 text-xl">Memuat daftar kegiatan...</p>
              </div>
            ) : kegiatanList.length === 0 ? (
              <motion.div
                className="text-center py-12"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <p className="text-gray-400 text-xl">Belum ada kegiatan yang tersedia saat ini.</p>
                {(userRole === 'admin' || userRole === 'takmir') && (
                  <p className="mt-4 text-gray-500 text-md">Gunakan tombol "Tambah Kegiatan" untuk mulai menambahkan.</p>
                )}
              </motion.div>
            ) : (
              <motion.div
                className="grid gap-8"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                {kegiatanList.map((item, index) => (
                  <motion.div
                    key={item.id}
                    onClick={() => handleShowDetail(item)}
                    className="flex flex-col sm:flex-row items-start gap-6 p-6 border border-gray-700 rounded-xl shadow-lg bg-[#1A1614] text-white cursor-pointer hover:bg-[#2a2421] transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl"
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.gambar && (
                      <div className="flex-shrink-0 w-full sm:w-48 h-40 sm:h-36 overflow-hidden rounded-lg">
                        <img
                          src={`http://localhost:8000/storage/${item.gambar}`}
                          alt={item.nama_kegiatan}
                          className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500 ease-in-out"
                        />
                      </div>
                    )}
                    <div className="flex-1 w-full">
                      <h3 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-2 leading-tight">{item.nama_kegiatan}</h3>
                      <p className="text-gray-300 mb-4 line-clamp-3 leading-relaxed">{item.deskripsi}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span className="font-semibold text-yellow-400">Tanggal:</span> {item.tanggal}
                        </div>
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className="font-semibold text-yellow-400">Waktu:</span> {item.waktu}
                        </div>
                        <div className="flex items-center gap-2 col-span-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="font-semibold text-yellow-400">Lokasi:</span> {item.lokasi}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.section>
      </main>

      {/* Modal Tambah / Edit */}
      <AnimatePresence>
        {showModal && (userRole === 'admin' || userRole === 'takmir') && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="border border-gray-700 bg-[#1A1614] p-8 rounded-xl shadow-2xl w-full max-w-lg text-white"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className="text-3xl font-bold mb-8 text-center text-yellow-400">
                {editMode ? 'Edit Kegiatan' : 'Buat Kegiatan Baru'}
              </h2>
              {error && (
                <div className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-400 text-center text-sm font-medium">
                  {error}
                </div>
              )}
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleCreateOrUpdateKegiatan(); }}>
                <div>
                  <label htmlFor="nama_kegiatan" className="block mb-2 font-semibold text-gray-300 text-lg">Nama Kegiatan</label>
                  <input
                    type="text"
                    id="nama_kegiatan"
                    placeholder="Contoh: Kajian Fiqih Subuh"
                    value={formData.nama_kegiatan}
                    onChange={(e) => setFormData({ ...formData, nama_kegiatan: e.target.value })}
                    className="w-full p-4 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 text-lg outline-none transition duration-200"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="deskripsi" className="block mb-2 font-semibold text-gray-300 text-lg">Deskripsi</label>
                  <textarea
                    id="deskripsi"
                    placeholder="Berikan deskripsi lengkap tentang kegiatan ini..."
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    className="w-full p-4 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 h-36 text-lg outline-none transition duration-200 resize-y"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="tanggal" className="block mb-2 font-semibold text-gray-300 text-lg">Tanggal</label>
                    <input
                      type="date"
                      id="tanggal"
                      value={formData.tanggal}
                      onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                      className="w-full p-4 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-yellow-500 focus:border-yellow-500 text-lg outline-none transition duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="waktu" className="block mb-2 font-semibold text-gray-300 text-lg">Waktu</label>
                    <input
                      type="time"
                      id="waktu"
                      value={formData.waktu}
                      onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                      className="w-full p-4 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-yellow-500 focus:border-yellow-500 text-lg outline-none transition duration-200"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lokasi" className="block mb-2 font-semibold text-gray-300 text-lg">Lokasi</label>
                  <input
                    type="text"
                    id="lokasi"
                    placeholder="Contoh: Ruang Utama Masjid Al-Hikmah"
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    className="w-full p-4 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 text-lg outline-none transition duration-200"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="gambar" className="block mb-2 font-semibold text-gray-300 text-lg">Gambar (Opsional)</label>
                  <input
                    type="file"
                    id="gambar"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setGambar(e.target.files[0]);
                      }
                    }}
                    className="w-full p-4 border border-gray-600 rounded-lg bg-gray-800 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-black hover:file:bg-yellow-600 focus:ring-yellow-500 focus:border-yellow-500 cursor-pointer outline-none transition duration-200"
                  />
                  {editMode && selectedKegiatan?.gambar && !gambar && (
                    <p className="mt-2 text-sm text-gray-400">Gambar saat ini: <span className="italic">{selectedKegiatan.gambar.split('/').pop()}</span></p>
                  )}
                  {gambar && (
                    <p className="mt-2 text-sm text-gray-400">Gambar baru dipilih: <span className="italic">{gambar.name}</span></p>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditMode(false);
                      setFormData({ nama_kegiatan: '', deskripsi: '', tanggal: '', waktu: '', lokasi: '' });
                      setGambar(null);
                      setError(null);
                    }}
                    className="px-7 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-lg font-semibold transition-colors duration-200"
                    disabled={isLoading}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="px-7 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-md text-lg font-semibold disabled:opacity-50 transition-colors duration-200 flex items-center justify-center gap-2"
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
                      editMode ? 'Simpan Perubahan' : 'Buat Kegiatan'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Detail */}
      <AnimatePresence>
        {selectedKegiatan && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="border border-gray-700 bg-[#1A1614] p-8 rounded-xl shadow-2xl w-full max-w-lg text-white"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">{selectedKegiatan.nama_kegiatan}</h2>
              {selectedKegiatan.gambar && (
                <motion.div
                  className="mb-6 rounded-lg overflow-hidden border border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <img
                    src={`http://localhost:8000/storage/${selectedKegiatan.gambar}`}
                    alt={selectedKegiatan.nama_kegiatan}
                    className="w-full h-64 object-cover object-center"
                  />
                </motion.div>
              )}
              <motion.div
                className="space-y-4 text-lg"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                    },
                  },
                }}
              >
                <motion.div variants={itemVariants}>
                  <span className="text-yellow-400 font-bold">Deskripsi:</span>
                  <p className="text-gray-300 mt-2 leading-relaxed">{selectedKegiatan.deskripsi}</p>
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                  <motion.div variants={itemVariants}>
                    <span className="text-yellow-400 font-bold">Tanggal:</span>
                    <p className="text-gray-300 mt-1">{selectedKegiatan.tanggal}</p>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <span className="text-yellow-400 font-bold">Waktu:</span>
                    <p className="text-gray-300 mt-1">{selectedKegiatan.waktu}</p>
                  </motion.div>
                  <motion.div variants={itemVariants} className="col-span-full">
                    <span className="text-yellow-400 font-bold">Lokasi:</span>
                    <p className="text-gray-300 mt-1">{selectedKegiatan.lokasi}</p>
                  </motion.div>
                </div>
              </motion.div>
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10">
                <Button
                  onClick={() => setSelectedKegiatan(null)}
                  className="px-7 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-lg font-semibold transition-colors duration-200 w-full sm:w-auto"
                >
                  Tutup
                </Button>
                {(userRole === 'admin' || userRole === 'takmir') && (
                  <div className="flex gap-4 w-full sm:w-auto">
                    <Button
                      onClick={handleEdit}
                      className="px-7 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-md text-lg font-semibold transition-colors duration-200 w-full"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => {
                        setShowDeleteDialog(true);
                      }}
                      className="px-7 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md text-lg font-semibold transition-colors duration-200 w-full"
                    >
                      Hapus
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className="bg-[#1A1614] border-gray-700 text-white shadow-xl p-8 rounded-xl max-w-md">
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <DialogHeader className="text-center">
                  <DialogTitle className="text-3xl font-bold text-yellow-400 mb-2">Konfirmasi Hapus Kegiatan</DialogTitle>
                  <DialogDescription className="text-gray-300 text-lg">
                    Apakah Anda yakin ingin menghapus kegiatan <strong className="text-yellow-300">"{selectedKegiatan?.nama_kegiatan}"</strong>? Tindakan ini tidak dapat dibatalkan.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                  <Button
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setSelectedKegiatan(null);
                    }}
                    className="px-7 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-lg font-semibold transition-colors duration-200 w-full sm:w-auto"
                    disabled={isLoading}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={() => selectedKegiatan && handleDeleteKegiatan(selectedKegiatan.id)}
                    className="px-7 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md text-lg font-semibold disabled:opacity-50 transition-colors duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <motion.svg
                          className="h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </motion.svg>
                        <span>Menghapus...</span>
                      </>
                    ) : (
                      'Hapus'
                    )}
                  </Button>
                </DialogFooter>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KegiatanPage;