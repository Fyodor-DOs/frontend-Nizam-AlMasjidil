'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { setAuthToken } from '@/utils/api';

const Dashboard = () => {
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('role');
    router.push('/login');
  };

  return (
    <div className="bg-[#1A1614] text-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1A1614] border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-md">
        <h1 className="text-xl md:text-2xl font-bold text-yellow-400">AlMasjid Digital</h1>
        <nav className="space-x-4 text-sm md:text-base">
          <Link href="/donasi" className="hover:text-yellow-400">Donasi</Link>
          <Link href="/keuangan" className="hover:text-green-400">Keuangan</Link>
          <Link href="/kegiatan" className="hover:text-blue-400">Kegiatan</Link>
          {role === 'admin' && (
            <Link href="/users" className="hover:text-purple-400">Kelola User</Link>
          )}
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full ml-2">
            Logout
          </button>
        </nav>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* Hero Image */}
      <section className="relative h-[300px] w-full bg-cover bg-center" style={{ backgroundImage: "url('/images/masjid.jpg')" }}>
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <h2 className="text-4xl font-bold text-yellow-400 text-center px-4">Selamat Datang di Dashboard</h2>
        </div>
      </section>

      {/* Sejarah Masjid */}
      <section className="w-full max-w-6xl mx-auto my-16 px-6 grid md:grid-cols-2 gap-10 items-center">
        <img src="/images/masjid.jpg" alt="Sejarah" className="rounded-xl shadow-lg" />
        <div>
          <h3 className="text-3xl font-bold text-yellow-400 mb-4">Sejarah Masjid</h3>
          <p className="text-gray-300 leading-relaxed text-sm">
            Masjid ini dibangun dari semangat perjuangan para pahlawan dan masyarakat muslim yang ingin tempat ibadah yang megah dan khusyuk. Berlokasi strategis dan mudah dijangkau oleh jamaah dari berbagai wilayah.
          </p>
        </div>
      </section>

      {/* Fitur-Fitur */}
<section className="w-full max-w-5xl mx-auto px-6 mb-20">
  <h3 className="text-3xl font-bold text-yellow-400 text-center mb-12">Fitur AlMasjid Digital</h3>
  <div className="space-y-10">
    {/* Donasi */}
    <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 flex flex-col md:flex-row gap-6">
      <img src="/fitur-donasi.jpg" alt="Fitur Donasi" className="w-full md:w-48 h-32 object-cover rounded-xl" />
      <div>
        <h4 className="text-2xl font-bold text-yellow-300 mb-2">Donasi Digital</h4>
        <p className="text-gray-300 text-sm leading-relaxed">
          Memudahkan jamaah dalam memberikan donasi secara digital kapan saja dan di mana saja, serta memberikan transparansi pengelolaan dana.
        </p>
      </div>
    </div>

    {/* Keuangan */}
    <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 flex flex-col md:flex-row gap-6">
      <img src="/fitur-keuangan.jpg" alt="Fitur Keuangan" className="w-full md:w-48 h-32 object-cover rounded-xl" />
      <div>
        <h4 className="text-2xl font-bold text-green-300 mb-2">Manajemen Keuangan</h4>
        <p className="text-gray-300 text-sm leading-relaxed">
          Laporan pemasukan dan pengeluaran masjid tercatat dengan rapi dan otomatis, sehingga lebih mudah dipantau dan diaudit.
        </p>
      </div>
    </div>

    {/* Kelola User */}
    {role === 'admin' && (
      <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 flex flex-col md:flex-row gap-6">
        <img src="/fitur-user.jpg" alt="Fitur User" className="w-full md:w-48 h-32 object-cover rounded-xl" />
        <div>
          <h4 className="text-2xl font-bold text-purple-300 mb-2">Kelola Pengguna</h4>
          <p className="text-gray-300 text-sm leading-relaxed">
            Admin dapat menambahkan, mengubah, dan menghapus pengguna yang memiliki akses ke sistem informasi masjid ini.
          </p>
        </div>
      </div>
    )}
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
