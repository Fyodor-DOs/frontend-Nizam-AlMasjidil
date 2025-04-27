'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black">
      <h1 className="text-4xl font-bold mb-4">Selamat Datang di Platform</h1>
      <p className="text-xl mb-6">Aplikasi untuk pengelolaan tempat ibadah.</p>
      <Link
        href="/login"
        className="px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded hover:bg-blue-600 transition"
      >
        Login
      </Link>
    </div>
  );
}
