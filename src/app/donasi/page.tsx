'use client';

import React, { useState, useEffect } from 'react';
import api, { setAuthToken } from '@/utils/api';
import { useRouter } from 'next/navigation';

const Donasi = () => {
  const [formData, setFormData] = useState({
    jumlah: '',
    metode_pembayaran: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    } else {
      // Kalau tidak ada token, redirect ke login
      router.push('/login');
    }
  }, [router]);

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

      // Optional: redirect ke dashboard
      // router.push('/dashboard');
    } catch (err: any) {
        console.error('Donasi Error:', err);

        if (err.response) {
            console.error('Error Message:', err.response.data.message);
            console.error('Error Details:', err.response.data.error); // <=== ini tambah untuk cek detailnya
            console.error('Error Trace:', err.response.data.trace);   // <=== ini untuk trace nya
            setError(err?.response?.data?.message || 'Gagal mengirim donasi');
        } else if (err.request) {
            console.error('Donasi Request Error:', err.request);
            setError('No response received from server.');
        } else {
            setError('Error saat mengirim permintaan.');
        }
    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black">
      <div className="w-full max-w-md p-8 border border-gray-300 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Form Donasi</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            name="jumlah"
            placeholder="Jumlah Donasi (Rp)"
            value={formData.jumlah}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <select
            name="metode_pembayaran"
            value={formData.metode_pembayaran}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Pilih Metode Pembayaran</option>
            <option value="transfer">Transfer</option>
            <option value="tunai">Tunai</option>
            <option value="e-wallet">E-Wallet</option>
          </select>

          <button
            type="submit"
            className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded"
          >
            Donasi Sekarang
          </button>
        </form>
      </div>
    </div>
  );
};

export default Donasi;
