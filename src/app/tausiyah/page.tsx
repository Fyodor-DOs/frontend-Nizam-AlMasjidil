'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '@/utils/api';
import Navbar from '@/components/Navbar';
import GuestNavbar from '@/components/GuestNavbar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

const TausiyahPage = () => {
  const router = useRouter();
  const [tausiyahList, setTausiyahList] = useState<Tausiyah[]>([]);
  const [formData, setFormData] = useState({ id: 0, judul: '', isi: '', waktu: '' });
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
      setError(e.message || 'Gagal mengambil tausiyah');
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
        waktu: formData.waktu || getCurrentDateTime(),
      };

      if (editMode && formData.id) {
        await api.put(`/tausiyah/${formData.id}`, payload);
      } else {
        await api.post('/tausiyah', payload);
      }

      setShowModal(false);
      setEditMode(false);
      setFormData({ id: 0, judul: '', isi: '', waktu: '' });
      await fetchTausiyah();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Terjadi kesalahan saat menyimpan');
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
      setError(e.response?.data?.message || e.message || 'Gagal menghapus tausiyah');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1614] text-white">
      {userRole ? (
        <Navbar role={userRole} user={user} />
      ) : (
        <GuestNavbar />
      )}

      {/* Hero Section */}
      <div className="relative h-96 w-full flex items-center justify-center overflow-hidden">
        <img
          src="/images/masjid7.jpg"
          alt="Masjid"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1614] via-[#1A1614]/50 to-transparent"></div>
        <div className="relative z-10 text-center p-4">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-white drop-shadow-lg">
            Kumpulan Tausiyah
          </h1>
          <p className="mt-4 text-xl md:text-2xl font-light text-gray-200">
            Nasihat dan pencerahan hati dari para ulama dan asatidz.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="text-center md:text-left">
          <h2 className="text-4xl font-bold mb-6 text-yellow-400">
            Mutiara Hikmah Setiap Hari
          </h2>
          <p className="text-lg leading-relaxed mb-6 text-gray-300">
            Halaman ini didedikasikan untuk menyajikan kumpulan tausiyah, khutbah, dan nasihat Islami. Temukan pencerahan untuk jiwa, inspirasi untuk kehidupan, dan panduan untuk beribadah dalam setiap tulisan.
          </p>
          <ul className="list-disc list-inside text-lg space-y-3 mb-8 text-gray-300">
            <li>Inspirasi Harian: Bacaan ringan untuk memulai hari dengan keberkahan.</li>
            <li>Pencerahan Jiwa: Topik mendalam untuk meningkatkan keimanan.</li>
            <li>Panduan Amaliah: Nasihat praktis untuk ibadah sehari-hari.</li>
            <li>Dari Berbagai Ulama: Koleksi dari sumber-sumber terpercaya.</li>
          </ul>
          <p className="text-xl leading-relaxed font-semibold text-yellow-300">
            Mari kita jadikan setiap bacaan sebagai langkah mendekatkan diri kepada-Nya.
          </p>
        </div>

        <div className="bg-black rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-yellow-400 text-black py-4 px-6 text-center font-bold text-lg relative">
            Daftar Tausiyah Terbaru
            {userRole === 'admin' && (
              <button
                onClick={() => {
                  setShowModal(true);
                  setEditMode(false);
                  setFormData({ id: 0, judul: '', isi: '', waktu: getCurrentDateTime() });
                  setError(null);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200"
              >
                Tambah Tausiyah
              </button>
            )}
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-400 text-center text-sm">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-yellow-400 border-t-transparent"></div>
                <p className="mt-4 text-gray-400 text-lg">Memuat daftar tausiyah...</p>
              </div>
            ) : tausiyahList.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-lg">Belum ada tausiyah yang tersedia saat ini.</p>
            ) : (
              <div className="grid gap-6">
                {tausiyahList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/tausiyah/${item.id}`)}
                    className="flex flex-col p-6 border border-gray-700 rounded-lg shadow-md bg-[#1A1614] text-white cursor-pointer hover:bg-[#2a2421] transition-colors duration-200"
                  >
                    <h2 className="text-2xl font-bold text-yellow-400 mb-3">{item.judul}</h2>
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
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold text-yellow-400">Oleh:</span> {item.user?.nama || item.user?.name || 'Anonim'}
                      </div>
                    </div>
                    {userRole === 'admin' && (
                      <div className="mt-5 flex gap-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setFormData({
                              id: item.id,
                              judul: item.judul,
                              isi: item.isi,
                              waktu: item.waktu.slice(0, 16),
                            });
                            setEditMode(true);
                            setShowModal(true);
                            setError(null);
                          }}
                          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-md text-sm font-semibold transition-colors duration-200 flex-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-semibold transition-colors duration-200 flex-1"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Form */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Tausiyah' : 'Tambah Tausiyah'}</DialogTitle>
            <DialogDescription>
              {editMode
                ? 'Ubah informasi tausiyah sesuai kebutuhan.'
                : 'Isi formulir berikut untuk menambahkan tausiyah baru.'}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="flex flex-col gap-4 mt-4"
          >
            <div>
              <label htmlFor="judul" className="block font-semibold mb-1 text-black">
                Judul
              </label>
              <input
                type="text"
                id="judul"
                name="judul"
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                placeholder="Judul tausiyah"
              />
            </div>

            <div>
              <label htmlFor="isi" className="block font-semibold mb-1 text-black">
                Isi
              </label>
              <textarea
                id="isi"
                name="isi"
                rows={6}
                value={formData.isi}
                onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                placeholder="Isi tausiyah"
              />
            </div>

            <div>
              <label htmlFor="waktu" className="block font-semibold mb-1 text-black">
                Waktu
              </label>
              <input
                type="datetime-local"
                id="waktu"
                name="waktu"
                value={formData.waktu}
                onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-black"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setEditMode(false);
                  setFormData({ id: 0, judul: '', isi: '', waktu: '' });
                  setError(null);
                }}
                className="mr-4"
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus tausiyah{' '}
              <strong>{tausiyahToDelete?.judul}</strong>?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="mr-4"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
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

export default TausiyahPage;