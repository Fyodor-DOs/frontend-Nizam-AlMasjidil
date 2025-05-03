'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '@/utils/api';

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
    <div className="min-h-screen bg-[#1A1614] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-yellow-400 text-black py-4 px-6 text-center font-bold text-lg">
          Formulir Donasi
        </div>

        <div className="p-8 bg-white">
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
              <label className="block mb-1 font-semibold text-gray-700">Jumlah Donasi (Rp)</label>
              <input
                type="number"
                name="jumlah"
                value={formData.jumlah}
                onChange={handleChange}
                placeholder="Contoh: 50000"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-700">Metode Pembayaran</label>
              <select
                name="metode_pembayaran"
                value={formData.metode_pembayaran}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              >
                <option value="">Pilih metode</option>
                <option value="transfer">Transfer</option>
                <option value="tunai">Tunai</option>
                <option value="e-wallet">E-Wallet</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition"
            >
              Donasi Sekarang
            </button>
          </form>

          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 text-sm text-yellow-600 hover:underline block text-center"
          >
            ← Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Donasi;
