'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '@/utils/api';
import Navbar from '@/components/Navbar';

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

const TausiyahPage = () => {
  const [tausiyahList, setTausiyahList] = useState<Tausiyah[]>([]);
  const [formData, setFormData] = useState({ id: 0, judul: '', isi: '', waktu: '' });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    if (token) {
      setAuthToken(token);
      setUserRole(role);
      fetchUserData();
    }
    fetchTausiyah();
  }, [router]);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/user');
      setUser(response.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchTausiyah = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/tausiyah');
      console.log('Tausiyah response:', response.data);
      setTausiyahList(response.data);
    } catch (err: any) {
      console.error('Gagal mengambil data tausiyah:', err);
      setError(err.response?.data?.message || 'Gagal mengambil data tausiyah');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!formData.judul || !formData.isi) {
      setError('Judul dan isi harus diisi!');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const dataToSubmit = {
        judul: formData.judul,
        isi: formData.isi,
        waktu: editMode ? formData.waktu : getCurrentDateTime()
      };

      if (editMode && formData.id) {
        await api.put(`/tausiyah/${formData.id}`, dataToSubmit);
      } else {
        await api.post('/tausiyah', dataToSubmit);
      }
      setShowModal(false);
      setEditMode(false);
      setFormData({ id: 0, judul: '', isi: '', waktu: '' });
      await fetchTausiyah();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Gagal menyimpan data';
      setError(errorMessage);
      console.error('Error saving tausiyah:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus tausiyah ini?')) return;
    try {
      setIsLoading(true);
      setError(null);
      await api.delete(`/tausiyah/${id}`);
      await fetchTausiyah();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Gagal menghapus tausiyah';
      setError(errorMessage);
      console.error('Error deleting tausiyah:', err);
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
          alt="Banner Tausiyah"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-3xl md:text-4xl font-bold">Tausiyah</h1>
        </div>
      </div>

      {/* Deskripsi */}
      <div className="max-w-3xl mx-auto px-6 py-10 text-center">
        <h2 className="text-2xl font-semibold text-white mb-4">Kumpulan Tausiyah</h2>
        <p className="text-white text-md leading-relaxed">
          Kumpulan tausiyah dan nasihat untuk meningkatkan keimanan dan ketakwaan kita.
        </p>
      </div>

      {/* Container */}
      <div className="max-w-4xl mx-auto px-4 pb-10">
        <div className="bg-black rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-yellow-400 text-black py-4 px-6 text-center font-bold text-lg relative">
            Daftar Tausiyah
            {userRole === 'admin' && (
              <button
                onClick={() => {
                  setShowModal(true);
                  setEditMode(false);
                  setFormData({ id: 0, judul: '', isi: '', waktu: getCurrentDateTime() });
                  setError(null);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm"
              >
                Tambah
              </button>
            )}
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
            ) : tausiyahList.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Belum ada tausiyah yang tersedia.</p>
            ) : (
              <div className="space-y-4">
                {tausiyahList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/tausiyah/${item.id}`)}
                    className="flex items-start gap-2 p-4 border border-gray-700 rounded-lg shadow-sm bg-[#1A1614] text-white hover:bg-[#2a2421] transition cursor-pointer"
                  >
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-yellow-400">{item.judul}</h2>
                      <p className="mb-2 text-white">{item.isi.slice(0, 200)}...</p>
                      <p className="text-sm text-gray-300">
                        <strong>Waktu:</strong> {new Date(item.waktu).toLocaleString('id-ID')} <br />
                        <strong>Oleh:</strong> {item.user?.nama || item.user?.name || '-'}
                      </p>
                      {userRole === 'admin' && (
                        <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setFormData({
                                id: item.id,
                                judul: item.judul,
                                isi: item.isi,
                                waktu: item.waktu,
                              });
                              setEditMode(true);
                              setShowModal(true);
                              setError(null);
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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

      {/* Modal Buat/Edit */}
      {showModal && userRole === 'admin' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="border border-gray-700 bg-[#1A1614] p-6 rounded-lg shadow-2xl w-full max-w-md text-white">
            <h2 className="text-2xl font-bold mb-4 text-center">
              {editMode ? 'Edit Tausiyah' : 'Buat Tausiyah'}
            </h2>
            <input
              type="text"
              placeholder="Judul"
              value={formData.judul}
              onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded bg-white text-gray-800 mb-4"
            />
            <textarea
              placeholder="Isi Tausiyah"
              value={formData.isi}
              onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded bg-white text-gray-800 mb-4 h-32"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditMode(false);
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                disabled={isLoading}
              >
                Batal
              </button>
              <button
                onClick={handleCreateOrUpdate}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TausiyahPage;
