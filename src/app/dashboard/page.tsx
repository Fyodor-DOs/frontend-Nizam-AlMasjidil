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
import { ArrowUpRight, ArrowDownRight, DollarSign, Users, Calendar, Activity, ChevronLeft, ChevronRight, LogOut, Wallet, Users2, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Navbar from '@/components/Navbar';

const images = [
  '/images/masjid4.jpg',
  '/images/masjid2.jpg',
  '/images/masjid3.jpg',
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentKegiatanIndex, setCurrentKegiatanIndex] = useState(0);
  const [keuanganData, setKeuanganData] = useState<any[]>([]);
  const [donasiData, setDonasiData] = useState<any[]>([]);
  const [kegiatanData, setKegiatanData] = useState<any[]>([]);
  const [totalDonasi, setTotalDonasi] = useState<number>(0);
  const [totalSaldo, setTotalSaldo] = useState<number>(0);
  const [totalKegiatan, setTotalKegiatan] = useState<number>(0);
  const [monthlyKeuanganData, setMonthlyKeuanganData] = useState<any[]>([]);
  const [totalJamaah, setTotalJamaah] = useState<number>(0);
  const [donasiChartData, setDonasiChartData] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('role');

    if (!token || !userRole) {
      router.push('/login');
    } else {
      setAuthToken(token);
      setRole(userRole);
      fetchDashboardData();
      fetchUserData();
    }
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      // Fetch keuangan data
      const keuanganResponse = await api.get('/keuangan');
      const keuanganData = keuanganResponse.data;
      setKeuanganData(keuanganData);
      calculateTotalSaldo(keuanganData);
      processMonthlyKeuanganData(keuanganData);

      // Fetch donasi data
      const donasiResponse = await api.get('/donasi');
      const donasiData = donasiResponse.data;
      setDonasiData(donasiData);
      calculateTotalDonasi(donasiData);
      processDonasiData(donasiData);

      // Fetch kegiatan data
      const kegiatanResponse = await api.get('/kegiatan');
      const kegiatanData = kegiatanResponse.data;
      setKegiatanData(kegiatanData);
      setTotalKegiatan(kegiatanData.length);

      // Fetch users data and count jamaah
      const usersResponse = await api.get('/users');
      const jamaahCount = usersResponse.data.filter((user: any) => user.role === 'jamaah').length;
      setTotalJamaah(jamaahCount);
    } catch (err: any) {
      console.error('Dashboard Data Error:', err);
      setError('Gagal mengambil data dashboard');
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await api.get('/user');
      console.log('User data response:', response.data);
      setUser(response.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Gagal mengambil data user');
    }
  };

  const calculateTotalSaldo = (data: any[]) => {
    let total = 0;
    data.forEach((item) => {
      if (item.tipe_keuangan_id === 1) {
        total += parseFloat(item.jumlah);
      } else if (item.tipe_keuangan_id === 2) {
        total -= parseFloat(item.jumlah);
      }
    });
    setTotalSaldo(total);
  };

  const calculateTotalDonasi = (data: any[]) => {
    const total = data.reduce((sum, item) => sum + parseFloat(item.jumlah), 0);
    setTotalDonasi(total);
  };

  const processMonthlyKeuanganData = (data: any[]) => {
    // Group data by month
    const monthlyData = data.reduce((acc: any, item: any) => {
      const date = new Date(item.tanggal);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          pemasukan: 0,
          pengeluaran: 0
        };
      }

      if (item.tipe_keuangan_id === 1) {
        acc[monthYear].pemasukan += parseFloat(item.jumlah);
      } else if (item.tipe_keuangan_id === 2) {
        acc[monthYear].pengeluaran += parseFloat(item.jumlah);
      }

      return acc;
    }, {});

    // Convert to array and sort by month
    const sortedData = Object.values(monthlyData).sort((a: any, b: any) => 
      a.month.localeCompare(b.month)
    );

    // Format month names
    const formattedData = sortedData.map((item: any) => ({
      ...item,
      month: new Date(item.month + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    }));

    setMonthlyKeuanganData(formattedData);
  };

  const processDonasiData = (data: any[]) => {
    // Group donations by payment method
    const groupedData = data.reduce((acc: any, item: any) => {
      const method = item.metode_pembayaran;
      if (!acc[method]) {
        acc[method] = {
          metode_pembayaran: method,
          jumlah: 0
        };
      }
      acc[method].jumlah += parseFloat(item.jumlah);
      return acc;
    }, {});

    // Convert to array for the chart
    const chartData = Object.values(groupedData);
    setDonasiChartData(chartData);
  };

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
      <Navbar role={role} user={user} />

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
                  <h3 className="text-2xl font-bold text-yellow-400">
                    Rp {totalDonasi.toLocaleString('id-ID')}
                  </h3>
                </div>
                <div className="p-3 bg-yellow-400/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Saldo</p>
                  <h3 className="text-2xl font-bold text-green-400">
                    Rp {totalSaldo.toLocaleString('id-ID')}
                  </h3>
                </div>
                <div className="p-3 bg-green-400/10 rounded-full">
                  <Wallet className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Jamaah</p>
                  <h3 className="text-2xl font-bold text-blue-400">{totalJamaah}</h3>
                </div>
                <div className="p-3 bg-blue-400/10 rounded-full">
                  <Users2 className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Kegiatan</p>
                  <h3 className="text-2xl font-bold text-purple-400">{totalKegiatan}</h3>
                </div>
                <div className="p-3 bg-purple-400/10 rounded-full">
                  <Calendar className="h-6 w-6 text-purple-400" />
                </div>
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
                <CardDescription>Grafik pemasukan dan pengeluaran masjid per bulan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyKeuanganData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="month" stroke="#ffffff80" />
                      <YAxis stroke="#ffffff80" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1A1614',
                          border: '1px solid #ffffff20',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="pemasukan" fill="#22C55E" name="Pemasukan" />
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
                <CardTitle>Distribusi Metode Pembayaran</CardTitle>
                <CardDescription>Persentase metode pembayaran yang digunakan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donasiChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="jumlah"
                        label={({ metode_pembayaran, percent }) => 
                          `${metode_pembayaran.charAt(0).toUpperCase() + metode_pembayaran.slice(1)} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {donasiChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1A1614',
                          border: '1px solid #ffffff20',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
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
                      {kegiatan.gambar && (
                        <Image
                          src={`http://localhost:8000/storage/${kegiatan.gambar}`}
                          alt={kegiatan.nama_kegiatan}
                          fill
                          className="object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/60 flex items-center">
                        <div className="w-full max-w-2xl mx-auto px-6">
                          <h3 className="text-3xl font-bold text-yellow-400 mb-4">{kegiatan.nama_kegiatan}</h3>
                          <p className="text-lg text-gray-200 mb-4">{kegiatan.deskripsi}</p>
                          <p className="text-sm text-gray-400 flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {kegiatan.tanggal} - {kegiatan.waktu}
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