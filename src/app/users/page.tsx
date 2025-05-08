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
    <div className="min-h-screen flex items-center justify-center bg-[#1A1614] text-gray-100">
      <div className="w-full max-w-5xl p-8 border border-gray-700 shadow-lg rounded-lg bg-[#2a2523]">
        <button
          onClick={handleBack}
          className="text-blue-400 hover:text-blue-500 mb-4"
        >
          ← Kembali ke Dashboard
        </button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Kelola User</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Tambah User
          </button>
        </div>

        {error && (
          <div className="text-red-400 text-center mb-4">{error}</div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-700 text-sm">
            <thead className="bg-gray-800 text-gray-200">
              <tr>
                <th className="border border-gray-700 p-2">ID</th>
                <th className="border border-gray-700 p-2">Nama</th>
                <th className="border border-gray-700 p-2">Email</th>
                <th className="border border-gray-700 p-2">Role</th>
                <th className="border border-gray-700 p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/40">
                    <td className="border border-gray-700 p-2 text-center">{user.id}</td>
                    <td className="border border-gray-700 p-2">{user.nama}</td>
                    <td className="border border-gray-700 p-2">{user.email}</td>
                    <td className="border border-gray-700 p-2 capitalize">{user.role}</td>
                    <td className="border border-gray-700 p-2 text-center">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="border border-gray-700 p-4 text-center text-gray-400">
                    Tidak ada user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#2a2523] p-6 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-center text-white">Tambah User</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full bg-[#1A1614] border border-gray-600 text-white p-2 rounded"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1A1614] border border-gray-600 text-white p-2 rounded"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1A1614] border border-gray-600 text-white p-2 rounded"
                />
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
                >
                  Batal
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
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
