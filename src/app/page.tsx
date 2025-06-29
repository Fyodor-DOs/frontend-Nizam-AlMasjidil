'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/utils/api';

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

// PERBAIKAN: Mendefinisikan interface untuk Jadwal Sholat
interface PrayerTimes {
  Imsak: string;
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export default function Home() {
  const router = useRouter();
  // PERBAIKAN: Menggunakan interface PrayerTimes, bukan 'any'
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState('Jakarta');
  const [tausiyahList, setTausiyahList] = useState<Tausiyah[]>([]);
  const [loadingTausiyah, setLoadingTausiyah] = useState(true);

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
        setError(null);
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
      } catch (err: unknown) {
        console.error('Error fetching prayer times:', err);
        setError('Terjadi kesalahan saat mengambil jadwal sholat');
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [selectedCity]);

  useEffect(() => {
    const fetchTausiyah = async () => {
      try {
        setLoadingTausiyah(true);
        const res = await api.get('/tausiyah');
        setTausiyahList(res.data.slice(0, 3));
      } catch (e: unknown) { // PERBAIKAN: Menggunakan 'unknown', bukan 'any'
        console.error('Error fetching tausiyah:', e);
      } finally {
        setLoadingTausiyah(false);
      }
    };

    fetchTausiyah();
  }, []);

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  const slideInUp = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: (i: number) => ({
      y: 50 + i * 10,
      opacity: 0,
      scale: 0.95,
    }),
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 100,
        delay: i * 0.05,
      },
    }),
    hover: {
      scale: 1.03,
      y: -5,
      transition: {
        type: 'spring',
        damping: 10,
        stiffness: 300,
      },
      boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
    },
    tap: { scale: 0.98 },
  };

  const iconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 12,
      },
    },
    hover: {
      scale: 1.1,
      transition: { duration: 0.2 },
    },
  };

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
        {/* PERBAIKAN: Menggunakan komponen Image untuk latar belakang */}
        <Image
            src="/images/masjid8.jpg"
            alt="Latar belakang masjid"
            fill
            priority
            className="object-cover z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1614]/95 via-[#1A1614]/70 to-[#1A1614]"></div>

        <motion.div 
          className="relative z-10 max-w-3xl pt-24"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.p 
            className="text-sm uppercase tracking-widest text-gray-400 mb-2"
            variants={fadeIn}
          >
            A Digital Masjid
          </motion.p>
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-4 tracking-tight text-white"
            variants={slideInUp}
          >
            Nizam AlMasjidil Digital
          </motion.h1>
          <motion.p 
            className="text-gray-300 text-lg mb-8"
            variants={slideInUp}
          >
            Transformasi Digital Masjid: Layanan Manajemen Keuangan, Kegiatan,
            Jamaah, Donasi, dan Informasi Terintegrasi.
          </motion.p>
          <motion.div variants={fadeIn}>
            <Button size="lg" className="bg-white text-black hover:bg-gray-200" asChild>
              <Link href="/register">Buat Akun</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <section id="prayer-times-section" className="max-w-6xl mx-auto py-20 px-4">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={slideInUp}
        >
          Jadwal Sholat Hari Ini
        </motion.h2>
        
        <motion.div 
          className="max-w-xs mx-auto mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeIn}
        >
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
        </motion.div>

        {loading ? (
          <div className="text-center text-gray-400">Memuat jadwal sholat...</div>
        ) : error ? (
          <div className="text-center text-red-400">{error}</div>
        ) : prayerTimes ? (
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            {[
              { name: 'Imsak', time: prayerTimes.Imsak, icon: '⏰' },
              { name: 'Subuh', time: prayerTimes.Fajr, icon: '🌅' },
              { name: 'Dzuhur', time: prayerTimes.Dhuhr, icon: '☀️' },
              { name: 'Ashar', time: prayerTimes.Asr, icon: '🌤️' },
              { name: 'Maghrib', time: prayerTimes.Maghrib, icon: '🌅' },
              { name: 'Isya', time: prayerTimes.Isha, icon: '🌙' }
            ].map((prayer, index) => (
              <motion.div 
                key={prayer.name}
                className="bg-[#1E1E1E] p-6 rounded-lg text-center hover:bg-white/10 transition-all duration-300 cursor-pointer"
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                custom={index}
              >
                <motion.div
                  className="text-4xl mb-4"
                  initial="hidden"
                  animate="visible"
                  variants={iconVariants}
                  whileHover="hover"
                >{prayer.icon}</motion.div>
                <h3 className="text-xl font-semibold mb-2 text-white">{prayer.name}</h3>
                <p className="text-2xl font-bold text-yellow-400">{prayer.time}</p>
              </motion.div>
            ))}
          </motion.div>
        ) : null}
        <motion.p 
          className="text-center text-gray-400 mt-8 text-sm"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeIn}
        >
          Jadwal sholat dapat berubah sesuai dengan lokasi dan waktu setempat
        </motion.p>
      </section>

      <section className="max-w-6xl mx-auto py-20 px-4">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={slideInUp}
        >
          Mengapa Harus Menggunakan AlMasjid Digital?
        </motion.h2>
        <motion.div 
          className="grid md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          {[
            { title: 'Donasi Digital', description: 'Memudahkan jamaah dalam memberikan donasi secara digital kapan saja dan di mana saja, serta memberikan transparansi pengelolaan dana.', icon: '💰', color: 'text-yellow-400' },
            { title: 'Manajemen Keuangan', description: 'Laporan pemasukan dan pengeluaran masjid tercatat dengan rapi dan otomatis, sehingga lebih mudah dipantau dan diaudit.', icon: '📊', color: 'text-orange-400' },
            { title: 'Kegiatan Masjid', description: 'Informasi mengenai jadwal kegiatan rutin dan insidental di masjid.', icon: '📅', color: 'text-green-400' }
          ].map((feature, index) => (
            <motion.div 
              key={feature.title}
              className={`bg-[#1E1E1E] p-6 rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-300`}
              onClick={() => {
                const heroSection = document.getElementById('hero-section');
                if (heroSection) {
                  heroSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              custom={index}
            >
              <motion.div
                className={`text-4xl mb-4 ${feature.color}`}
                initial="hidden"
                animate="visible"
                variants={iconVariants}
                whileHover="hover"
              >{feature.icon}</motion.div>
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-400 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="bg-[#1E1E1E] py-20 px-4 text-center text-white">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={slideInUp}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Konsultasi Gratis
          </h2>
          <p className="text-lg mb-10">
            Jika Anda mengalami kesulitan, chat kami via WhatsApp untuk mendapatkan solusi cepat.
          </p>
          <motion.a
            href="https://wa.me/6282110992160"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#2D6A4F] px-6 py-3 rounded-full hover:bg-opacity-90 transition-all font-medium"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 8.8 16.33 8.79 16.17 8.79C15.63 8.79 14.78 9.03 14.43 9.18C13.94 9.39 13.07 10.02 13.07 10.95C13.07 11.88 13.76 12.31 14.04 12.31C14.32 12.31 14.44 12.24 14.5 12.21C14.56 12.18 15.21 11.91 15.21 11.91C15.21 11.91 16.29 12.49 16.83 12.49C17.38 12.49 17.91 12.18 17.91 11.39C17.91 10.59 17.16 10.2 16.64 8.8ZM12 20.2C7.58 20.2 4 16.62 4 12.2C4 7.78 7.58 4.2 12 4.2C16.42 4.2 20 7.78 20 12.2C20 16.62 16.42 20.2 12 20.2Z" fill="currentColor"/>
            </svg>
            CHAT VIA WHATSAPP
          </motion.a>
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto py-20 px-4 border-t border-white/10">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={slideInUp}
        >
          Fitur-Fitur AlMasjid Digital
        </motion.h2>
        <motion.div 
          className="grid md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          {[
            { title: 'Profil Masjid', description: 'Informasi detail tentang sejarah dan profil lengkap masjid.', icon: '🕌', color: 'text-blue-400', scrollTo: 'hero-section' },
            { title: 'Jadwal Pengajian', description: 'Informasi lengkap mengenai jadwal pengajian rutin maupun khusus.', icon: '📚', color: 'text-orange-400', scrollTo: 'prayer-times-section' },
            { title: 'Inventaris', description: 'Pencatatan dan manajemen inventaris masjid yang terstruktur.', icon: '📋', color: 'text-green-400', scrollTo: 'hero-section' },
            { title: 'Dewan Pengurus', description: 'Informasi struktur dan susunan pengurus masjid.', icon: '👥', color: 'text-purple-400', scrollTo: 'hero-section' },
            { title: 'Laporan Wakaf', description: 'Transparansi pengelolaan dan pelaporan dana wakaf.', icon: '📊', color: 'text-yellow-400', scrollTo: 'hero-section' },
            { title: 'Galeri Gambar', description: 'Dokumentasi kegiatan dan galeri foto masjid.', icon: '🖼️', color: 'text-pink-400', scrollTo: 'hero-section' },
            { title: 'Tausiyah', description: 'Kumpulan artikel dan tulisan tentang keislaman dan kegiatan masjid.', icon: '📝', color: 'text-emerald-400', scrollTo: 'hero-section', link: '/tausiyah' },
            { title: 'Jadwal Sholat', description: 'Informasi jadwal sholat harian dan pengingat waktu sholat.', icon: '🕌', color: 'text-amber-400', scrollTo: 'prayer-times-section' }
          ].map((feature, index) => (
            <motion.div 
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
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              custom={index}
            >
              <motion.div
                className={`text-4xl mb-4 ${feature.color}`}
                initial="hidden"
                animate="visible"
                variants={iconVariants}
                whileHover="hover"
              >{feature.icon}</motion.div>
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-400 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto py-20 px-4">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={slideInUp}
        >
          Tausiyah Terbaru
        </motion.h2>

        {loadingTausiyah ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-yellow-400 border-t-transparent"></div>
            <p className="mt-4 text-gray-400 text-lg">Memuat tausiyah...</p>
          </div>
        ) : tausiyahList.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-lg">Belum ada tausiyah yang tersedia saat ini.</p>
        ) : (
          <div className="space-y-8">
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
            >
              {tausiyahList.map((tausiyah, index) => (
                <motion.div
                  key={tausiyah.id}
                  className="bg-[#1E1E1E] p-6 rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-300"
                  onClick={() => router.push(`/tausiyah/${tausiyah.id}`)}
                  variants={cardVariants}
                  whileHover="hover"
                  whileTap="tap"
                  custom={index}
                >
                  <motion.div
                    className="text-4xl mb-4 text-yellow-400"
                    initial="hidden"
                    animate="visible"
                    variants={iconVariants}
                    whileHover="hover"
                  >📝</motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-white line-clamp-2">{tausiyah.judul}</h3>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                    {tausiyah.isi}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400 mt-auto">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>{new Date(tausiyah.waktu).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span>{tausiyah.user?.nama || tausiyah.user?.name || 'Anonim'}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
        <motion.div 
          className="text-center mt-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeIn}
        >
        </motion.div>
      </section>

      <footer className="border-t border-white/10 bg-[#0D0D0D] py-12">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={slideInUp}
          >
            <h4 className="font-semibold mb-4 text-white">More on the Blog</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="text-gray-400 hover:text-yellow-400 transition">Dashboard</Link></li>
              <li><Link href="/donasi" className="text-gray-400 hover:text-yellow-400 transition">Donasi Online</Link></li>
              <li><Link href="/keuangan" className="text-gray-400 hover:text-yellow-400 transition">Keuangan</Link></li>
              <li><Link href="/kegiatan" className="text-gray-400 hover:text-yellow-400 transition">Kegiatan Masjid</Link></li>
            </ul>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={slideInUp}
          >
            <h4 className="font-semibold mb-4 text-white">More on Nizam</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-yellow-400 transition">Tentang Kami</Link></li>
              <li><Link href="/team" className="text-gray-400 hover:text-yellow-400 transition">Tim</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-yellow-400 transition">Kontak</Link></li>
            </ul>
          </motion.div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          © 2025 Almasjid.id, Inc. Terms & Privacy
        </div>
      </footer>
    </div>
  );
}