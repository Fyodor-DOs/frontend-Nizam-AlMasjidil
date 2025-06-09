'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '@/utils/api';
import Navbar from '@/components/Navbar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; // Import Button dari shadcn/ui
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle } from 'lucide-react';

// Membuat komponen MotionButton yang merupakan Button dari shadcn/ui yang dianimasikan oleh Framer Motion
const MotionButton = motion(Button);

type Tausiyah = {
  id: number;
  judul: string;
  isi: string;
  waktu: string;
  user: {
    name?: string;
    nama?: string;
  };
};

interface User {
  id: number;
  nama: string;
  email: string;
  role: string;
}

// --- Framer Motion Variants (Disamakan dengan halaman Donasi & User Management) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger animation for children
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const cardVariants = { // Untuk card seperti daftar tausiyah
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } },
};

const messageVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
};

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const modalDialogVariants = {
  hidden: { opacity: 0, scale: 0.8, y: -50 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 25 } },
  exit: { opacity: 0, scale: 0.8, y: -50, transition: { duration: 0.3 } },
};

// Animasi untuk hover dan tap pada tombol (sudah ada, disesuaikan)
const buttonHoverTap = {
  whileHover: {
    scale: 1.05,
    boxShadow: "0px 8px 20px rgba(252, 211, 77, 0.4)", // Yellow shadow on hover
    transition: { type: "spring", stiffness: 400, damping: 10 }
  },
  whileTap: {
    scale: 0.95,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  },
};
// --- End Framer Motion Variants ---

const TausiyahPage = () => {
  const router = useRouter();
  const [tausiyahList, setTausiyahList] = useState<Tausiyah[]>([]);
  const [formData, setFormData] = useState({ id: 0, judul: '', isi: '' });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tausiyahToDelete, setTausiyahToDelete] = useState<Tausiyah | null>(null);

  const getCurrentDateTime = () => {
    return new Date().toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (showModal || showDeleteDialog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal, showDeleteDialog]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    if (token) {
      setAuthToken(token);
      setUserRole(role);
      fetchUser();
    }
    fetchTausiyah();
  }, [router]);

  const fetchUser = async () => {
    try {
      const res = await api.get('/user');
      setUser(res.data);
    } catch (e) {
      console.error('Error fetching user:', e);
    }
  };

  const fetchTausiyah = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get('/tausiyah');
      setTausiyahList(res.data);
    } catch (e: any) {
      console.error('Fetch Tausiyah Error:', e);
      setError(e.message || 'Gagal mengambil tausiyah. Silakan coba lagi nanti.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (userRole !== 'admin') {
      setError('Anda tidak memiliki izin melakukan aksi ini.');
      return;
    }

    if (!formData.judul || !formData.isi) {
      setError('Judul dan isi harus diisi.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const payload = {
        judul: formData.judul,
        isi: formData.isi,
      };

      if (editMode && formData.id) {
        await api.put(`/tausiyah/${formData.id}`, payload);
      } else {
        await api.post('/tausiyah', payload);
      }

      setShowModal(false);
      setEditMode(false);
      setFormData({ id: 0, judul: '', isi: '' });
      await fetchTausiyah();
    } catch (e: any) {
      console.error('Error during save/update:', e);
      setError(e.response?.data?.message || e.message || 'Terjadi kesalahan saat menyimpan tausiyah.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (tausiyah: Tausiyah) => {
    setTausiyahToDelete(tausiyah);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (userRole !== 'admin' || !tausiyahToDelete) {
      setError('Anda tidak memiliki izin menghapus atau data tidak ditemukan.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await api.delete(`/tausiyah/${tausiyahToDelete.id}`);
      setShowDeleteDialog(false);
      setTausiyahToDelete(null);
      await fetchTausiyah();
    } catch (e: any) {
      console.error('Gagal menghapus tausiyah:', e);
      setError(e.response?.data?.message || e.message || 'Gagal menghapus tausiyah. Terjadi kesalahan server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1614] text-white">
      <Navbar role={userRole} user={user} />

      {/* Hero Section */}
      <div className="relative h-96 w-full flex items-center justify-center overflow-hidden">
        <img
          src="/images/masjid7.jpg"
          alt="Masjid"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1614] via-[#1A1614]/50 to-transparent"></div>
        <motion.div
          className="relative z-10 text-center p-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold leading-tight text-white drop-shadow-lg"
            variants={itemVariants}
          >
            Kumpulan Tausiyah
          </motion.h1>
          <motion.p
            className="mt-4 text-xl md:text-2xl font-light text-gray-200"
            variants={itemVariants}
          >
            Nasihat dan pencerahan hati dari para ulama dan asatidz.
          </motion.p>
        </motion.div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-start flex-grow relative">
        {/* Description Section */}
        <motion.div
          className="text-center md:text-left"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2 className="text-4xl font-bold mb-6 text-yellow-400" variants={itemVariants}>
            Mutiara Hikmah Setiap Hari
          </motion.h2>
          <motion.p className="text-lg leading-relaxed mb-6 text-gray-300" variants={itemVariants}>
            Halaman ini didedikasikan untuk menyajikan kumpulan tausiyah, khutbah, dan nasihat Islami. Temukan pencerahan untuk jiwa, inspirasi untuk kehidupan, dan panduan untuk beribadah dalam setiap tulisan.
          </motion.p>
          <motion.ul
            className="list-disc list-inside text-lg space-y-3 mb-8 text-gray-300"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.li variants={itemVariants}>**Inspirasi Harian:** Bacaan ringan untuk memulai hari dengan keberkahan.</motion.li>
            <motion.li variants={itemVariants}>**Pencerahan Jiwa:** Topik mendalam untuk meningkatkan keimanan.</motion.li>
            <motion.li variants={itemVariants}>**Panduan Amaliah:** Nasihat praktis untuk ibadah sehari-hari.</motion.li>
            <motion.li variants={itemVariants}>**Dari Berbagai Ulama:** Koleksi dari sumber-sumber terpercaya.</motion.li>
          </motion.ul>
          <motion.p className="text-xl leading-relaxed font-semibold text-yellow-300 mb-8" variants={itemVariants}>
            Mari kita jadikan setiap bacaan sebagai langkah mendekatkan diri kepada-Nya.
          </motion.p>
          {/* "Kembali ke Beranda" Button */}
          <motion.div
            className="mt-8 flex justify-center md:justify-start"
            variants={itemVariants}
          >
            <motion.button
              onClick={() => router.push('/dashboard')}
              className="bg-yellow-400 text-black font-semibold py-3 px-6 rounded-full hover:bg-yellow-500 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              {...buttonHoverTap}
            >
              Kembali ke Beranda
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Tausiyah List Section (Card) */}
        <motion.div
          className="bg-black rounded-2xl shadow-2xl overflow-hidden border border-gray-800"
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="bg-yellow-400 text-black py-4 px-6 text-center font-bold text-lg relative">
            Daftar Tausiyah Terbaru
          </div>

          <div className="p-6 sm:p-8">
            <AnimatePresence>
              {error && (
                <motion.div
                  className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-400 text-center text-sm font-medium"
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
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
                <p className="mt-6 text-gray-400 text-xl">Memuat daftar tausiyah...</p>
              </div>
            ) : tausiyahList.length === 0 ? (
              <motion.div
                className="text-center py-12"
                initial="hidden"
                animate="visible"
                variants={itemVariants}
              >
                <p className="text-gray-400 text-xl">Belum ada tausiyah yang tersedia saat ini.</p>
              </motion.div>
            ) : (
              <motion.div
                className="grid gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {tausiyahList.map((item) => (
                  <motion.div
                    key={item.id}
                    onClick={() => router.push(`/tausiyah/${item.id}`)}
                    className="flex flex-col p-6 border border-gray-700 rounded-xl shadow-lg bg-[#1A1614] text-white cursor-pointer hover:bg-[#2a2421] transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl"
                    variants={itemVariants}
                    whileHover={buttonHoverTap.whileHover}
                    whileTap={buttonHoverTap.whileTap}
                  >
                    <h2 className="text-2xl font-bold text-yellow-400 mb-3 leading-tight">{item.judul}</h2>
                    <p className="text-gray-300 mb-4 line-clamp-3 leading-relaxed">{item.isi}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400 mt-auto">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold text-yellow-400">Waktu:</span> {new Date(item.waktu).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                      </div>
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold text-yellow-400">Oleh:</span> {item.user?.nama || item.user?.name || 'Anonim'}
                      </div>
                    </div>
                    {userRole === 'admin' && (
                      <div className="mt-5 flex gap-3" onClick={(e) => e.stopPropagation()}>
                        {/* Menggunakan MotionButton untuk edit */}
                        <MotionButton
                          onClick={() => {
                            setFormData({
                              id: item.id,
                              judul: item.judul,
                              isi: item.isi,
                            });
                            setEditMode(true);
                            setShowModal(true);
                            setError(null);
                          }}
                          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-md text-sm font-semibold transition-colors duration-200 flex-1"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Edit
                        </MotionButton>
                        {/* Menggunakan MotionButton untuk delete */}
                        <MotionButton
                          onClick={() => handleDeleteClick(item)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-semibold transition-colors duration-200 flex-1"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Hapus
                        </MotionButton>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Floating Action Button for 'Tambah Tausiyah' */}
      {userRole === 'admin' && (
        <motion.button
          onClick={() => {
            setShowModal(true);
            setEditMode(false);
            setFormData({ id: 0, judul: '', isi: '' });
            setError(null);
          }}
          className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-transform transform hover:scale-105 duration-200 z-40 flex items-center justify-center"
          title="Tambah Tausiyah Baru"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.8 }}
          {...buttonHoverTap}
        >
          <PlusCircle size={28} />
          <span className="sr-only">Tambah Tausiyah</span>
        </motion.button>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-[#1A1614] border-gray-700 text-white shadow-xl p-8 rounded-xl max-w-lg max-h-[90vh] overflow-y-auto">
          <motion.div
            variants={modalDialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <DialogHeader className="text-center">
              <DialogTitle className="text-3xl font-bold mb-2 text-yellow-400">
                {editMode ? 'Edit Tausiyah' : 'Tambah Tausiyah'}
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-lg">
                {editMode
                  ? 'Ubah informasi tausiyah sesuai kebutuhan.'
                  : 'Isi formulir berikut untuk menambahkan tausiyah baru.'}
              </DialogDescription>
            </DialogHeader>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6 mb-4 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-400 text-center text-sm font-medium"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="flex flex-col gap-6 mt-6"
            >
              <motion.div variants={itemVariants}>
                <label htmlFor="judul" className="block font-semibold mb-2 text-gray-300 text-lg">
                  Judul
                </label>
                <input
                  type="text"
                  id="judul"
                  name="judul"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  required
                  className="w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-lg transition duration-200"
                  placeholder="Judul tausiyah"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="isi" className="block font-semibold mb-2 text-gray-300 text-lg">
                  Isi
                </label>
                <textarea
                  id="isi"
                  name="isi"
                  rows={4}
                  value={formData.isi}
                  onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                  required
                  className="w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-y text-lg transition duration-200"
                  placeholder="Isi tausiyah"
                />
              </motion.div>

              <DialogFooter className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
                <MotionButton
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditMode(false);
                    setFormData({ id: 0, judul: '', isi: '' });
                    setError(null);
                  }}
                  variant="outline"
                  className="px-7 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-lg font-semibold transition-colors duration-200 w-full sm:w-auto"
                  disabled={isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Batal
                </MotionButton>
                <MotionButton
                  type="submit"
                  variant="default"
                  className="px-7 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-md text-lg font-semibold disabled:opacity-50 transition-colors duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
                  disabled={isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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
                    'Simpan'
                  )}
                </MotionButton>
              </DialogFooter>
            </form>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1A1614] border-gray-700 text-white shadow-xl p-8 rounded-xl max-w-md max-h-[90vh] overflow-y-auto">
          <motion.div
            variants={modalDialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <DialogHeader className="text-center">
              <DialogTitle className="text-3xl font-bold text-yellow-400 mb-2">Konfirmasi Hapus</DialogTitle>
              <DialogDescription className="text-gray-300 text-lg">
                Apakah Anda yakin ingin menghapus tausiyah{' '}
                <strong className="text-yellow-300">{tausiyahToDelete?.judul}</strong>? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <MotionButton
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="px-7 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-lg font-semibold transition-colors duration-200 w-full sm:w-auto"
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Batal
              </MotionButton>
              <MotionButton
                variant="destructive"
                onClick={handleDeleteConfirm}
                className="px-7 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md text-lg font-semibold disabled:opacity-50 transition-colors duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
              </MotionButton>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TausiyahPage;