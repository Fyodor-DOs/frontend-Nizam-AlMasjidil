'use client';

import React, { useEffect, useState } from 'react';
import api, { setAuthToken } from '@/utils/api';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  nama: string;
  email: string;
  role: string;
}

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      const response = await api.get('/api/users'); 
      setUsers(response.data);
    } catch (err) {
      setError('Gagal mengambil data user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin mau hapus user ini?')) return;

    try {
      await api.delete(`/api/users/${id}`);
      setUsers(users.filter((user) => user.id !== id));
    } catch (err) {
      setError('Gagal menghapus user');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Kelola User</h1>

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
          {users.map((user) => (
            <tr key={user.id}>
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagementPage;
