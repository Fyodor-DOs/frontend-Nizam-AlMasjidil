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

type Kegiatan = {
  id: number;
  nama_kegiatan: string;
  deskripsi: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  gambar?: string;
};

const KegiatanPage = () => {
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
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
      setError('Gagal mengambil data kegiatan');
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
      setError('Semua field harus diisi!');
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
    } catch (err) {
      console.error('Error:', err);
      setError(editMode ? 'Gagal mengedit kegiatan' : 'Gagal menambah kegiatan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowDetail = (kegiatan: Kegiatan) => {
    setSelectedKegiatan(kegiatan);
  };

  const handleDeleteKegiatan = async (id: number) => {
    if (userRole !== 'admin' && userRole !== 'takmir') {
      setError('Anda tidak memiliki izin untuk menghapus kegiatan.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await api.delete(`/kegiatan/${id}`);
      setSelectedKegiatan(null);
      setShowDeleteDialog(false);
      fetchKegiatan();
    } catch (err) {
      console.error('Gagal menghapus kegiatan:', err);
      setError('Gagal menghapus kegiatan');
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
    <div className="min-h-screen bg-[#1A1614] pt-15">
      <Navbar role={userRole} user={user}/>
      
      {/* Banner */}
      <div className="relative h-64 w-full">
        <img
          src="/images/masjid7.jpg"
          alt="Banner Kegiatan"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-3xl md:text-4xl font-bold">Kegiatan Masjid</h1>
        </div>
      </div>

      {/* Deskripsi */}
      <div className="max-w-3xl mx-auto px-6 py-10 text-center">
        <h2 className="text-2xl font-semibold text-white mb-4">Jadwal Kegiatan Masjid</h2>
        <p className="text-white text-md leading-relaxed">
          Informasi lengkap tentang kegiatan-kegiatan yang akan diselenggarakan di masjid.
        </p>
      </div>

      {/* Container */}
      <div className="max-w-4xl mx-auto px-4 pb-10">
        <div className="bg-black rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-yellow-400 text-black py-4 px-6 text-center font-bold text-lg relative">
            Daftar Kegiatan
            {(userRole === 'admin' || userRole === 'takmir') && (
              <button
                onClick={() => {
                  setShowModal(true);
                  setEditMode(false);
                  setFormData({ nama_kegiatan: '', deskripsi: '', tanggal: '', waktu: '', lokasi: '' });
                  setGambar(null);
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
            ) : kegiatanList.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Belum ada kegiatan yang tersedia.</p>
            ) : (
              <div className="grid gap-4">
                {kegiatanList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleShowDetail(item)}
                    className="flex items-start gap-4 p-4 border border-gray-700 rounded-lg shadow-sm bg-[#1A1614] text-white cursor-pointer hover:bg-[#2a2421] transition"
                  >
                    {item.gambar && (
                      <img
                        src={`http://localhost:8000/storage/${item.gambar}`}
                        alt={item.nama_kegiatan}
                        className="w-40 h-32 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-yellow-400 mb-2">{item.nama_kegiatan}</h2>
                      <p className="text-gray-300 mb-3 line-clamp-2">{item.deskripsi}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">Tanggal:</span> {item.tanggal}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">Waktu:</span> {item.waktu}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">Lokasi:</span> {item.lokasi}
                        </div>
                      </div>
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

      {/* Modal Tambah / Edit */}
      {showModal && (userRole === 'admin' || userRole === 'takmir') && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="border border-gray-700 bg-[#1A1614] p-6 rounded-lg shadow-2xl w-full max-w-md text-white">
            <h2 className="text-2xl font-bold mb-6 text-center text-yellow-400">
              {editMode ? 'Edit Kegiatan' : 'Buat Kegiatan'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-300">Nama Kegiatan</label>
                <input
                  type="text"
                  placeholder="Nama Kegiatan"
                  value={formData.nama_kegiatan}
                  onChange={(e) => setFormData({ ...formData, nama_kegiatan: e.target.value })}
                  className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-300">Deskripsi</label>
                <textarea
                  placeholder="Deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-300">Tanggal</label>
                <input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-300">Waktu</label>
                <input
                  type="time"
                  value={formData.waktu}
                  onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                  className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-300">Lokasi</label>
                <input
                  type="text"
                  placeholder="Lokasi"
                  value={formData.lokasi}
                  onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                  className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-300">Gambar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setGambar(e.target.files[0]);
                    }
                  }}
                  className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowModal(false);
                  setEditMode(false);
                }}
                className="text-gray-300 hover:text-white hover:bg-white/10"
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button
                onClick={handleCreateOrUpdateKegiatan}
                className="bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {selectedKegiatan && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="border border-gray-700 bg-[#1A1614] p-6 rounded-lg shadow-2xl w-full max-w-md text-white">
            <h2 className="text-2xl font-bold mb-4 text-center text-yellow-400">{selectedKegiatan.nama_kegiatan}</h2>
            <div className="space-y-4">
              <div>
                <span className="text-yellow-400 font-medium">Deskripsi:</span>
                <p className="text-gray-300 mt-1">{selectedKegiatan.deskripsi}</p>
              </div>
              <div>
                <span className="text-yellow-400 font-medium">Tanggal:</span>
                <p className="text-gray-300 mt-1">{selectedKegiatan.tanggal}</p>
              </div>
              <div>
                <span className="text-yellow-400 font-medium">Waktu:</span>
                <p className="text-gray-300 mt-1">{selectedKegiatan.waktu}</p>
              </div>
              <div>
                <span className="text-yellow-400 font-medium">Lokasi:</span>
                <p className="text-gray-300 mt-1">{selectedKegiatan.lokasi}</p>
              </div>
              {selectedKegiatan.gambar && (
                <div>
                  <img
                    src={`http://localhost:8000/storage/${selectedKegiatan.gambar}`}
                    alt={selectedKegiatan.nama_kegiatan}
                    className="w-full h-48 object-cover rounded mt-3"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-between mt-8">
              <Button
                variant="ghost"
                onClick={() => setSelectedKegiatan(null)}
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                Tutup
              </Button>
              {(userRole === 'admin' || userRole === 'takmir') && (
                <div className="flex space-x-3">
                  <Button
                    onClick={handleEdit}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowDeleteDialog(true);
                    }}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Hapus
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1A1614] border-white/10 text-white shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-yellow-400">Konfirmasi Hapus Kegiatan</DialogTitle>
            <DialogDescription className="text-gray-400">
              Apakah Anda yakin ingin menghapus kegiatan {selectedKegiatan?.nama_kegiatan}? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteDialog(false);
              }}
              className="text-gray-300 hover:text-white hover:bg-white/10"
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedKegiatan && handleDeleteKegiatan(selectedKegiatan.id)}
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

export default KegiatanPage;
