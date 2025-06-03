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
import { motion } from 'framer-motion'; // Import motion from framer-motion

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
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null); // Mengubah nama state agar lebih jelas
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');

    // Redirect if no token or not admin
    if (!token || role !== 'admin') {
      router.push('/login');
      return;
    }

    setAuthToken(token);
    setUserRole(role);
    fetchUserData();
    fetchUsers();
  }, [router]);

  // Handle body overflow when modals are open
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
      setLoggedInUser(response.data); // Set data user yang sedang login
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
      setUsers(users.filter((userItem) => userItem.id !== id)); // Mengubah nama variabel user menjadi userItem untuk menghindari konflik
      setShowDeleteDialog(false);
      setUserToDelete(null);

      // Logika tambahan: Jika user yang dihapus adalah user yang sedang login, maka logout
      if (loggedInUser && id === loggedInUser.id) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('role');
        router.push('/login'); // Redirect ke halaman login setelah menghapus diri sendiri
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
        role: 'takmir', // Default role for new users
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

  // Framer Motion variants for staggered list animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[#1A1614] text-white">
      <Navbar role={userRole} user={loggedInUser} /> {/* Menggunakan loggedInUser */}

      {/* Hero Section */}
      <div className="relative h-96 w-full flex items-center justify-center overflow-hidden">
        <motion.img
          src="/images/masjid7.jpg"
          alt="Masjid"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 0.8 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1614] via-[#1A1614]/50 to-transparent"></div>
        <motion.div
          className="relative z-10 text-center p-4"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-white drop-shadow-lg">
            Manajemen User
          </h1>
          <p className="mt-4 text-xl md:text-2xl font-light text-gray-200">
            Kelola akses pengguna sistem masjid Anda.
          </p>
        </motion.div>
      </div>

      {/* Main Content - Description and User List */}
      <div className="container mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Description Section */}
        <motion.div
          className="text-center md:text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <h2 className="text-4xl font-bold mb-6 text-yellow-400">
            Pengelolaan Akun Pengguna
          </h2>
          <p className="text-lg leading-relaxed mb-6 text-gray-300">
            Halaman ini memungkinkan Anda untuk mengelola akun-akun pengguna yang terdaftar pada sistem informasi masjid. Anda dapat menambahkan user baru, melihat daftar user yang ada, dan menghapus user jika diperlukan.
          </p>
          <ul className="list-disc list-inside text-lg space-y-3 mb-8 text-gray-300">
            <li>**Tambah User:** Buat akun baru untuk anggota takmir atau pengurus.</li>
            <li>**Lihat Daftar:** Pantau semua user yang terdaftar beserta perannya.</li>
            <li>**Hapus User:** Hapus akun yang tidak lagi diperlukan.</li>
          </ul>
          <p className="text-xl leading-relaxed font-semibold text-yellow-300">
            Pastikan hanya user yang berwenang yang memiliki akses ke sistem ini.
          </p>
          {/* "Kembali ke Dashboard" Button */}
          <motion.button
            onClick={() => router.push('/dashboard')}
            className="mt-8 bg-yellow-400 text-black font-semibold py-3 px-6 rounded-full hover:bg-yellow-500 transition-colors duration-200 shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Kembali ke Dashboard
          </motion.button>
        </motion.div>

        {/* User List Section (resembling donation form card) */}
        <motion.div
          className="bg-black rounded-2xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          <div className="bg-yellow-400 text-black py-4 px-6 text-center font-bold text-lg relative">
            Daftar Akun User
            <motion.button
              onClick={() => {
                setShowModal(true);
                setError(null); // Clear previous errors
                setNama(''); setEmail(''); setPassword(''); // Reset form fields
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Tambah User
            </motion.button>
          </div>

          <div className="p-8">
            {error && (
              <motion.div
                className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-400 text-center text-sm"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

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
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {users.map((userItem) => ( // Mengubah nama variabel user menjadi userItem untuk menghindari konflik
                      <motion.tr
                        key={userItem.id}
                        className="hover:bg-[#2a2421] transition-colors duration-150"
                        variants={itemVariants}
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

      {/* Modal Tambah User */}
      {showModal && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="border border-gray-700 bg-[#1A1614] p-8 rounded-lg shadow-2xl w-full max-w-md text-white transform scale-100 transition-transform duration-300"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">Tambah User Baru</h2>
            {error && (
              <div className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-400 text-center text-sm">
                {error}
              </div>
            )}
            <div className="space-y-5">
              <div>
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
              </div>
              <div>
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
              </div>
              <div>
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
              </div>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1A1614] border-gray-700 text-white shadow-xl p-8 rounded-lg max-w-md">
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPage;