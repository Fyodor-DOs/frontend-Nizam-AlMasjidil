'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '@/utils/api';
import Navbar from '@/components/Navbar';

interface User {
  id: number;
  nama: string;
  email: string;
  role: string;
}

const Donasi = () => {
  const [formData, setFormData] = useState({
    jumlah: '',
    metode_pembayaran: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('role');
    if (token) {
      setAuthToken(token);
      setRole(userRole);
      fetchUserData();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      setIsLoading(true);
      await api.post('/donasi', {
        jumlah: parseInt(formData.jumlah),
        metode_pembayaran: formData.metode_pembayaran,
      });

      setSuccessMessage('Donasi berhasil dikirim!');
      setFormData({ jumlah: '', metode_pembayaran: '' });

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      console.error('Donasi Error:', err);
      if (err.response) {
        setError(err?.response?.data?.message || 'Gagal mengirim donasi');
      } else if (err.request) {
        setError('Server tidak merespons.');
      } else {
        setError('Terjadi kesalahan.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1614] text-white">
      <Navbar role={role} user={user} />

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
            Ulurkan Tangan, Tebar Kebaikan
          </h1>
          <p className="mt-4 text-xl md:text-2xl font-light text-gray-200">
            Setiap donasi Anda adalah cahaya bagi kemajuan masjid dan komunitas.
          </p>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="container mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Deskripsi */}
        <div className="text-center md:text-left">
          <h2 className="text-4xl font-bold mb-6 text-yellow-400">
            Dampak Positif Donasi Anda
          </h2>
          <p className="text-lg leading-relaxed mb-6 text-gray-300">
            Kontribusi Anda sangat berarti untuk operasional dan program masjid yang berkelanjutan. Donasi Anda membantu kami dalam:
          </p>
          <ul className="list-disc list-inside text-lg space-y-3 mb-8 text-gray-300">
            <li><strong>Pemeliharaan Rutin:</strong> Menjaga kebersihan dan kenyamanan fasilitas ibadah.</li>
            <li><strong>Program Pendidikan:</strong> Mendukung kelas mengaji, kajian, dan pelatihan keagamaan.</li>
            <li><strong>Kegiatan Sosial:</strong> Menyalurkan bantuan kepada yang membutuhkan di lingkungan sekitar.</li>
            <li><strong>Pengembangan Infrastruktur:</strong> Memperbaiki dan memperluas area masjid jika diperlukan.</li>
          </ul>
          <p className="text-xl leading-relaxed font-semibold text-yellow-300 mb-6">
            Jadikan donasi Anda sebagai investasi terbaik untuk akhirat.
          </p>

          {/* Tombol Kembali ke Beranda */}
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-yellow-400 text-black font-semibold py-3 px-6 rounded-full hover:bg-yellow-500 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Kembali ke Beranda
          </button>
        </div>

        {/* Form Donasi */}
        <div className="bg-black rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-yellow-400 text-black py-4 px-6 text-center font-bold text-lg">
            Formulir Donasi
          </div>
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-400 text-center text-sm">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-600/20 border border-green-500 rounded-lg text-green-400 text-center text-sm">
                {successMessage}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="jumlah" className="block mb-2 font-semibold text-gray-200">Jumlah Donasi (Rp)</label>
                <input
                  type="number"
                  id="jumlah"
                  name="jumlah"
                  value={formData.jumlah}
                  onChange={handleChange}
                  placeholder="Contoh: 100.000"
                  className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-lg"
                  required
                  min="10000"
                />
              </div>
              <div>
                <label htmlFor="metode_pembayaran" className="block mb-2 font-semibold text-gray-200">Metode Pembayaran</label>
                <select
                  id="metode_pembayaran"
                  name="metode_pembayaran"
                  value={formData.metode_pembayaran}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-lg"
                  required
                >
                  <option value="">Pilih metode pembayaran</option>
                  <option value="transfer">Transfer Bank</option>
                  <option value="tunai">Tunai Langsung</option>
                  <option value="e-wallet">E-Wallet (Dana, OVO, GoPay, dll.)</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-6 w-6 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Mengirim Donasi...</span>
                  </>
                ) : (
                  'Donasi Sekarang Juga'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donasi;
