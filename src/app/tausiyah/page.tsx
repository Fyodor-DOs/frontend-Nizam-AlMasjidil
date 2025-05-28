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
import { Button } from "@/components/ui/button"; // Assuming Button component is styled consistently

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
  const [tausiyahList, setTausiyahList] = useState<Tausiyah[]>([]);
  const [formData, setFormData] = useState({ id: 0, judul: '', isi: '', waktu: '' });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false); // For Add/Edit Tausiyah
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // For Delete Confirmation
  const [tausiyahToDelete, setTausiyahToDelete] = useState<Tausiyah | null>(null); // To store tausiyah object to be deleted

  const router = useRouter();

  const getCurrentDateTime = () => {
    const now = new Date();
    // Format to 'YYYY-MM-DDTHH:MM' for datetime-local input compatibility
    return now.toISOString().slice(0, 16);
  };

  useEffect(() => {
    // Control body overflow when modals are open
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
      fetchUserData();
    } else {
      // Redirect to login if no token, consistent with KegiatanPage
      router.push('/login');
    }
    fetchTausiyah();
  }, [router]);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/user');
      setUser(response.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
      // Optionally handle error, e.g., redirect to login if user session is invalid
      // router.push('/login');
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
    if (userRole !== 'admin') {
      setError('Anda tidak memiliki izin untuk melakukan aksi ini.');
      return;
    }

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
        // Ensure waktu is correctly formatted if needed by backend, otherwise, backend might handle it
        waktu: formData.waktu || getCurrentDateTime() // Use existing time if editing, or current time if creating
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
      const errorMessage = err.response?.data?.message || err.message || (editMode ? 'Gagal mengedit tausiyah' : 'Gagal menambah tausiyah');
      setError(errorMessage);
      console.error('Error saving tausiyah:', err);
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
      setError('Anda tidak memiliki izin untuk menghapus tausiyah atau tausiyah tidak ditemukan.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await api.delete(`/tausiyah/${tausiyahToDelete.id}`);
      setShowDeleteDialog(false);
      setTausiyahToDelete(null);
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
    <div className="min-h-screen bg-[#1A1614] text-white">
      <Navbar role={userRole} user={user} />

      {/* Hero Section (Banner) */}
      <div className="relative h-96 w-full flex items-center justify-center overflow-hidden">
        <img
          src="/images/masjid7.jpg" // Consistent image for branding
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

      {/* Main Content - Description and Tausiyah List */}
      <div className="container mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Description Section */}
        <div className="text-center md:text-left">
          <h2 className="text-4xl font-bold mb-6 text-yellow-400">
            Mutiara Hikmah Setiap Hari
          </h2>
          <p className="text-lg leading-relaxed mb-6 text-gray-300">
            Halaman ini didedikasikan untuk menyajikan kumpulan tausiyah, khutbah, dan nasihat Islami. Temukan pencerahan untuk jiwa, inspirasi untuk kehidupan, dan panduan untuk beribadah dalam setiap tulisan.
          </p>
          <ul className="list-disc list-inside text-lg space-y-3 mb-8 text-gray-300">
            <li>**Inspirasi Harian:** Bacaan ringan untuk memulai hari dengan keberkahan.</li>
            <li>**Pencerahan Jiwa:** Topik mendalam untuk meningkatkan keimanan.</li>
            <li>**Panduan Amaliah:** Nasihat praktis untuk ibadah sehari-hari.</li>
            <li>**Dari Berbagai Ulama:** Koleksi dari sumber-sumber terpercaya.</li>
          </ul>
          <p className="text-xl leading-relaxed font-semibold text-yellow-300">
            Mari kita jadikan setiap bacaan sebagai langkah mendekatkan diri kepada-Nya.
          </p>
        </div>

        {/* Tausiyah List Section (resembling donation form card) */}
        <div className="bg-black rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-yellow-400 text-black py-4 px-6 text-center font-bold text-lg relative">
            Daftar Tausiyah Terbaru
            {userRole === 'admin' && (
              <button
                onClick={() => {
                  setShowModal(true);
                  setEditMode(false);
                  setFormData({ id: 0, judul: '', isi: '', waktu: getCurrentDateTime() });
                  setError(null); // Clear previous errors
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
                              waktu: item.waktu.slice(0, 16), // Ensure correct format for datetime-local
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

      {/* "Kembali ke Beranda" Button - Placed at the bottom */}
      <div className="text-center pb-16 pt-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-yellow-400 text-black font-semibold py-3 px-6 rounded-full hover:bg-yellow-500 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          ← Kembali ke Beranda
        </button>
      </div>

      {/* Modal Buat/Edit */}
      {showModal && userRole === 'admin' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="border border-gray-700 bg-[#1A1614] p-8 rounded-lg shadow-2xl w-full max-w-md text-white transform scale-100 transition-transform duration-300">
            <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">
              {editMode ? 'Edit Tausiyah' : 'Buat Tausiyah Baru'}
            </h2>
            {error && (
              <div className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-400 text-center text-sm">
                {error}
              </div>
            )}
            <div className="space-y-5">
              <div>
                <label className="block mb-2 font-semibold text-gray-300">Judul Tausiyah</label>
                <input
                  type="text"
                  placeholder="Contoh: Keutamaan Sholat Berjamaah"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full p-4 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 text-lg"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-300">Isi Tausiyah</label>
                <textarea
                  placeholder="Tulis isi tausiyah di sini..."
                  value={formData.isi}
                  onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                  className="w-full p-4 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 h-40 text-lg"
                  required
                />
              </div>
              {/* Only show waktu field if in edit mode, as new tausiyah will use current time */}
              {editMode && (
                <div>
                  <label className="block mb-2 font-semibold text-gray-300">Waktu Tausiyah</label>
                  <input
                    type="datetime-local"
                    value={formData.waktu}
                    onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                    className="w-full p-4 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-yellow-500 focus:border-yellow-500 text-lg"
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditMode(false);
                  setFormData({ id: 0, judul: '', isi: '', waktu: '' });
                  setError(null);
                }}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-lg font-semibold transition-colors duration-200"
                disabled={isLoading}
              >
                Batal
              </button>
              <button
                onClick={handleCreateOrUpdate}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-md text-lg font-semibold disabled:opacity-50 transition-colors duration-200 flex items-center justify-center gap-2"
                disabled={isLoading}
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
                  editMode ? 'Simpan Perubahan' : 'Buat Tausiyah'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1A1614] border-gray-700 text-white shadow-xl p-8 rounded-lg max-w-md">
          <DialogHeader className="text-center">
            <DialogTitle className="text-3xl font-bold text-yellow-400 mb-2">Konfirmasi Hapus Tausiyah</DialogTitle>
            <DialogDescription className="text-gray-300 text-lg">
              Apakah Anda yakin ingin menghapus tausiyah **"{tausiyahToDelete?.judul}"**? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <button
              onClick={() => {
                setShowDeleteDialog(false);
                setTausiyahToDelete(null); // Clear item on dialog close
              }}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-lg font-semibold transition-colors duration-200 w-full sm:w-auto"
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md text-lg font-semibold disabled:opacity-50 transition-colors duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
              disabled={isLoading}
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
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TausiyahPage;