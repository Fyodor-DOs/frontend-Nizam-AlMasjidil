'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api, { setAuthToken } from '@/utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, Users, Calendar, Activity, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

const images = [
  '/images/masjid4.jpg',
  '/images/masjid2.jpg',
  '/images/masjid3.jpg',
];

// Sample data for charts
const monthlyData = [
  { name: 'Jan', pemasukan: 4000, pengeluaran: 2400 },
  { name: 'Feb', pemasukan: 3000, pengeluaran: 1398 },
  { name: 'Mar', pemasukan: 2000, pengeluaran: 9800 },
  { name: 'Apr', pemasukan: 2780, pengeluaran: 3908 },
  { name: 'Mei', pemasukan: 1890, pengeluaran: 4800 },
  { name: 'Jun', pemasukan: 2390, pengeluaran: 3800 },
];

const donasiData = [
  { name: 'Zakat', value: 400 },
  { name: 'Infaq', value: 300 },
  { name: 'Wakaf', value: 300 },
  { name: 'Sumbangan', value: 200 },
];

const kegiatanData = [
  {
    id: 1,
    title: "Kajian Rutin",
    description: "Kajian rutin setiap Jumat malam bersama Ustadz Ahmad",
    image: "/images/masjid4.jpg",
    date: "Setiap Jumat, 19:00 WIB"
  },
  {
    id: 2,
    title: "Tahsin Al-Quran",
    description: "Program belajar membaca Al-Quran dengan tajwid yang benar",
    image: "/images/masjid2.jpg",
    date: "Setiap Sabtu, 08:00 WIB"
  },
  {
    id: 3,
    title: "Buka Puasa Bersama",
    description: "Acara buka puasa bersama jamaah masjid",
    image: "/images/masjid3.jpg",
    date: "Setiap hari selama Ramadhan"
  }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentKegiatanIndex, setCurrentKegiatanIndex] = useState(0);

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
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('role');
    router.push('/login');
  };

  const nextKegiatan = () => {
    setCurrentKegiatanIndex((prev) => (prev + 1) % kegiatanData.length);
  };

  const prevKegiatan = () => {
    setCurrentKegiatanIndex((prev) => (prev - 1 + kegiatanData.length) % kegiatanData.length);
  };

  return (
    <div className="bg-[#1A1614] text-white min-h-screen flex flex-col font-sans antialiased">
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
            {role === 'admin' && (
              <Link href="/users" className="text-gray-300 hover:text-yellow-400 transition">Kelola User</Link>
            )}
            <Button
              variant="ghost"
              size="default"
              className="text-gray-300 hover:text-red-400 hover:bg-red-400/10 transition flex items-center gap-2 px-4 py-2 text-base font-normal"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </nav>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="bg-[#1A1614] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-yellow-400">Konfirmasi Logout</DialogTitle>
            <DialogDescription className="text-gray-400">
              Apakah Anda yakin ingin keluar dari sistem?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setShowLogoutDialog(false)}
              className="text-gray-300 hover:text-white hover:bg-white/10"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleLogout();
                setShowLogoutDialog(false);
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Quick Stats */}
      <section className="w-full max-w-6xl mx-auto mt-8 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Donasi</p>
                  <h3 className="text-2xl font-bold text-yellow-400">Rp 15.4M</h3>
                </div>
                <div className="p-3 bg-yellow-400/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <ArrowUpRight className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400 ml-1">+12.5%</span>
                <span className="text-sm text-gray-400 ml-2">dari bulan lalu</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Jamaah</p>
                  <h3 className="text-2xl font-bold text-green-400">1,234</h3>
                </div>
                <div className="p-3 bg-green-400/10 rounded-full">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <ArrowUpRight className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400 ml-1">+8.2%</span>
                <span className="text-sm text-gray-400 ml-2">dari bulan lalu</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Kegiatan Bulan Ini</p>
                  <h3 className="text-2xl font-bold text-blue-400">24</h3>
                </div>
                <div className="p-3 bg-blue-400/10 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <ArrowDownRight className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-400 ml-1">-2.4%</span>
                <span className="text-sm text-gray-400 ml-2">dari bulan lalu</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pengeluaran</p>
                  <h3 className="text-2xl font-bold text-purple-400">Rp 8.2M</h3>
                </div>
                <div className="p-3 bg-purple-400/10 rounded-full">
                  <Activity className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <ArrowDownRight className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-400 ml-1">-3.1%</span>
                <span className="text-sm text-gray-400 ml-2">dari bulan lalu</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Charts Section */}
      <section className="w-full max-w-6xl mx-auto mt-8 px-6">
        <Tabs defaultValue="keuangan" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5">
            <TabsTrigger value="keuangan" className="data-[state=active]:bg-white/10">Keuangan</TabsTrigger>
            <TabsTrigger value="donasi" className="data-[state=active]:bg-white/10">Donasi</TabsTrigger>
          </TabsList>
          
          <TabsContent value="keuangan">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Laporan Keuangan Bulanan</CardTitle>
                <CardDescription>Grafik pemasukan dan pengeluaran masjid</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="name" stroke="#ffffff80" />
                      <YAxis stroke="#ffffff80" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1A1614',
                          border: '1px solid #ffffff20',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="pemasukan" fill="#FCD34D" name="Pemasukan" />
                      <Bar dataKey="pengeluaran" fill="#EF4444" name="Pengeluaran" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donasi">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Distribusi Donasi</CardTitle>
                <CardDescription>Persentase jenis donasi yang diterima</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donasiData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {donasiData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1A1614',
                          border: '1px solid #ffffff20',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Kegiatan Carousel */}
      <section className="w-full max-w-6xl mx-auto mt-8 px-6 mb-20">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle>Kegiatan Masjid</CardTitle>
            <CardDescription>Jadwal dan informasi kegiatan terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                {kegiatanData.map((kegiatan, index) => (
                  <div
                    key={kegiatan.id}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === currentKegiatanIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  >
                    <div className="relative h-full">
                      <Image
                        src={kegiatan.image}
                        alt={kegiatan.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 flex items-center">
                        <div className="w-full max-w-2xl mx-auto px-6">
                          <h3 className="text-3xl font-bold text-yellow-400 mb-4">{kegiatan.title}</h3>
                          <p className="text-lg text-gray-200 mb-4">{kegiatan.description}</p>
                          <p className="text-sm text-gray-400 flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {kegiatan.date}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Navigation Buttons */}
              <button
                onClick={prevKegiatan}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-20 transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextKegiatan}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-20 transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                {kegiatanData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentKegiatanIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentKegiatanIndex ? 'bg-yellow-400' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1614] border-t border-white/10 py-6 text-center text-gray-400 mt-20">
        &copy; {new Date().getFullYear()} AlMasjid Digital. All rights reserved.
      </footer>
    </div>
  );
};

export default Dashboard;