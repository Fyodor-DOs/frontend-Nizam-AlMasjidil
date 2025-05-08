'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { setAuthToken } from '@/utils/api';

const images = [
  '/images/masjid4.jpg',
  '/images/masjid2.jpg',
  '/images/masjid3.jpg',
]; // Ganti dengan path gambar Anda

const Dashboard = () => {
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('role');

    if (!token || !userRole) {
      router.push('/login');
    } else {
      setAuthToken(token);
      setRole(userRole);
    }
  }, [router]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Ganti angka 5000 (milidetik) untuk mengubah durasi tampilan gambar

    return () => clearInterval(intervalId); // Membersihkan interval saat komponen unmount
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('role');
    router.push('/login');
  };

  return (
    <div className="bg-[#1A1614] text-white min-h-screen flex flex-col font-sans antialiased">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1A1614] border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-md">
        <h1 className="text-xl md:text-2xl font-semibold text-yellow-400 tracking-wide">AlMasjid Digital</h1>
        <nav className="space-x-4 text-sm md:text-base">
          <Link href="/donasi" className="px-3 py-2 hover:text-yellow-300 transition duration-300">Donasi</Link>
          <Link href="/keuangan" className="px-3 py-2 hover:text-green-300 transition duration-300">Keuangan</Link>
          <Link href="/kegiatan" className="px-3 py-2 hover:text-blue-300 transition duration-300">Kegiatan</Link>
          {role === 'admin' && (
            <Link href="/users" className="px-3 py-2 hover:text-purple-300 transition duration-300">Kelola User</Link>
          )}
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full ml-2 shadow-md transition duration-300">
            Logout
          </button>
        </nav>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* Hero Image Carousel */}
      <section className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-xl mx-auto max-w-6xl mt-6">
        {images.map((imageUrl, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            style={{ backgroundImage: `url('${imageUrl}')`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}
          >
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <h2 className="text-4xl md:text-5xl font-extrabold text-yellow-400 text-center px-8 leading-tight tracking-wider drop-shadow-lg">Selamat Datang di <br /> AlMasjid Digital</h2>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
          </div>
        ))}
      </section>

      {/* Sejarah Masjid */}
      <section className="w-full max-w-6xl mx-auto my-16 px-6 grid md:grid-cols-2 gap-10 items-center">
        {/* Card Gambar Masjid */}
        <div className="rounded-lg overflow-hidden shadow-md">
          <div className="aspect-w-16 aspect-h-9"> {/* Rasio aspek 16:9 untuk gambar */}
            <img
              src="/images/masjid2.jpg"
              alt="Sejarah"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        {/* Teks Sejarah */}
        <div>
          <h3 className="text-3xl font-semibold text-yellow-400 mb-6">Sejarah Masjid</h3>
          <p className="text-gray-300 leading-relaxed text-lg">
            Masjid ini dibangun dari semangat perjuangan para pahlawan dan masyarakat muslim yang ingin tempat ibadah yang megah dan khusyuk. Berlokasi strategis dan mudah dijangkau oleh jamaah dari berbagai wilayah.
          </p>
        </div>
      </section>

      {/* Fitur-Fitur */}
            <section className="w-full max-w-5xl mx-auto px-6 mb-20">
        <h3 className="text-3xl font-semibold text-yellow-400 text-center mb-12">Fitur AlMasjid Digital</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Donasi */}
          <Link href="/donasi" className="bg-white/5 border border-white/10 backdrop-blur-md rounded-lg shadow-md p-8 hover:shadow-lg transition duration-300 flex flex-col items-center">
            <div className="relative w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center mb-4">
              <img src="/images/donasi-icon.png" alt="Donasi" className="w-10 h-10 object-contain" /> {/* Ganti dengan path gambar ikon donasi */}
            </div>
            <h4 className="text-xl font-semibold text-yellow-300 mb-2 text-center">Donasi Digital</h4>
            <p className="text-gray-300 text-sm leading-relaxed text-center">
              Memudahkan jamaah dalam memberikan donasi secara digital kapan saja dan di mana saja, serta memberikan transparansi pengelolaan dana.
            </p>
          </Link>

          {/* Keuangan */}
          <Link href="/keuangan" className="bg-white/5 border border-white/10 backdrop-blur-md rounded-lg shadow-md p-8 hover:shadow-lg transition duration-300 flex flex-col items-center">
            <div className="relative w-20 h-20 rounded-full bg-green-400 flex items-center justify-center mb-4">
              <img src="/images/keuangan-icon.png" alt="Keuangan" className="w-10 h-10 object-contain" /> {/* Ganti dengan path gambar ikon keuangan */}
            </div>
            <h4 className="text-xl font-semibold text-green-300 mb-2 text-center">Manajemen Keuangan</h4>
            <p className="text-gray-300 text-sm leading-relaxed text-center">
              Laporan pemasukan dan pengeluaran masjid tercatat dengan rapi dan otomatis, sehingga lebih mudah dipantau dan diaudit.
            </p>
          </Link>

          {/* Kelola User */}
          {role === 'admin' && (
            <Link href="/users" className="bg-white/5 border border-white/10 backdrop-blur-md rounded-lg shadow-md p-8 hover:shadow-lg transition duration-300 flex flex-col items-center">
              <div className="relative w-20 h-20 rounded-full bg-purple-400 flex items-center justify-center mb-4">
                <img src="/images/users-icon.png" alt="Kelola User" className="w-10 h-10 object-contain" /> {/* Ganti dengan path gambar ikon kelola user */}
              </div>
              <h4 className="text-xl font-semibold text-purple-300 mb-2 text-center">Kelola Pengguna</h4>
              <p className="text-gray-300 text-sm leading-relaxed text-center">
                Admin dapat menambahkan, mengubah, dan menghapus pengguna yang memiliki akses ke sistem informasi masjid ini.
              </p>
            </Link>
          )}

          {/* Kegiatan Masjid */}
          <Link href="/kegiatan" className="bg-white/5 border border-white/10 backdrop-blur-md rounded-lg shadow-md p-8 hover:shadow-lg transition duration-300 flex flex-col items-center">
            <div className="relative w-20 h-20 rounded-full bg-blue-400 flex items-center justify-center mb-4">
              <img src="/images/kegiatan-icon.png" alt="Kegiatan Masjid" className="w-10 h-10 object-contain" /> {/* Ganti dengan path gambar ikon kegiatan */}
            </div>
            <h4 className="text-xl font-semibold text-blue-300 mb-2 text-center">Kegiatan Masjid</h4>
            <p className="text-gray-300 text-sm leading-relaxed text-center">
              Informasi mengenai jadwal kegiatan rutin dan insidental di masjid.
            </p>
          </Link>

          {/* Informasi */}
          <Link href="/informasi" className="bg-white/5 border border-white/10 backdrop-blur-md rounded-lg shadow-md p-8 hover:shadow-lg transition duration-300 flex flex-col items-center">
            <div className="relative w-20 h-20 rounded-full bg-amber-400 flex items-center justify-center mb-4">
              <img src="/images/informasi-icon.png" alt="Informasi" className="w-10 h-10 object-contain" /> {/* Ganti dengan path gambar ikon informasi */}
            </div>
            <h4 className="text-xl font-semibold text-amber-300 mb-2 text-center">Informasi</h4>
            <p className="text-gray-300 text-sm leading-relaxed text-center">
              Pengumuman penting dan informasi terbaru dari pengurus masjid.
            </p>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1614] border-t border-white/10 py-6 text-center text-gray-400">
        &copy; {new Date().getFullYear()} AlMasjid Digital. All rights reserved.
      </footer>
    </div>
  );
};

export default Dashboard;