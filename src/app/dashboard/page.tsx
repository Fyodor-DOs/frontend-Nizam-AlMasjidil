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
  const [totalJamaah, setTotalJamaah] = useState<number>(0);
  const [donasiChartData, setDonasiChartData] = useState<any[]>([]);
  const [keuanganFilter, setKeuanganFilter] = useState('bulan');
  const [donasiFilter, setDonasiFilter] = useState('bulan');
  const [displayKeuanganData, setDisplayKeuanganData] = useState<any[]>([]);
  const [displayDonasiData, setDisplayDonasiData] = useState<any[]>([]);

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

      // Fetch donasi data
      const donasiResponse = await api.get('/donasi');
      const donasiData = donasiResponse.data;
      setDonasiData(donasiData);
      calculateTotalDonasi(donasiData);

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

  const processAndFormatKeuanganData = (data: any[], filter: string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize 'now' to the start of the day for consistent comparisons

    let groupedData: any = {};
    let dateFormat = '';
    let sortFunc = (a: any, b: any) => a.key.localeCompare(b.key);

    // Filter data based on the selected period
    const filteredData = data.filter(item => {
      const itemDate = new Date(item.tanggal);
      itemDate.setHours(0, 0, 0, 0); // Normalize item date to the start of the day

      switch (filter) {
        case 'minggu':
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay()); // Set to start of current week (Sunday)
          return itemDate >= startOfWeek && itemDate <= now;
        case 'bulan':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          // For 'bulan', include all days in the current month up to the last day of the month
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          endOfMonth.setHours(23, 59, 59, 999); // Set to end of the last day
          return itemDate >= startOfMonth && itemDate <= endOfMonth;
        case 'tahun':
          const startOfYear = new Date(now.getFullYear(), 0, 1);
           const endOfYear = new Date(now.getFullYear(), 11, 31);
           endOfYear.setHours(23, 59, 59, 999);
          return itemDate >= startOfYear && itemDate <= endOfYear;
        default:
           // Default to 'bulan' filter if none specified or recognized
          const defaultStartOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const defaultEndOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          defaultEndOfMonth.setHours(23, 59, 59, 999);
          return itemDate >= defaultStartOfMonth && itemDate <= defaultEndOfMonth;
      }
    });

    // Now process the filtered data based on the filter granularity
    switch (filter) {
      case 'minggu':
        dateFormat = 'EEE'; // Abbreviated weekday name
        // Order days of the week correctly (Mon to Sun for example, adjust if needed for locale)
        const dayOrder = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']; // Abbreviated names
        sortFunc = (a: any, b: any) => dayOrder.indexOf(a.key) - dayOrder.indexOf(b.key);
         // Initialize all days of the week to 0
         for(let i = 0; i < 7; i++){
           const date = new Date(now);
           date.setDate(now.getDate() - now.getDay() + i);
           const key = date.toLocaleDateString('id-ID', { weekday: 'short' });
           groupedData[key] = { key: key, pemasukan: 0, pengeluaran: 0 };
         }
        filteredData.forEach(item => {
          const date = new Date(item.tanggal);
          const key = date.toLocaleDateString('id-ID', { weekday: 'short' });
           if (groupedData[key]) { // Ensure key exists (it should from initialization)
             if (item.tipe_keuangan_id === 1) {
               groupedData[key].pemasukan += parseFloat(item.jumlah);
             } else if (item.tipe_keuangan_id === 2) {
               groupedData[key].pengeluaran += parseFloat(item.jumlah);
             }
           }
        });
        break;
      case 'bulan':
        // Group by day of the month
        sortFunc = (a: any, b: any) => parseInt(a.key) - parseInt(b.key);
         // Initialize all days of the month to 0 for the current month
         const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
         for(let i = 1; i <= daysInMonth; i++){
           groupedData[i.toString()] = { key: i.toString(), pemasukan: 0, pengeluaran: 0 };
         }
        filteredData.forEach(item => {
          const date = new Date(item.tanggal);
          const key = date.getDate().toString(); // Day of the month as key
           if (groupedData[key]) { // Ensure key exists
             if (item.tipe_keuangan_id === 1) {
               groupedData[key].pemasukan += parseFloat(item.jumlah);
             } else if (item.tipe_keuangan_id === 2) {
               groupedData[key].pengeluaran += parseFloat(item.jumlah);
             }
           }
        });
        break;
      case 'tahun':
        // Group by month
        sortFunc = (a: any, b: any) => new Date(a.key + ' 1, ' + now.getFullYear()).getMonth() - new Date(b.key + ' 1, ' + now.getFullYear()).getMonth();
         // Initialize all 12 months to 0
         const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
         monthNames.forEach(month => {
           groupedData[month] = { key: month, pemasukan: 0, pengeluaran: 0 };
         });
        filteredData.forEach(item => {
          const date = new Date(item.tanggal);
           const key = date.toLocaleDateString('id-ID', { month: 'long' });
           if (groupedData[key]) { // Ensure key exists
             if (item.tipe_keuangan_id === 1) {
               groupedData[key].pemasukan += parseFloat(item.jumlah);
             } else if (item.tipe_keuangan_id === 2) {
               groupedData[key].pengeluaran += parseFloat(item.jumlah);
             }
           }
        });
        break;
      default:
        // Default processing if filter is not minggu, bulan, or tahun
         const defaultMonthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
         defaultMonthNames.forEach(month => {
           groupedData[month] = { key: month, pemasukan: 0, pengeluaran: 0 };
         });
          filteredData.forEach(item => {
            const date = new Date(item.tanggal);
            const key = date.toLocaleDateString('id-ID', { month: 'long' });
             if (groupedData[key]) {
               if (item.tipe_keuangan_id === 1) {
                 groupedData[key].pemasukan += parseFloat(item.jumlah);
               } else if (item.tipe_keuangan_id === 2) {
                 groupedData[key].pengeluaran += parseFloat(item.jumlah);
               }
             }
          });
         sortFunc = (a: any, b: any) => new Date(a.key + ' 1, ' + now.getFullYear()).getMonth() - new Date(b.key + ' 1, ' + now.getFullYear()).getMonth();
        break;

      }

      const formattedData = Object.values(groupedData).sort(sortFunc);
      setDisplayKeuanganData(formattedData);
    };

   const processAndFormatDonasiData = (data: any[], filter: string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize 'now' to the start of the day for consistent comparisons

    // Filter data based on the selected period
    const filteredData = data.filter(item => {
      const itemDate = new Date(item.tanggal);
      itemDate.setHours(0, 0, 0, 0); // Normalize item date to the start of the day

      switch (filter) {
        case 'minggu':
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          return itemDate >= startOfWeek && itemDate <= now;
        case 'bulan':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          endOfMonth.setHours(23, 59, 59, 999);
          return itemDate >= startOfMonth && itemDate <= endOfMonth;
        case 'tahun':
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          const endOfYear = new Date(now.getFullYear(), 11, 31);
          endOfYear.setHours(23, 59, 59, 999);
          return itemDate >= startOfYear && itemDate <= endOfYear;
        default:
          // Default to 'bulan' filter
          const defaultStartOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const defaultEndOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          defaultEndOfMonth.setHours(23, 59, 59, 999);
          return itemDate >= defaultStartOfMonth && itemDate <= defaultEndOfMonth;
      }
    });

    // Group filtered data by payment method
    const groupedData = filteredData.reduce((acc: any, item: any) => {
      const method = item.metode_pembayaran;
      if (!acc[method]) {
        acc[method] = {
          metode_pembayaran: method, // Keep original key name for the pie chart label
          jumlah: 0
        };
      }
      acc[method].jumlah += parseFloat(item.jumlah);
      return acc;
    }, {});

    // Convert to array for the chart
    const chartData = Object.values(groupedData);
    setDisplayDonasiData(chartData);
   };

  useEffect(() => {
    if (keuanganData.length > 0) {
      processAndFormatKeuanganData(keuanganData, keuanganFilter);
    }
  }, [keuanganFilter, keuanganData]);

  useEffect(() => {
    if (donasiData.length > 0) {
      processAndFormatDonasiData(donasiData, donasiFilter);
    }
  }, [donasiFilter, donasiData]);

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
      <section className="relative h-[300px] w-full rounded-lg overflow-hidden shadow-xl mx-auto max-w-6xl mt-6 mb-8">
        {images.map((imageUrl, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            style={{ backgroundImage: `url('${imageUrl}')`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}
          >
            <div className="absolute inset-0 bg-black/60 flex items-center justify-between px-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-yellow-400 leading-tight tracking-wider drop-shadow-lg">Selamat Datang di <br /> AlMasjid Digital</h2>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="bg-white/10 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">Tanggal</p>
                  <p className="text-white font-semibold">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">Waktu</p>
                  <p className="text-white font-semibold">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
          </div>
        ))}
      </section>

      {/* Quick Stats */}
      <section className="w-full max-w-6xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Total Donasi</p>
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

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Total Saldo</p>
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

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Total Jamaah</p>
                  <h3 className="text-2xl font-bold text-blue-400">{totalJamaah}</h3>
                </div>
                <div className="p-3 bg-blue-400/10 rounded-full">
                  <Users2 className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Total Kegiatan</p>
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
      <section className="w-full max-w-6xl mx-auto mb-8 ">
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Laporan Keuangan</CardTitle>
                  <CardDescription className="text-gray-300">Grafik pemasukan dan pengeluaran masjid</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-gray-300 hover:text-white">
                      {keuanganFilter === 'minggu' ? 'Minggu Ini' :
                       keuanganFilter === 'bulan' ? 'Bulan Ini' : 'Tahun Ini'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#1E1E1E] border-white/10">
                    <DropdownMenuItem
                      className="text-gray-300 hover:bg-[#2A2A2A]"
                      onClick={() => setKeuanganFilter('minggu')}
                    >
                      Minggu Ini
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-gray-300 hover:bg-[#2A2A2A]"
                      onClick={() => setKeuanganFilter('bulan')}
                    >
                      Bulan Ini
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-gray-300 hover:bg-[#2A2A2A]"
                      onClick={() => setKeuanganFilter('tahun')}
                    >
                      Tahun Ini
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayKeuanganData} barSize={35} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis
                      dataKey="key"
                      stroke="#ffffff"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#ffffff"
                      tickFormatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                      tick={{ fontSize: 11 }}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#2A2A2A',
                        border: '1px solid #ffffff10',
                        borderRadius: '8px',
                        color: '#ffffff',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                      formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
                    />
                    <Bar dataKey="pemasukan" fill="#22C55E" name="Pemasukan" radius={[4, 4, 0, 0]} activeBar={{ fill: '#3CB371' }} />
                    <Bar dataKey="pengeluaran" fill="#EF4444" name="Pengeluaran" radius={[4, 4, 0, 0]} activeBar={{ fill: '#FA8072' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Distribusi Donasi</CardTitle>
                  <CardDescription className="text-gray-300">Metode pembayaran yang digunakan</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-gray-300 hover:text-white">
                      {donasiFilter === 'minggu' ? 'Minggu Ini' :
                       donasiFilter === 'bulan' ? 'Bulan Ini' : 'Tahun Ini'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#1E1E1E] border-white/10">
                    <DropdownMenuItem
                      className="text-gray-300 hover:bg-[#2A2A2A]"
                      onClick={() => setDonasiFilter('minggu')}
                    >
                      Minggu Ini
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-gray-300 hover:bg-[#2A2A2A]"
                      onClick={() => setDonasiFilter('bulan')}
                    >
                      Bulan Ini
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-gray-300 hover:bg-[#2A2A2A]"
                      onClick={() => setDonasiFilter('tahun')}
                    >
                      Tahun Ini
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayDonasiData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="jumlah"
                      label={({ metode_pembayaran, percent }) =>
                        `${metode_pembayaran.charAt(0).toUpperCase() + metode_pembayaran.slice(1)} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {displayDonasiData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#2A2A2A',
                        border: '1px solid #ffffff10',
                        borderRadius: '8px',
                        color: '#ffffff',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                      formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Activities and Upcoming Events */}
      <section className="w-full max-w-6xl mx-auto mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Aktivitas Keuangan</CardTitle>
              <CardDescription className="text-gray-300">Riwayat transaksi keuangan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {[...keuanganData].reverse().slice(0, 20).map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <div className={`p-2 rounded-full ${item.tipe_keuangan_id === 1 ? 'bg-green-400/10' : 'bg-red-400/10'}`}>
                      {item.tipe_keuangan_id === 1 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-400" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        {item.tipe_keuangan_id === 1 ? 'Pemasukan' : 'Pengeluaran'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Rp {parseFloat(item.jumlah).toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {item.tipe_keuangan_id === 1 ? (
                          <>
                            {item.keterangan && (
                              <>
                                <span className="text-gray-300">Dari: </span>
                                {item.keterangan}
                                {(item.user?.name || item.metode_pembayaran) && <span className="text-gray-300 ml-2">| </span>}
                              </>
                            )}
                            {item.user?.name && (
                              <>
                                <span className="text-gray-300">User: </span>
                                {item.user.name}
                              </>
                            )}
                            {item.metode_pembayaran && (
                              <>
                                {item.user?.name && <span className="text-gray-300 ml-2">| </span>}
                                <span className="text-gray-300">Metode: </span>
                                {item.metode_pembayaran}
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="text-gray-300">Untuk: </span>
                            {item.keterangan || 'Tidak disebutkan'}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Kegiatan Masjid</CardTitle>
              <CardDescription className="text-gray-300">Riwayat kegiatan masjid</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {[...kegiatanData].reverse().map((kegiatan, index) => (
                  <div key={kegiatan.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="p-2 rounded-full bg-purple-400/10">
                      <Calendar className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{kegiatan.nama_kegiatan}</p>
                      <p className="text-xs text-gray-400 mt-1">{kegiatan.tanggal} - {kegiatan.waktu}</p>
                      {kegiatan.keterangan && (
                        <p className="text-xs text-gray-400 mt-1">
                          <span className="text-gray-300">Keterangan: </span>
                          {kegiatan.keterangan}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1614] border-t border-white/10 py-6 text-center text-gray-400 mt-20">
        &copy; {new Date().getFullYear()} AlMasjid Digital. All rights reserved.
      </footer>
    </div>
  );
};

export default Dashboard;