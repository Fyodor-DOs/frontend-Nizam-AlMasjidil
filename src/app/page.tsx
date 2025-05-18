'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#1A1614] text-white">
      {/* Header with blur effect */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1A1614]/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
            <Image
              src="/images/logo_textless.png"
              alt="AlMasjid Digital Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            AlMasjid Digital
          </Link>
          <nav className="space-x-6 hidden md:flex items-center">
            <Link href="/donasi" className="text-gray-300 hover:text-yellow-400 transition">Donasi</Link>
            <Link href="/keuangan" className="text-gray-300 hover:text-yellow-400 transition">Keuangan</Link>
            <Link href="/kegiatan" className="text-gray-300 hover:text-yellow-400 transition">Kegiatan</Link>
            <Button variant="secondary" className="bg-yellow-400 text-black hover:bg-yellow-300" asChild>
              <Link href="/login">Masuk</Link>
            </Button>
          </nav>
          <Button variant="secondary" className="md:hidden bg-yellow-400 text-black hover:bg-yellow-300" asChild>
            <Link href="/login">Masuk</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section with improved gradient */}
      <section className="relative min-h-[90vh] flex items-center justify-center text-center px-4">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/images/masjid8.jpg')",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1614]/95 via-[#1A1614]/70 to-[#1A1614]"></div>

        <div className="relative z-10 max-w-3xl pt-24">
          <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">
            A Digital Masjid
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight text-white">
            Nizam AlMasjidil Digital
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            Transformasi Digital Masjid: Layanan Manajemen Keuangan, Kegiatan,
            Jamaah, Donasi, dan Informasi Terintegrasi.
          </p>
          <Button size="lg" className="bg-white text-black hover:bg-gray-200" asChild>
            <Link href="/register">Buat Akun</Link>
          </Button>
        </div>
      </section>

      {/* Feature Section with Cards */}
      <section className="max-w-6xl mx-auto py-20 px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Mengapa Harus Menggunakan AlMasjid Digital?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              id: 'donasi',
              title: 'Donasi Digital',
              description: 'Memudahkan jamaah dalam memberikan donasi secara digital kapan saja dan di mana saja, serta memberikan transparansi pengelolaan dana.',
              icon: '💰',
              href: '/donasi',
              color: 'text-white-400 group-hover:text-black'
            },
            {
              id: 'keuangan',
              title: 'Manajemen Keuangan',
              description: 'Laporan pemasukan dan pengeluaran masjid tercatat dengan rapi dan otomatis, sehingga lebih mudah dipantau dan diaudit.',
              icon: '📊',
              href: '/keuangan',
              color: 'text-white-400 group-hover:text-black'
            },
            {
              id: 'kegiatan',
              title: 'Kegiatan Masjid',
              description: 'Informasi mengenai jadwal kegiatan rutin dan insidental di masjid.',
              icon: '📅',
              href: '/kegiatan',
              color: 'text-white-400 group-hover:text-black'
            }
          ].map((feature) => (
            <Link 
              href={feature.href}
              key={feature.id}
              className="group"
            >
              <Card className="border-0 shadow-none bg-[#1E1E1E] text-white h-full transition-all duration-300 group-hover:bg-white group-hover:text-black">
                <CardHeader>
                  <div className={`text-4xl mb-4 ${feature.color}`}>{feature.icon}</div>
                  <CardTitle className={`text-xl mb-4 ${feature.color}`}>{feature.title}</CardTitle>
                  <CardDescription className="text-gray-400 group-hover:text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Consultation Section */}
      <section className="bg-[#1E1E1E] py-20 px-4 text-center text-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Konsultasi Gratis
          </h2>
          <p className="text-lg mb-10">
            Jika Anda mengalami kesulitan, chat kami via WhatsApp untuk mendapatkan solusi cepat.
          </p>
          <a
            href="https://wa.me/6282110992160"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#2D6A4F] px-6 py-3 rounded-full hover:bg-opacity-90 transition-all font-medium"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 8.8 16.33 8.79 16.17 8.79C15.63 8.79 14.78 9.03 14.43 9.18C13.94 9.39 13.07 10.02 13.07 10.95C13.07 11.88 13.76 12.31 14.04 12.31C14.32 12.31 14.44 12.24 14.5 12.21C14.56 12.18 15.21 11.91 15.21 11.91C15.21 11.91 16.29 12.49 16.83 12.49C17.38 12.49 17.91 12.18 17.91 11.39C17.91 10.59 17.16 10.2 16.64 8.8ZM12 20.2C7.58 20.2 4 16.62 4 12.2C4 7.78 7.58 4.2 12 4.2C16.42 4.2 20 7.78 20 12.2C20 16.62 16.42 20.2 12 20.2Z" fill="currentColor"/>
            </svg>
            CHAT VIA WHATSAPP
          </a>
        </div>
      </section>

      {/* Minor Features Section */}
      <section className="max-w-6xl mx-auto py-20 px-4 border-t border-white/10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Fitur-Fitur AlMasjid Digital
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Profil Masjid',
              description: 'Informasi detail tentang sejarah dan profil lengkap masjid.',
              icon: '🕌',
              color: 'text-blue-400'
            },
            {
              title: 'Jadwal Pengajian',
              description: 'Informasi lengkap mengenai jadwal pengajian rutin maupun khusus.',
              icon: '📚',
              color: 'text-orange-400'
            },
            {
              title: 'Inventaris',
              description: 'Pencatatan dan manajemen inventaris masjid yang terstruktur.',
              icon: '📋',
              color: 'text-green-400'
            },
            {
              title: 'Dewan Pengurus',
              description: 'Informasi struktur dan susunan pengurus masjid.',
              icon: '👥',
              color: 'text-purple-400'
            },
            {
              title: 'Laporan Wakaf',
              description: 'Transparansi pengelolaan dan pelaporan dana wakaf.',
              icon: '📊',
              color: 'text-yellow-400'
            },
            {
              title: 'Galeri Gambar',
              description: 'Dokumentasi kegiatan dan galeri foto masjid.',
              icon: '🖼️',
              color: 'text-pink-400'
            }
          ].map((feature) => (
            <div 
              key={feature.title}
              className="bg-[#1E1E1E] p-6 rounded-lg"
            >
              <div className={`text-4xl mb-4 ${feature.color}`}>{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-400 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer with dark theme */}
      <footer className="border-t border-white/10 bg-[#0D0D0D] py-12">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold mb-4 text-white">More on the Blog</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="text-gray-400 hover:text-yellow-400 transition">Dashboard</Link></li>
              <li><Link href="/donasi" className="text-gray-400 hover:text-yellow-400 transition">Donasi Online</Link></li>
              <li><Link href="/keuangan" className="text-gray-400 hover:text-yellow-400 transition">Financial</Link></li>
              <li><Link href="/kegiatan" className="text-gray-400 hover:text-yellow-400 transition">Kegiatan Masjid</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">More on Nizam</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-yellow-400 transition">Tentang Kami</Link></li>
              <li><Link href="/team" className="text-gray-400 hover:text-yellow-400 transition">Tim</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-yellow-400 transition">Kontak</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          © 2025 Almasjid.id, Inc. Terms & Privacy
        </div>
      </footer>
    </div>
  );
}
