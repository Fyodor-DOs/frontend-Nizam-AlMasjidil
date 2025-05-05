'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '@/utils/api';

type Kegiatan = {
  id: number;
  nama_kegiatan: string;
  deskripsi: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
};

const KegiatanPage = () => {
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nama_kegiatan: '',
    deskripsi: '',
    tanggal: '',
    waktu: '',
    lokasi: '',
  });

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    if (token) {
      setAuthToken(token);
      setUserRole(role);
      fetchKegiatan();
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchKegiatan = async () => {
    try {
      const response = await api.get('/kegiatan');
      setKegiatanList(response.data);
    } catch (err: any) {
      console.error('Fetch Kegiatan Error:', err);
      setError('Gagal mengambil data kegiatan');
    }
  };

  const handleCreateKegiatan = async () => {
    const { nama_kegiatan, deskripsi, tanggal, waktu, lokasi } = formData;
    if (!nama_kegiatan || !deskripsi || !tanggal || !waktu || !lokasi) {
      alert('Semua field harus diisi!');
      return;
    }

    try {
      await api.post('/kegiatan', formData);
      setShowModal(false);
      setFormData({
        nama_kegiatan: '',
        deskripsi: '',
        tanggal: '',
        waktu: '',
        lokasi: '',
      });
      fetchKegiatan();
    } catch (err) {
      console.error('Error menambah kegiatan:', err);
      alert('Gagal menambah kegiatan');
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1614] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-yellow-400 text-black py-4 px-6 text-center font-bold text-lg relative">
          Daftar Kegiatan
          {(userRole === 'admin' || userRole === 'takmir') && (
            <button
              onClick={() => setShowModal(true)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm"
            >
              Tambah
            </button>
          )}
        </div>

        <div className="p-6 bg-white">
          {error && (
            <p className="mb-4 p-3 text-sm text-red-600 bg-red-100 rounded">
              {error}
            </p>
          )}

          {kegiatanList.length === 0 ? (
            <p className="text-center text-gray-600">Belum ada kegiatan yang tersedia.</p>
          ) : (
            <div className="space-y-4">
              {kegiatanList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50"
                >
                  <h2 className="text-xl font-bold text-yellow-700">{item.nama_kegiatan}</h2>
                  <p className="text-gray-700 mb-2">{item.deskripsi}</p>
                  <p className="text-sm text-gray-600">
                    <strong>Tanggal:</strong> {item.tanggal} <br />
                    <strong>Waktu:</strong> {item.waktu} <br />
                    <strong>Lokasi:</strong> {item.lokasi}
                  </p>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-100 p-6 rounded-lg shadow-2xl w-full max-w-md text-black">
            <h2 className="text-2xl font-bold mb-4 text-center">Buat Kegiatan</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nama Kegiatan"
                value={formData.nama_kegiatan}
                onChange={(e) => setFormData({ ...formData, nama_kegiatan: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <textarea
                placeholder="Deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <input
                type="time"
                value={formData.waktu}
                onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <input
                type="text"
                placeholder="Lokasi"
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                onClick={handleCreateKegiatan}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KegiatanPage;
