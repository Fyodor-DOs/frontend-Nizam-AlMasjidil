'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-[#1A1614] text-white font-sans">
      {/* Header transparan */}
      <header className="absolute top-0 left-0 w-full z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-white">
            AlMasjid Digital
          </Link>
          <nav className="space-x-6 hidden md:flex">
            <Link href="#kelas" className="text-gray-200 hover:text-yellow-400">Kelas</Link>
            <Link href="#kajian" className="text-gray-200 hover:text-yellow-400">Kajian</Link>
            <Link href="#komunitas" className="text-gray-200 hover:text-yellow-400">Komunitas</Link>
            <Link href="/login" className="bg-yellow-400 text-black px-4 py-2 rounded-full hover:bg-yellow-300 font-medium">
              Masuk
            </Link>
          </nav>
          {/* Tombol login mobile */}
          <Link href="/login" className="md:hidden text-sm bg-yellow-400 text-black px-3 py-1 rounded-full">
            Masuk
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative h-[90vh] bg-cover bg-no-repeat flex items-center justify-center text-center px-4"
        style={{
          backgroundImage: "url('/images/masjid.jpg')",
          backgroundPosition: 'center top 30%',
          backgroundSize: 'cover',
        }}
      >
        {/* Overlay Gradasi */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#1A1614]"></div>

        {/* Konten Hero */}
        <div className="relative z-10 max-w-3xl pt-20">
          <h3 className="text-sm uppercase tracking-widest text-gray-300 mb-2">
            A Digital Masjid
          </h3>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Nizam AlMasjidil Digital
          </h1>
          <p className="text-gray-300 mb-6">
            Transformasi Digital Masjid: Layanan Manajemen Keuangan, Kegiatan,
            Jamaah, Donasi, dan Informasi Terintegrasi.
          </p>
          <Link href="/login">
            <button className="bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-gray-200">
              Buat Akun
            </button>
          </Link>
        </div>
      </section>

      {/* Feature Section */}
      <section className="max-w-6xl mx-auto py-20 px-4 space-y-20">
        {[1, 2, 3].map((num) => (
          <div
            key={num}
            id={num === 1 ? 'kelas' : num === 2 ? 'kajian' : 'komunitas'}
            className={`grid md:grid-cols-2 gap-8 items-center ${
              num % 2 === 0 ? 'md:flex-row-reverse' : ''
            }`}
          >
            <div className="relative">
              <span className="absolute -top-10 left-0 text-[120px] text-gray-700 opacity-10 font-bold">
                0{num}
              </span>
              <h2 className="text-3xl font-bold mb-4">
                {num === 1
                  ? 'Kelas'
                  : num === 2
                  ? 'Kajian'
                  : 'Komunitas'}
              </h2>
              <p className="text-gray-400 mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                feugiat, nisl vel tincidunt malesuada, nunc sapien tempus nulla,
                in viverra justo libero in sapien.
              </p>
              <Link href={`/fitur${num}`} className="text-yellow-400 hover:underline">
                Selengkapnya →
              </Link>
            </div>
            <div className="w-full h-72 relative rounded-lg overflow-hidden">
              <Image
                src="/images/sholat.jpg"
                alt={`Feature ${num}`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="bg-[#0D0D0D] py-12 text-gray-400 text-sm">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-white font-semibold mb-4">More on the Blog</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-yellow-400">Management System</Link></li>
              <li><Link href="#" className="hover:text-yellow-400">Kegiatan Masjid</Link></li>
              <li><Link href="#" className="hover:text-yellow-400">Donasi Online</Link></li>
              <li><Link href="#" className="hover:text-yellow-400">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">More on Nizam</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-yellow-400">Tentang Kami</Link></li>
              <li><Link href="#" className="hover:text-yellow-400">Tim</Link></li>
              <li><Link href="#" className="hover:text-yellow-400">Kontak</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600 text-xs">
          © 2025 Almasjid.id, Inc. Terms & Privacy
        </div>
      </footer>
    </div>
  );
}
