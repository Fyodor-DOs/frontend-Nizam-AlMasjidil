'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '@/utils/api';

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
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      router.push('/login');
      return;
    }

    setAuthToken(token);
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError('Gagal mengambil data user');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin mau hapus user ini?')) return;

    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter((user) => user.id !== id));
    } catch (err) {
      setError('Gagal menghapus user');
    }
  };

  const handleCreate = async () => {
    if (!nama || !email || !password) {
      alert('Semua field harus diisi!');
      return;
    }

    try {
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
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black">
      <div className="w-full max-w-5xl p-8 border border-gray-300 shadow-lg rounded-lg">
        {/* Tombol Kembali */}
        <button
          onClick={handleBack}
          className="text-blue-500 hover:text-blue-700 mb-4"
        >
          Kembali ke Dashboard
        </button>

        {/* Header dan Tambah User */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Kelola User</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Tambah User
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-center mb-4">{error}</div>
        )}

        {/* Table User */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">ID</th>
                <th className="border p-2">Nama</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Role</th>
                <th className="border p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="border p-2 text-center">{user.id}</td>
                    <td className="border p-2">{user.nama}</td>
                    <td className="border p-2">{user.email}</td>
                    <td className="border p-2 capitalize">{user.role}</td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="border p-4 text-center text-gray-500">
                    Tidak ada user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Tambah User */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-center">Tambah User</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full border p-2 rounded"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border p-2 rounded"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  onClick={handleCreate}
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

export default UserManagementPage;
