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
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence
import { UserPlus } from 'lucide-react'; // Import ikon UserPlus

interface User {
  id: number;
  nama: string;
  email: string;
  role: string;
}

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // --- Framer Motion Variants (Disamakan dengan halaman donasi) ---
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

  const cardVariants = { // Menggunakan nama 'cardVariants' agar lebih jelas, untuk list user
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

  // --- End Framer Motion Variants ---

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      router.push('/login');
      return;
    }

    setAuthToken(token);
    setUserRole(role);
    fetchUserData();
    fetchUsers();
  }, [router]);

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

  const fetchUserData = async () => {
    try {
      const response = await api.get('/user');
      setLoggedInUser(response.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError('Gagal mengambil data user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.delete(`/users/${id}`);
      setUsers(users.filter((userItem) => userItem.id !== id));
      setShowDeleteDialog(false);
      setUserToDelete(null);

      if (loggedInUser && id === loggedInUser.id) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('role');
        router.push('/login');
      }

    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menghapus user');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handleCreate = async () => {
    if (!nama || !email || !password) {
      setError('Semua field harus diisi!');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post('/users', {
        nama,
        email,
        password,
        role: 'takmir',
      });
      setUsers([...users, response.data]);
      setShowModal(false);
      setNama('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menambah user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1614] text-white">
      <Navbar role={userRole} user={loggedInUser} />

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
          variants={containerVariants} // Menggunakan containerVariants
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold leading-tight text-white drop-shadow-lg"
            variants={itemVariants} // Menggunakan itemVariants
          >
            Manajemen User
          </motion.h1>
          <motion.p
            className="mt-4 text-xl md:text-2xl font-light text-gray-200"
            variants={itemVariants} // Menggunakan itemVariants
          >
            Kelola akses pengguna sistem masjid Anda.
          </motion.p>
        </motion.div>
      </div>

      {/* Main Content - Description and User List */}
      <div className="container mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Description Section */}
        <motion.div
          className="text-center md:text-left"
          variants={sectionVariants} // Menggunakan sectionVariants
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }} // Animate when 30% of the element is in view
        >
          <motion.h2 className="text-4xl font-bold mb-6 text-yellow-400" variants={itemVariants}>
            Pengelolaan Akun Pengguna
          </motion.h2>
          <motion.p className="text-lg leading-relaxed mb-6 text-gray-300" variants={itemVariants}>
            Halaman ini memungkinkan Anda untuk mengelola akun-akun pengguna yang terdaftar pada sistem informasi masjid. Anda dapat menambahkan user baru, melihat daftar user yang ada, dan menghapus user jika diperlukan.
          </motion.p>
          <motion.ul className="list-disc list-inside text-lg space-y-3 mb-8 text-gray-300" variants={containerVariants}>
            <motion.li variants={itemVariants}>**Tambah User:** Buat akun baru untuk anggota takmir atau pengurus.</motion.li>
            <motion.li variants={itemVariants}>**Lihat Daftar:** Pantau semua user yang terdaftar beserta perannya.</motion.li>
            <motion.li variants={itemVariants}>**Hapus User:** Hapus akun yang tidak lagi diperlukan.</motion.li>
          </motion.ul>
          <motion.p className="text-xl leading-relaxed font-semibold text-yellow-300 mb-6" variants={itemVariants}>
            Pastikan hanya user yang berwenang yang memiliki akses ke sistem ini.
          </motion.p>
          {/* "Kembali ke Dashboard" Button */}
          <motion.button
            onClick={() => router.push('/dashboard')}
            className="mt-8 bg-yellow-400 text-black font-semibold py-3 px-6 rounded-full hover:bg-yellow-500 transition-colors duration-200 shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            variants={itemVariants} // Menggunakan itemVariants
          >
            Kembali ke Beranda
          </motion.button>
        </motion.div>

        {/* User List Section (resembling donation form card) */}
        <motion.div
          className="bg-black rounded-2xl shadow-2xl overflow-hidden"
          variants={cardVariants} // Menggunakan cardVariants
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="bg-yellow-400 text-black py-4 px-6 text-center font-bold text-lg relative">
            Daftar Akun User
          </div>

          <div className="p-8">
            <AnimatePresence> {/* Tambahkan AnimatePresence untuk animasi exit pesan */}
              {error && (
                <motion.div
                  className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-400 text-center text-sm"
                  variants={messageVariants} // Menggunakan messageVariants
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-yellow-400 border-t-transparent"></div>
                <p className="mt-4 text-gray-400 text-lg">Memuat data user...</p>
              </div>
            ) : users.length === 0 ? (
              <motion.p
                className="text-center text-gray-400 py-8 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Tidak ada user yang terdaftar.
              </motion.p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr className="bg-[#2a2421] text-yellow-400">
                      <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">Nama</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">Role</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    className="divide-y divide-gray-800"
                    variants={containerVariants} // Menggunakan containerVariants
                    initial="hidden"
                    animate="visible"
                  >
                    {users.map((userItem) => (
                      <motion.tr
                        key={userItem.id}
                        className="hover:bg-[#2a2421] transition-colors duration-150"
                        variants={itemVariants} // Menggunakan itemVariants
                      >
                        <td className="px-4 py-4 text-gray-300 text-sm">{userItem.id}</td>
                        <td className="px-4 py-4">
                          <span className="text-yellow-400 font-medium text-sm">{userItem.nama}</span>
                        </td>
                        <td className="px-4 py-4 text-gray-300 text-sm">{userItem.email}</td>
                        <td className="px-4 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400/20 text-yellow-400 capitalize">
                            {userItem.role}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <motion.button
                            onClick={() => confirmDelete(userItem)}
                            className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors duration-200"
                            disabled={isLoading}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            Hapus
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Floating Action Button for 'Tambah User' */}
      <motion.button
        onClick={() => {
          setShowModal(true);
          setError(null);
          setNama(''); setEmail(''); setPassword('');
        }}
        className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-transform transform hover:scale-105 duration-200 z-40 flex items-center justify-center"
        title="Tambah User Baru"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.8 }}
        whileHover={{ scale: 1.05, boxShadow: "0px 8px 20px rgba(52, 211, 103, 0.4)", transition: { type: "spring", stiffness: 400, damping: 10 } }}
        whileTap={{ scale: 0.95, transition: { type: "spring", stiffness: 400, damping: 10 } }}
      >
        <UserPlus size={28} />
        <span className="sr-only">Tambah User</span>
      </motion.button>

      {/* Modal Tambah User */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="border border-gray-700 bg-[#1A1614] p-8 rounded-lg shadow-2xl w-full max-w-md text-white"
              variants={modalDialogVariants} // Menggunakan modalDialogVariants
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">Tambah User Baru</h2>
              <AnimatePresence> {/* Tambahkan AnimatePresence untuk animasi exit pesan */}
                {error && (
                  <motion.div
                    className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-400 text-center text-sm"
                    variants={messageVariants} // Menggunakan messageVariants
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-5">
                <motion.div variants={itemVariants}> {/* Tambahkan motion.div dan variants */}
                  <label htmlFor="nama" className="block mb-2 font-semibold text-gray-300">Nama</label>
                  <input
                    id="nama"
                    type="text"
                    placeholder="Nama Lengkap"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full p-4 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 text-lg"
                    required
                  />
                </motion.div>
                <motion.div variants={itemVariants}> {/* Tambahkan motion.div dan variants */}
                  <label htmlFor="email" className="block mb-2 font-semibold text-gray-300">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 text-lg"
                    required
                  />
                </motion.div>
                <motion.div variants={itemVariants}> {/* Tambahkan motion.div dan variants */}
                  <label htmlFor="password" className="block mb-2 font-semibold text-gray-300">Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 text-lg"
                    required
                  />
                </motion.div>
              </div>
              <div className="flex justify-end space-x-4 mt-8">
                <motion.button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-lg font-semibold transition-colors duration-200"
                  disabled={isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Batal
                </motion.button>
                <motion.button
                  onClick={handleCreate}
                  className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-md text-lg font-semibold disabled:opacity-50 transition-colors duration-200 flex items-center justify-center gap-2"
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
                    'Buat User'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence> {/* Tambahkan AnimatePresence untuk animasi exit dialog */}
        {showDeleteDialog && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* DialogContent dari Shadcn/UI perlu dibungkus motion.div secara terpisah
                atau pastikan komponen DialogContent itu sendiri mendukung Framer Motion.
                Untuk menyamakan, saya membungkus kontennya dengan motion.div. */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogContent className="bg-[#1A1614] border-gray-700 text-white shadow-xl p-8 rounded-lg max-w-md">
                <motion.div
                  variants={modalDialogVariants} // Menggunakan modalDialogVariants
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  // Pastikan ini diletakkan di dalam DialogContent jika DialogContent tidak bisa langsung di-motion
                  // atau pastikan DialogContent mem-forward ref agar bisa di-motion
                  // Untuk kasus ini, karena DialogContent dari shadcn, membungkus isinya adalah cara paling aman
                >
                  <DialogHeader className="text-center">
                    <DialogTitle className="text-3xl font-bold text-yellow-400 mb-2">Konfirmasi Hapus User</DialogTitle>
                    <DialogDescription className="text-gray-300 text-lg">
                      Apakah Anda yakin ingin menghapus user **"{userToDelete?.nama}"**? Tindakan ini tidak dapat dibatalkan.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                    <motion.button
                      onClick={() => {
                        setShowDeleteDialog(false);
                        setUserToDelete(null);
                      }}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-lg font-semibold transition-colors duration-200 w-full sm:w-auto"
                      disabled={isLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Batal
                    </motion.button>
                    <motion.button
                      onClick={() => userToDelete && handleDelete(userToDelete.id)}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md text-lg font-semibold disabled:opacity-50 transition-colors duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
                      disabled={isLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Menghapus...</span>
                        </>
                      ) : (
                        'Hapus'
                      )}
                    </motion.button>
                  </DialogFooter>
                </motion.div>
              </DialogContent>
            </Dialog>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagementPage;