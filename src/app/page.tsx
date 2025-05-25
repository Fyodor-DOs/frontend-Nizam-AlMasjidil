'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const cities = [
  { name: 'Jakarta', value: 'Jakarta' },
  { name: 'Bandung', value: 'Bandung' },
  { name: 'Surabaya', value: 'Surabaya' },
  { name: 'Medan', value: 'Medan' },
  { name: 'Semarang', value: 'Semarang' },
  { name: 'Yogyakarta', value: 'Yogyakarta' },
  { name: 'Palembang', value: 'Palembang' },
  { name: 'Makassar', value: 'Makassar' },
  { name: 'Denpasar', value: 'Denpasar' },
  { name: 'Malang', value: 'Malang' }
];

export default function Home() {
  const router = useRouter();
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState('Jakarta');

  useEffect(() => {
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
      setSelectedCity(savedCity);
    }
  }, []);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.aladhan.com/v1/timingsByCity?city=${selectedCity}&country=Indonesia&method=11`
        );
        
        const data = await response.json();
        if (data.code === 200) {
          setPrayerTimes(data.data.timings);
          localStorage.setItem('selectedCity', selectedCity);
        } else {
          setError('Gagal mengambil jadwal sholat');
        }
      } catch (err) {
        console.error('Error fetching prayer times:', err);
        setError('Terjadi kesalahan saat mengambil jadwal sholat');
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [selectedCity]);

  return (
    <div className="min-h-screen bg-[#1A1614] text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1A1614]/95 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 text-xl font-bold text-white hover:opacity-90 transition-opacity">
            <Image
              src="/images/logo_textless.png"
              alt="AlMasjid Digital Logo"
              width={35}
              height={35}
              className="rounded-full shadow-md"
            />
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              AlMasjid Digital
            </span>
          </Link>
          <nav className="flex items-center gap-8">
            <Button variant="secondary" className="bg-yellow-400 text-black hover:bg-yellow-300" asChild>
              <Link href="/login">Masuk</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section id="hero-section" className="relative min-h-[90vh] flex items-center justify-center text-center px-4">
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

      <section id="prayer-times-section" className="max-w-6xl mx-auto py-20 px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Jadwal Sholat Hari Ini
        </h2>
        
        <div className="max-w-xs mx-auto mb-12">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#1E1E1E] text-white border border-white/10 focus:border-yellow-400 focus:outline-none"
          >
            {cities.map((city) => (
              <option key={city.value} value={city.value}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center text-gray-400">Memuat jadwal sholat...</div>
        ) : error ? (
          <div className="text-center text-red-400">{error}</div>
        ) : prayerTimes ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Imsak', time: prayerTimes.Imsak, icon: '⏰' },
              { name: 'Subuh', time: prayerTimes.Fajr, icon: '🌅' },
              { name: 'Dzuhur', time: prayerTimes.Dhuhr, icon: '☀️' },
              { name: 'Ashar', time: prayerTimes.Asr, icon: '🌤️' },
              { name: 'Maghrib', time: prayerTimes.Maghrib, icon: '🌅' },
              { name: 'Isya', time: prayerTimes.Isha, icon: '🌙' }
            ].map((prayer) => (
              <div 
              key={prayer.name}
                className="bg-[#1E1E1E] p-6 rounded-lg text-center hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                <div className="text-4xl mb-4">{prayer.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-white">{prayer.name}</h3>
                <p className="text-2xl font-bold text-yellow-400">{prayer.time}</p>
              </div>
            ))}
          </div>
        ) : null}
        <p className="text-center text-gray-400 mt-8 text-sm">
          Jadwal sholat dapat berubah sesuai dengan lokasi dan waktu setempat
        </p>
      </section>

      <section className="max-w-6xl mx-auto py-20 px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Mengapa Harus Menggunakan AlMasjid Digital?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Donasi Digital',
              description: 'Memudahkan jamaah dalam memberikan donasi secara digital kapan saja dan di mana saja, serta memberikan transparansi pengelolaan dana.',
              icon: '💰',
              color: 'text-yellow-400'
            },
            {
              title: 'Manajemen Keuangan',
              description: 'Laporan pemasukan dan pengeluaran masjid tercatat dengan rapi dan otomatis, sehingga lebih mudah dipantau dan diaudit.',
              icon: '📊',
              color: 'text-orange-400'
            },
            {
              title: 'Kegiatan Masjid',
              description: 'Informasi mengenai jadwal kegiatan rutin dan insidental di masjid.',
              icon: '📅',
              color: 'text-green-400'
            }
          ].map((feature) => (
            <div 
              key={feature.title}
              className={`bg-[#1E1E1E] p-6 rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-300`}
              onClick={() => {
                const heroSection = document.getElementById('hero-section');
                if (heroSection) {
                  heroSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
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
              color: 'text-blue-400',
              scrollTo: 'hero-section'
            },
            {
              title: 'Jadwal Pengajian',
              description: 'Informasi lengkap mengenai jadwal pengajian rutin maupun khusus.',
              icon: '📚',
              color: 'text-orange-400',
              scrollTo: 'prayer-times-section'
            },
            {
              title: 'Inventaris',
              description: 'Pencatatan dan manajemen inventaris masjid yang terstruktur.',
              icon: '📋',
              color: 'text-green-400',
              scrollTo: 'hero-section'
            },
            {
              title: 'Dewan Pengurus',
              description: 'Informasi struktur dan susunan pengurus masjid.',
              icon: '👥',
              color: 'text-purple-400',
              scrollTo: 'hero-section'
            },
            {
              title: 'Laporan Wakaf',
              description: 'Transparansi pengelolaan dan pelaporan dana wakaf.',
              icon: '📊',
              color: 'text-yellow-400',
              scrollTo: 'hero-section'
            },
            {
              title: 'Galeri Gambar',
              description: 'Dokumentasi kegiatan dan galeri foto masjid.',
              icon: '🖼️',
              color: 'text-pink-400',
              scrollTo: 'hero-section'
            },
            {
              title: 'Tausiyah',
              description: 'Kumpulan artikel dan tulisan tentang keislaman dan kegiatan masjid.',
              icon: '📝',
              color: 'text-emerald-400',
              scrollTo: 'hero-section',
              link: '/tausiyah'
            },
            {
              title: 'Jadwal Sholat',
              description: 'Informasi jadwal sholat harian dan pengingat waktu sholat.',
              icon: '🕌',
              color: 'text-amber-400',
              scrollTo: 'prayer-times-section'
            }
          ].map((feature) => (
            <div 
              key={feature.title}
              className="bg-[#1E1E1E] p-6 rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-300"
              onClick={() => {
                if (feature.link) {
                  router.push(feature.link);
                } else {
                  const section = document.getElementById(feature.scrollTo);
                  if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
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

      <footer className="border-t border-white/10 bg-[#0D0D0D] py-12">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold mb-4 text-white">More on the Blog</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="text-gray-400 hover:text-yellow-400 transition">Dashboard</Link></li>
              <li><Link href="/donasi" className="text-gray-400 hover:text-yellow-400 transition">Donasi Online</Link></li>
              <li><Link href="/keuangan" className="text-gray-400 hover:text-yellow-400 transition">Keuangan</Link></li>
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
