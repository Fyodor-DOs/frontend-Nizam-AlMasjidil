'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '@/utils/api';
import Navbar from '@/components/Navbar'; 


const images = [
  '/images/masjid6.jpg'
];

const Donasi = () => {
  const [formData, setFormData] = useState({
    jumlah: '',
    metode_pembayaran: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
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
      setError('Gagal mengambil data user');
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
    }
  };
  

  return (
    <div className="min-h-screen bg-[#1A1614] pt-15">
      <Navbar role={role} user={user}/>
      {/* Banner */}
      <div className="relative h-64 w-full">
        <img
          src="/images/masjid7.jpg"
          alt="Banner Donasi"
          className=" w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-3xl md:text-4xl font-bold">Donasi untuk Masjid</h1>
        </div>
      </div>
  
      {/* Deskripsi */}
      <div className="max-w-3xl mx-auto px-6 py-10 text-center">
        <h2 className="text-2xl font-semibold text-white mb-4">Bersama Kita Bangun Kebaikan</h2>
        <p className="text-white text-md leading-relaxed">
          Salurkan donasi terbaik Anda untuk mendukung kegiatan dakwah, pendidikan, dan sosial yang diselenggarakan oleh masjid.
        </p>
      </div>
  
      {/* Form Donasi */}
      <div className="max-w-xl mx-auto bg-gray-50 rounded-xl shadow-md p-8">
        {error && (
          <p className="mb-4 p-3 text-sm text-red-600 bg-red-100 rounded">
            {error}
          </p>
        )}
        {successMessage && (
          <p className="mb-4 p-3 text-sm text-green-700 bg-green-100 rounded">
            {successMessage}
          </p>
        )}
  
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Jumlah Donasi (Rp)</label>
            <input
              type="number"
              name="jumlah"
              value={formData.jumlah}
              onChange={handleChange}
              placeholder="Contoh: 50000"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500 placeholder-gray-300 text-black"
              required
            />
          </div>
  
          <div>
            <label className="block mb-1 font-medium text-gray-700">Metode Pembayaran</label>
            <select
              name="metode_pembayaran"
              value={formData.metode_pembayaran}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500 placeholder-gray-300"
              required
            >
              <option value="">Pilih metode</option>
              <option value="transfer">Transfer Bank</option>
              <option value="tunai">Tunai</option>
              <option value="e-wallet">E-Wallet</option>
            </select>
          </div>
  
          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-md transition"
          >
            Donasi Sekarang
          </button>
        </form>
  
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-yellow-600 hover:underline"
          >
            ← Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );  
};

export default Donasi;