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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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

  const fetchUserData = async () => {
    try {
      const response = await api.get('/user');
      setUser(response.data);
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
      setUsers(users.filter((user) => user.id !== id));
      setShowDeleteDialog(false);
      setUserToDelete(null);
    } catch (err) {
      setError('Gagal menghapus user');
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
    } catch (err) {
      setError('Gagal menambah user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1614] pt-15">
      <Navbar role={userRole} user={user}/>
      
      {/* Banner */}
      <div className="relative h-64 w-full">
        <img
          src="/images/masjid7.jpg"
          alt="Banner User Management"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-3xl md:text-4xl font-bold">Kelola User</h1>
        </div>
      </div>

      {/* Deskripsi */}
      <div className="max-w-3xl mx-auto px-6 py-10 text-center">
        <h2 className="text-2xl font-semibold text-white mb-4">Manajemen Pengguna Masjid</h2>
        <p className="text-white text-md leading-relaxed">
          Kelola pengguna yang memiliki akses ke sistem manajemen masjid.
        </p>
      </div>

      {/* Container */}
      <div className="max-w-4xl mx-auto px-4 pb-10">
        <div className="bg-black rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-yellow-400 text-black py-4 px-6 text-center font-bold text-lg relative">
            Daftar User
            <button
              onClick={() => setShowModal(true)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm"
            >
              Tambah User
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded text-red-500 text-center">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-yellow-400 border-t-transparent"></div>
                <p className="mt-2 text-gray-400">Memuat data...</p>
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Tidak ada user.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#2a2421] text-yellow-400">
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Nama</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-left">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-[#2a2421] transition">
                        <td className="px-4 py-3 text-gray-300">{user.id}</td>
                        <td className="px-4 py-3">
                          <span className="text-yellow-400 font-medium">{user.nama}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-full text-sm bg-yellow-400/20 text-yellow-400 capitalize">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => confirmDelete(user)}
                            className="text-red-400 hover:text-red-300"
                            disabled={isLoading}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

      {/* Modal Tambah User */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="border border-gray-700 bg-[#1A1614] p-6 rounded-lg shadow-2xl w-full max-w-md text-white">
            <h2 className="text-2xl font-bold mb-6 text-center text-yellow-400">Tambah User</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-300">Nama</label>
                <input
                  type="text"
                  placeholder="Nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-300">Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
                disabled={isLoading}
              >
                Batal
              </button>
              <button
                onClick={handleCreate}
                className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1A1614] border-white/10 text-white shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-yellow-400">Konfirmasi Hapus User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Apakah Anda yakin ingin menghapus user {userToDelete?.nama}? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteDialog(false);
                setUserToDelete(null);
              }}
              className="text-gray-300 hover:text-white hover:bg-white/10"
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => userToDelete && handleDelete(userToDelete.id)}
              className="bg-red-500 hover:bg-red-600"
              disabled={isLoading}
            >
              {isLoading ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPage;
