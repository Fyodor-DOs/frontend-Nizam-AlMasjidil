'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '@/utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, Calendar, Wallet, } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const images = [
  '/images/masjid4.jpg',
  '/images/masjid2.jpg',
  '/images/masjid3.jpg',
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

const chartVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.7, delay: 0.3, ease: 'easeInOut' } },
};

const listItemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 0.1 * index, ease: 'easeInOut' },
  }),
};

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
  const [donasiChartData, setDonasiChartData] = useState<any[]>([]); // This state is declared but not used for pie chart data. It should be displayDonasiData.
  const [keuanganFilter, setKeuanganFilter] = useState('tahun');
  const [donasiFilter, setDonasiFilter] = useState('tahun');
  const [displayKeuanganData, setDisplayKeuanganData] = useState<any[]>([]);
  const [displayDonasiData, setDisplayDonasiData] = useState<any[]>([]);
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState('Malang'); // Default to Malang
  const [selectedKegiatan, setSelectedKegiatan] = useState<any>(null);
  const [showKegiatanDialog, setShowKegiatanDialog] = useState(false);

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
      // Initial fetch prayer times with default city
      fetchPrayerTimes();
    }
  }, [router]);

  useEffect(() => {
    // Re-fetch prayer times when selectedCity changes
    fetchPrayerTimes();
  }, [selectedCity]);

  const fetchDashboardData = async () => {
    try {
      const keuanganResponse = await api.get('/keuangan');
      const keuanganData = keuanganResponse.data;
      setKeuanganData(keuanganData);
      calculateTotalSaldo(keuanganData);

      const donasiResponse = await api.get('/donasi');
      const donasiData = donasiResponse.data;
      setDonasiData(donasiData);
      calculateTotalDonasi(donasiData);

      const kegiatanResponse = await api.get('/kegiatan');
      const kegiatanData = kegiatanResponse.data;
      setKegiatanData(kegiatanData);
      setTotalKegiatan(kegiatanData.length);
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

  const fetchPrayerTimes = async () => {
    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${selectedCity}&country=Indonesia&method=11`
      );

      const data = await response.json();
      if (data.code === 200) {
        setPrayerTimes(data.data.timings);
      } else {
        setError('Gagal mengambil jadwal sholat');
      }
    } catch (err) {
      console.error('Error fetching prayer times:', err);
      setError('Terjadi kesalahan saat mengambil jadwal sholat');
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
    now.setHours(0, 0, 0, 0);

    let groupedData: any = {};
    let dateFormat = '';
    let sortFunc = (a: any, b: any) => a.key.localeCompare(b.key);


    const filteredData = data.filter(item => {
      const itemDate = new Date(item.tanggal);
      itemDate.setHours(0, 0, 0, 0);

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
          const defaultStartOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const defaultEndOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          defaultEndOfMonth.setHours(23, 59, 59, 999);
          return itemDate >= defaultStartOfMonth && itemDate <= defaultEndOfMonth;
      }
    });

    switch (filter) {
      case 'minggu':
        dateFormat = 'EEE';
        const dayOrder = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        sortFunc = (a: any, b: any) => dayOrder.indexOf(a.key) - dayOrder.indexOf(b.key);
        for(let i = 0; i < 7; i++){
          const date = new Date(now);
          date.setDate(now.getDate() - now.getDay() + i);
          const key = date.toLocaleDateString('id-ID', { weekday: 'short' });
          groupedData[`${key}`] = { key: key, pemasukan: 0, pengeluaran: 0 };
        }
        filteredData.forEach(item => {
          const date = new Date(item.tanggal);
          const key = date.toLocaleDateString('id-ID', { weekday: 'short' });
          if (groupedData[`${key}`]) {
            if (item.tipe_keuangan_id === 1) {
              groupedData[`${key}`].pemasukan += parseFloat(item.jumlah);
            } else if (item.tipe_keuangan_id === 2) {
              groupedData[`${key}`].pengeluaran += parseFloat(item.jumlah);
            }
          }
        });
        break;
      case 'bulan':
        sortFunc = (a: any, b: any) => parseInt(a.key) - parseInt(b.key);
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        for(let i = 1; i <= daysInMonth; i++){
          groupedData[`${i}`] = { key: i.toString(), pemasukan: 0, pengeluaran: 0 };
        }
        filteredData.forEach(item => {
          const date = new Date(item.tanggal);
          const key = date.getDate().toString();
          if (groupedData[`${key}`]) {
            if (item.tipe_keuangan_id === 1) {
              groupedData[`${key}`].pemasukan += parseFloat(item.jumlah);
            } else if (item.tipe_keuangan_id === 2) {
              groupedData[`${key}`].pengeluaran += parseFloat(item.jumlah);
            }
          }
        });
        break;
      case 'tahun':
        sortFunc = (a: any, b: any) => new Date(a.key + ' 1, ' + now.getFullYear()).getMonth() - new Date(b.key + ' 1, ' + now.getFullYear()).getMonth();

        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        monthNames.forEach(month => {
          groupedData[`${month}`] = { key: month, pemasukan: 0, pengeluaran: 0 };
        });
        filteredData.forEach(item => {
          const date = new Date(item.tanggal);
          const key = date.toLocaleDateString('id-ID', { month: 'long' });
          if (groupedData[`${key}`]) {
            if (item.tipe_keuangan_id === 1) {
              groupedData[`${key}`].pemasukan += parseFloat(item.jumlah);
            } else if (item.tipe_keuangan_id === 2) {
              groupedData[`${key}`].pengeluaran += parseFloat(item.jumlah);
            }
          }
        });
        break;
      default: // default to month for initial load if no filter is set
        const defaultMonthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        defaultMonthNames.forEach(month => {
          groupedData[`${month}`] = { key: month, pemasukan: 0, pengeluaran: 0 };
        });
        filteredData.forEach(item => {
          const date = new Date(item.tanggal);
          const key = date.toLocaleDateString('id-ID', { month: 'long' });
          if (groupedData[`${key}`]) {
            if (item.tipe_keuangan_id === 1) {
              groupedData[`${key}`].pemasukan += parseFloat(item.jumlah);
            } else if (item.tipe_keuangan_id === 2) {
              groupedData[`${key}`].pengeluaran += parseFloat(item.jumlah);
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
    now.setHours(0, 0, 0, 0);

    const filteredData = data.filter(item => {
      const itemDate = new Date(item.tanggal);
      itemDate.setHours(0, 0, 0, 0);

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
        default: // default to month for initial load if no filter is set
          const defaultStartOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const defaultEndOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          defaultEndOfMonth.setHours(23, 59, 59, 999);
          return itemDate >= defaultStartOfMonth && itemDate <= defaultEndOfMonth;
      }
    });

    const groupedData = filteredData.reduce((acc: any, item: any) => {
      const method = item.metode_pembayaran;
      if (!acc[`${method}`]) {
        acc[`${method}`] = {
          metode_pembayaran: method,
          jumlah: 0
        };
      }
      acc[`${method}`].jumlah += parseFloat(item.jumlah);
      return acc;
    }, {});

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

  const handleKegiatanClick = (kegiatan: any) => {
    setSelectedKegiatan(kegiatan);
    setShowKegiatanDialog(true);
  };

  return (
    <div // Changed from motion.div to div
      className="bg-[#1A1614] text-white min-h-screen flex flex-col font-sans antialiased"
      // Removed initial and animate props
    >
      <Navbar role={role} user={user} />
      <div className="h-20" />
      <section className="relative h-[300px] w-full rounded-lg overflow-hidden shadow-xl mx-auto max-w-6xl mt-6 mb-8">
        <AnimatePresence>
          {images.map((imageUrl, index) => (
            <motion.div
              key={imageUrl}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              style={{ backgroundImage: `url('${imageUrl}')`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
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
            </motion.div>
          ))}
        </AnimatePresence>
      </section>

      {/* Quick Stats */}
      <motion.section
        className="w-full max-w-6xl mx-auto mb-8"
        initial="initial"
        animate="animate"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1, // Stagger animation for children cards
            },
          },
        }}
      >
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="bg-white/5 border-white/10 transition-all duration-300 cursor-pointer">
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
          </motion.div>
          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="bg-white/5 border-white/10 transition-all duration-300 cursor-pointer">
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
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="bg-white/5 border-white/10 transition-all duration-300 cursor-pointer">
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
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Charts Section */}
      <motion.section
        className="w-full max-w-6xl mx-auto mb-8 "
        initial="initial"
        animate="animate"
        variants={chartVariants} // Applies to the whole section for a unified entrance
      >
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
                    <Button variant="outline" className="bg-[#1E1E1E] border-white/10 text-white hover:bg-white/10 hover:text-white">
                      {keuanganFilter === 'minggu' ? 'Minggu Ini' :
                        keuanganFilter === 'bulan' ? 'Bulan Ini' : 'Tahun Ini'}
                      <svg
                        className="ml-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#1E1E1E] border-white/10">
                    <DropdownMenuItem
                      className="text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer"
                      onClick={() => setKeuanganFilter('minggu')}
                    >
                      Minggu Ini
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer"
                      onClick={() => setKeuanganFilter('bulan')}
                    >
                      Bulan Ini
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer"
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
                {displayKeuanganData.length > 0 ? (
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
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Tidak ada data keuangan untuk periode ini
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Grouped for staggered animation */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Jadwal Sholat Hari Ini</CardTitle>
                <CardDescription className="text-gray-300">Waktu sholat untuk hari ini</CardDescription>
                <div className="mt-4">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full p-2 rounded-lg bg-[#1E1E1E] text-white border border-white/10 focus:border-yellow-400 focus:outline-none"
                  >
                    {cities.map((city) => (
                      <option key={city.value} value={city.value}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <motion.div layout className="space-y-3">
                  {Object.entries(prayerTimes || {}).map(([key, value]) => {
                    const prayerName = {
                      Imsak: 'Imsak',
                      Fajr: 'Subuh',
                      Dhuhr: 'Dzuhur',
                      Asr: 'Ashar',
                      Maghrib: 'Maghrib',
                      Isha: 'Isya',
                    }[key];
                    const prayerIcon = {
                      Imsak: '⏰',
                      Fajr: '🌅',
                      Dhuhr: '☀️',
                      Asr: '🌤️',
                      Maghrib: '🌅',
                      Isha: '🌙',
                    }[key];

                    return prayerName ? (
                      <motion.div
                        key={key}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300"
                        variants={listItemVariants}
                        initial="initial"
                        animate="animate"
                        custom={Object.keys(prayerTimes).indexOf(key)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{prayerIcon}</span>
                          <span className="text-white">{prayerName}</span>
                        </div>
                        <span className="text-yellow-400 font-semibold">{value as string}</span>
                      </motion.div>
                    ) : null;
                  })}
                </motion.div>
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
                      <Button variant="outline" className="bg-[#1E1E1E] border-white/10 text-white hover:bg-white/10 hover:text-white">
                        {donasiFilter === 'minggu' ? 'Minggu Ini' :
                          donasiFilter === 'bulan' ? 'Bulan Ini' : 'Tahun Ini'}
                        <svg
                          className="ml-2 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#1E1E1E] border-white/10">
                      <DropdownMenuItem
                        className="text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer"
                        onClick={() => setDonasiFilter('minggu')}
                      >
                        Minggu Ini
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer"
                        onClick={() => setDonasiFilter('bulan')}
                      >
                        Bulan Ini
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer"
                        onClick={() => setDonasiFilter('tahun')}
                      >
                        Tahun Ini
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px]">
                  {displayDonasiData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={displayDonasiData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="jumlah"
                          isAnimationActive={true}
                          label={({ metode_pembayaran, percent }) =>
                            `${metode_pembayaran.charAt(0).toUpperCase() + metode_pembayaran.slice(1)} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {displayDonasiData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      Tidak ada data donasi untuk periode ini
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.section>

      <section className="w-full max-w-6xl mx-auto mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Aktivitas Keuangan</CardTitle>
              <CardDescription className="text-gray-300">Riwayat transaksi keuangan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                <AnimatePresence mode="popLayout">
                  {[...keuanganData].reverse().slice(0, 20).map((item, index) => (
                    <motion.div
                      key={item.id || `keuangan-${index}`} // Use a unique ID if available, fallback to index
                      className="flex items-start space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.3, delay: index * 0.05 } }}
                      exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                      layout
                    >
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
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Kegiatan Mendatang</CardTitle>
              <CardDescription className="text-gray-300">Jadwal kegiatan terdekat</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {kegiatanData
                    .filter(kegiatan => {
                      const kegiatanDate = new Date(`${kegiatan.tanggal} ${kegiatan.waktu}`);
                      const now = new Date();
                      return kegiatanDate > now;
                    })
                    .slice(0, 5)
                    .map((kegiatan, index) => (
                    <motion.div
                      key={kegiatan.id || `kegiatan-${index}`}
                      className="flex items-start space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.3, delay: index * 0.05 } }}
                      exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                      layout
                      onClick={() => handleKegiatanClick(kegiatan)}
                    >
                      <div className="p-2 rounded-full bg-purple-400/10">
                        <Calendar className="h-4 w-4 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{kegiatan.nama_kegiatan}</p>
                        <p className="text-xs text-gray-400 mt-1">{kegiatan.tanggal} - {kegiatan.waktu}</p>
                      </div>
                    </motion.div>
                  ))}
                  {kegiatanData.filter(kegiatan => {
                    const kegiatanDate = new Date(`${kegiatan.tanggal} ${kegiatan.waktu}`);
                    const now = new Date();
                    return kegiatanDate > now;
                  }).length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-400 text-sm">Tidak ada kegiatan mendatang</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Dialog open={showKegiatanDialog} onOpenChange={setShowKegiatanDialog}>
        <DialogContent className="bg-[#1E1E1E] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Detail Kegiatan</DialogTitle>
            <DialogDescription className="text-gray-400">
              Informasi lengkap tentang kegiatan
            </DialogDescription>
          </DialogHeader>
          {selectedKegiatan && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Nama Kegiatan</Label>
                <Input
                  value={selectedKegiatan.nama_kegiatan}
                  disabled
                  className="bg-[#2A2A2A] border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Tanggal</Label>
                <Input
                  value={selectedKegiatan.tanggal}
                  disabled
                  className="bg-[#2A2A2A] border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Waktu</Label>
                <Input
                  value={selectedKegiatan.waktu}
                  disabled
                  className="bg-[#2A2A2A] border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Lokasi</Label>
                <Input
                  value={selectedKegiatan.lokasi || '-'}
                  disabled
                  className="bg-[#2A2A2A] border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Deskripsi</Label>
                <div className="p-3 bg-[#2A2A2A] border border-white/10 rounded-md text-gray-300 min-h-[100px]">
                  {selectedKegiatan.deskripsi || '-'}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <footer className="bg-[#1A1614] border-t border-white/10 py-6 text-center text-gray-400 mt-20">
        &copy; {new Date().getFullYear()} AlMasjid Digital. All rights reserved.
      </footer>
    </div>
  );
};

export default Dashboard;