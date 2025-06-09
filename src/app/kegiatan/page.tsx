'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '@/utils/api';
import Navbar from '@/components/Navbar';
import GuestNavbar from '@/components/GuestNavbar'; // Ditambahkan
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; // Ditambahkan
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle } from 'lucide-react';

// Membuat komponen MotionButton yang merupakan Button dari shadcn/ui yang dianimasikan oleh Framer Motion
const MotionButton = motion(Button); // Ditambahkan

type Kegiatan = {
    id: number;
    nama_kegiatan: string;
    deskripsi: string;
    tanggal: string;
    waktu: string;
    lokasi: string;
    gambar?: string;
    user?: { // Ditambahkan untuk konsistensi dengan Tausiyah jika user bisa dilihat
        name?: string;
        nama?: string;
    };
};

interface User {
    id: number;
    nama: string;
    email: string;
    role: string;
}

// ===================================================================================================================
// VARIAN ANIMASI - DISAMAKAN DENGAN HALAMAN TAUSIYAH
// ===================================================================================================================

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1, // Stagger animation for children
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const cardVariants = { // Untuk card seperti daftar kegiatan
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } },
};

const messageVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
};

const modalOverlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
};

const modalDialogVariants = {
    hidden: { opacity: 0, scale: 0.8, y: -50 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 25 } },
    exit: { opacity: 0, scale: 0.8, y: -50, transition: { duration: 0.3 } },
};

// Animasi untuk hover dan tap pada tombol
const buttonHoverTap = {
    whileHover: {
        scale: 1.05,
        boxShadow: "0px 8px 20px rgba(252, 211, 77, 0.4)", // Yellow shadow on hover
        transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    whileTap: {
        scale: 0.95,
        transition: { type: "spring", stiffness: 400, damping: 10 }
    },
};
// ===================================================================================================================

const KegiatanPage = () => {
    const router = useRouter();
    const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
    const [formData, setFormData] = useState<Omit<Kegiatan, 'id' | 'gambar'> & { id?: number; }>({
        nama_kegiatan: '',
        deskripsi: '',
        tanggal: '',
        waktu: '',
        lokasi: '',
    });
    const [gambar, setGambar] = useState<File | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showReadModal, setShowReadModal] = useState(false);
    const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [kegiatanToDelete, setKegiatanToDelete] = useState<Kegiatan | null>(null);

    const getCurrentDateTime = () => {
        return new Date().toISOString().slice(0, 16);
    };

    useEffect(() => {
        if (showModal || showDeleteDialog || showReadModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showModal, showDeleteDialog, showReadModal]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const role = localStorage.getItem('role');
        if (token) {
            setAuthToken(token);
            setUserRole(role);
            fetchUser();
        }
        fetchKegiatan();
    }, []); // Removed router from dependency array, as router object is stable

    const fetchUser = async () => {
        try {
            const res = await api.get('/user');
            setUser(res.data);
        } catch (e) {
            console.error('Error fetching user:', e);
        }
    };

    const fetchKegiatan = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await api.get('/kegiatan');
            setKegiatanList(res.data);
        } catch (e: any) {
            console.error('Fetch Kegiatan Error:', e);
            setError(e.message || 'Gagal mengambil data kegiatan. Silakan coba lagi nanti.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (userRole !== 'admin' && userRole !== 'takmir') { // Pastikan role yang boleh tambah/edit
            setError('Anda tidak memiliki izin melakukan aksi ini.');
            return;
        }

        if (!formData.nama_kegiatan || !formData.deskripsi || !formData.tanggal || !formData.waktu || !formData.lokasi) {
            setError('Semua field harus diisi.');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const payload = new FormData();
            payload.append('nama_kegiatan', formData.nama_kegiatan);
            payload.append('deskripsi', formData.deskripsi);
            payload.append('tanggal', formData.tanggal);
            payload.append('waktu', formData.waktu);
            payload.append('lokasi', formData.lokasi);

            if (gambar) {
                payload.append('gambar', gambar);
            } else if (editMode && kegiatanToDelete && kegiatanToDelete.gambar) {
                 // Jika editMode dan tidak ada gambar baru, tapi ada gambar lama, kirim kembali gambar lama (sesuaikan dengan API Anda)
                // Atau biarkan backend menangani jika gambar tidak dikirim berarti tetap pakai yang lama
                // Untuk contoh ini, kita tidak append jika tidak ada gambar baru yang dipilih.
                // Asumsi backend akan mempertahankan gambar lama jika 'gambar' tidak ada di FormData saat PUT.
            }

            if (editMode && formData.id) {
                payload.append('_method', 'PUT'); // Penting untuk Laravel jika menggunakan PUT dengan FormData
                await api.post(`/kegiatan/${formData.id}`, payload, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                await api.post('/kegiatan', payload, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            setShowModal(false);
            setEditMode(false);
            setFormData({
                nama_kegiatan: '',
                deskripsi: '',
                tanggal: '',
                waktu: '',
                lokasi: '',
            });
            setGambar(null);
            await fetchKegiatan();
        } catch (e: any) {
            console.error('Error during save/update:', e);
            setError(e.response?.data?.message || e.message || 'Terjadi kesalahan saat menyimpan kegiatan.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (kegiatan: Kegiatan) => {
        setKegiatanToDelete(kegiatan);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (userRole !== 'admin' && userRole !== 'takmir' || !kegiatanToDelete) { // Pastikan role yang boleh hapus
            setError('Anda tidak memiliki izin menghapus atau data tidak ditemukan.');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            await api.delete(`/kegiatan/${kegiatanToDelete.id}`);
            setShowDeleteDialog(false);
            setKegiatanToDelete(null);
            await fetchKegiatan();
        } catch (e: any) {
            console.error('Gagal menghapus kegiatan:', e);
            setError(e.response?.data?.message || e.message || 'Gagal menghapus kegiatan. Terjadi kesalahan server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1A1614] text-white flex flex-col">
            {userRole ? (
                <Navbar role={userRole} user={user} />
            ) : (
                <GuestNavbar />
            )}

            {/* Hero Section */}
            <div className="relative h-96 w-full flex items-center justify-center overflow-hidden">
                <img
                    src="/images/masjid7.jpg" // Bisa diganti dengan gambar yang lebih cocok untuk kegiatan
                    alt="Masjid"
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1614] via-[#1A1614]/50 to-transparent"></div>
                <motion.div
                    className="relative z-10 text-center p-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h1
                        className="text-5xl md:text-6xl font-extrabold leading-tight text-white drop-shadow-lg"
                        variants={itemVariants}
                    >
                        Daftar Kegiatan Masjid
                    </motion.h1>
                    <motion.p
                        className="mt-4 text-xl md:text-2xl font-light text-gray-200"
                        variants={itemVariants}
                    >
                        Informasi lengkap mengenai jadwal dan deskripsi kegiatan.
                    </motion.p>
                </motion.div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-start flex-grow relative">
                {/* Description Section */}
                <motion.div
                    className="text-center md:text-left"
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <motion.h2 className="text-4xl font-bold mb-6 text-yellow-400" variants={itemVariants}>
                        Agenda Berkala
                    </motion.h2>
                    <motion.p className="text-lg leading-relaxed mb-6 text-gray-300" variants={itemVariants}>
                        Halaman ini menyajikan jadwal kegiatan rutin dan khusus yang diselenggarakan di masjid kami. Mari bergabung untuk mempererat tali silaturahmi dan meningkatkan keimanan kita bersama.
                    </motion.p>
                    <motion.ul
                        className="list-disc list-inside text-lg space-y-3 mb-8 text-gray-300"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <motion.li variants={itemVariants}>**Kegiatan Rutin:** Pengajian, Kajian Tematik, Diskusi Keagamaan.</motion.li>
                        <motion.li variants={itemVariants}>**Acara Spesial:** Peringatan Hari Besar Islam, Bakti Sosial, Workshop Keislaman.</motion.li>
                        <motion.li variants={itemVariants}>**Jadwal Teratur:** Informasi waktu dan lokasi yang jelas.</motion.li>
                        <motion.li variants={itemVariants}>**Untuk Semua Kalangan:** Program yang relevan untuk setiap usia.</motion.li>
                    </motion.ul>
                    <motion.p className="text-xl leading-relaxed font-semibold text-yellow-300 mb-8" variants={itemVariants}>
                        Partisipasi Anda adalah semangat kami dalam memakmurkan masjid.
                    </motion.p>
                    {/* "Kembali ke Beranda" Button */}
                    <motion.div
                        className="mt-8 flex justify-center md:justify-start"
                        variants={itemVariants}
                    >
                        <motion.button
                            onClick={() => router.push('/dashboard')}
                            className="bg-yellow-400 text-black font-semibold py-3 px-6 rounded-full hover:bg-yellow-500 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            {...buttonHoverTap}
                        >
                            Kembali ke Beranda
                        </motion.button>
                    </motion.div>
                </motion.div>

                {/* Kegiatan List Section (Card) */}
                <motion.div
                    className="bg-black rounded-2xl shadow-2xl overflow-hidden border border-gray-800"
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <div className="bg-yellow-400 text-black py-4 px-6 text-center font-bold text-lg relative">
                        Daftar Kegiatan Terbaru
                    </div>

                    <div className="p-6 sm:p-8">
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-400 text-center text-sm font-medium"
                                    variants={messageVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {isLoading ? (
                            <div className="text-center py-12">
                                <motion.div
                                    className="inline-block rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                ></motion.div>
                                <p className="mt-6 text-gray-400 text-xl">Memuat daftar kegiatan...</p>
                            </div>
                        ) : kegiatanList.length === 0 ? (
                            <motion.div
                                className="text-center py-12"
                                initial="hidden"
                                animate="visible"
                                variants={itemVariants}
                            >
                                <p className="text-gray-400 text-xl">Belum ada kegiatan yang tersedia saat ini.</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="grid gap-8"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {kegiatanList.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        onClick={() => {
                                            setSelectedKegiatan(item);
                                            setShowReadModal(true);
                                        }}
                                        className="flex flex-col p-6 border border-gray-700 rounded-xl shadow-lg bg-[#1A1614] text-white cursor-pointer hover:bg-[#2a2421] transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl"
                                        variants={itemVariants}
                                        whileHover={buttonHoverTap.whileHover}
                                        whileTap={buttonHoverTap.whileTap}
                                    >
                                        <h2 className="text-2xl font-bold text-yellow-400 mb-3 leading-tight">{item.nama_kegiatan}</h2>
                                        <p className="text-gray-300 mb-4 line-clamp-3 leading-relaxed">{item.deskripsi}</p>
                                        {item.gambar && (
                                            <img
                                                src={`http://localhost:8000/storage/${item.gambar}`} // Pastikan ini URL yang benar untuk produksi
                                                alt={item.nama_kegiatan}
                                                className="w-full h-48 object-cover rounded-md mb-4"
                                            />
                                        )}
                                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400 mt-auto">
                                            <div className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-semibold text-yellow-400">Tanggal:</span> {new Date(item.tanggal).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-semibold text-yellow-400">Waktu:</span> {item.waktu.slice(0, 5)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-semibold text-yellow-400">Lokasi:</span> {item.lokasi}
                                            </div>
                                            {item.user && (
                                                <div className="flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 9a3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="font-semibold text-yellow-400">Oleh:</span> {item.user.nama || item.user.name || 'Anonim'}
                                                </div>
                                            )}
                                        </div>
                                        {(userRole === 'admin' || userRole === 'takmir') && (
                                            <div className="mt-5 flex gap-3" onClick={(e) => e.stopPropagation()}>
                                                <MotionButton
                                                    onClick={() => {
                                                        setFormData({
                                                            id: item.id,
                                                            nama_kegiatan: item.nama_kegiatan,
                                                            deskripsi: item.deskripsi,
                                                            tanggal: item.tanggal.slice(0, 10), // Hanya ambil tanggal
                                                            waktu: item.waktu,
                                                            lokasi: item.lokasi,
                                                        });
                                                        setGambar(null); // Reset gambar saat edit, user harus upload lagi jika ingin mengubah
                                                        setEditMode(true);
                                                        setShowModal(true);
                                                        setError(null);
                                                    }}
                                                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-md text-sm font-semibold transition-colors duration-200 flex-1"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Edit
                                                </MotionButton>
                                                <MotionButton
                                                    onClick={() => handleDeleteClick(item)}
                                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-semibold transition-colors duration-200 flex-1"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Hapus
                                                </MotionButton>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </main>

            {/* Floating Action Button for 'Tambah Kegiatan' */}
            {(userRole === 'admin' || userRole === 'takmir') && (
                <motion.button
                    onClick={() => {
                        setShowModal(true);
                        setEditMode(false);
                        setFormData({
                            nama_kegiatan: '',
                            deskripsi: '',
                            tanggal: getCurrentDateTime().slice(0, 10), // Hanya tanggal
                            waktu: getCurrentDateTime().slice(11, 16), // Hanya waktu
                            lokasi: '',
                        });
                        setGambar(null);
                        setError(null);
                    }}
                    className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-transform transform hover:scale-105 duration-200 z-40 flex items-center justify-center"
                    title="Tambah Kegiatan Baru"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.8 }}
                    {...buttonHoverTap}
                >
                    <PlusCircle size={28} />
                    <span className="sr-only">Tambah Kegiatan</span>
                </motion.button>
            )}

            {/* Modal Form */}
            <AnimatePresence>
                {showModal && (
                    <Dialog open={showModal} onOpenChange={setShowModal}>
                        <DialogContent className="bg-[#1A1614] border-gray-700 text-white shadow-xl p-8 rounded-xl max-w-lg max-h-[90vh] overflow-y-auto">
                            <motion.div
                                variants={modalDialogVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <DialogHeader className="text-center">
                                    <DialogTitle className="text-3xl font-bold mb-2 text-yellow-400">
                                        {editMode ? 'Edit Kegiatan' : 'Tambah Kegiatan'}
                                    </DialogTitle>
                                    <DialogDescription className="text-gray-300 text-lg">
                                        {editMode
                                            ? 'Ubah informasi kegiatan sesuai kebutuhan.'
                                            : 'Isi formulir berikut untuk menambahkan kegiatan baru.'}
                                    </DialogDescription>
                                </DialogHeader>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="mt-6 mb-4 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-400 text-center text-sm font-medium"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSave();
                                    }}
                                    className="flex flex-col gap-6 mt-6"
                                >
                                    <motion.div variants={itemVariants}>
                                        <label htmlFor="nama_kegiatan" className="block font-semibold mb-2 text-gray-300 text-lg">
                                            Nama Kegiatan
                                        </label>
                                        <input
                                            type="text"
                                            id="nama_kegiatan"
                                            name="nama_kegiatan"
                                            value={formData.nama_kegiatan}
                                            onChange={(e) => setFormData({ ...formData, nama_kegiatan: e.target.value })}
                                            required
                                            className="w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-lg transition duration-200"
                                            placeholder="Nama kegiatan"
                                        />
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <label htmlFor="deskripsi" className="block font-semibold mb-2 text-gray-300 text-lg">
                                            Deskripsi
                                        </label>
                                        <textarea
                                            id="deskripsi"
                                            name="deskripsi"
                                            rows={4}
                                            value={formData.deskripsi}
                                            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                            required
                                            className="w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-y text-lg transition duration-200"
                                            placeholder="Deskripsi detail kegiatan"
                                        />
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <label htmlFor="tanggal" className="block font-semibold mb-2 text-gray-300 text-lg">
                                            Tanggal
                                        </label>
                                        <input
                                            type="date"
                                            id="tanggal"
                                            name="tanggal"
                                            value={formData.tanggal}
                                            onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                            required
                                            className="w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white focus:ring-yellow-500 focus:border-yellow-500 outline-none text-lg transition duration-200"
                                        />
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <label htmlFor="waktu" className="block font-semibold mb-2 text-gray-300 text-lg">
                                            Waktu
                                        </label>
                                        <input
                                            type="time"
                                            id="waktu"
                                            name="waktu"
                                            value={formData.waktu}
                                            onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                                            required
                                            className="w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white focus:ring-yellow-500 focus:border-yellow-500 outline-none text-lg transition duration-200"
                                        />
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <label htmlFor="lokasi" className="block font-semibold mb-2 text-gray-300 text-lg">
                                            Lokasi
                                        </label>
                                        <input
                                            type="text"
                                            id="lokasi"
                                            name="lokasi"
                                            value={formData.lokasi}
                                            onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                                            required
                                            className="w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-lg transition duration-200"
                                            placeholder="Contoh: Masjid Agung, Ruang Serbaguna"
                                        />
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <label htmlFor="gambar" className="block font-semibold mb-2 text-gray-300 text-lg">
                                            Gambar Kegiatan
                                        </label>
                                        <input
                                            type="file"
                                            id="gambar"
                                            name="gambar"
                                            accept="image/*"
                                            onChange={(e) => setGambar(e.target.files ? e.target.files[0] : null)}
                                            className="w-full rounded-md border border-gray-600 px-4 py-3 bg-gray-800 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-gray-900 hover:file:bg-yellow-600 transition duration-200 cursor-pointer"
                                        />
                                        {editMode && kegiatanToDelete?.gambar && !gambar && (
                                            <p className="mt-2 text-gray-400 text-sm">Gambar saat ini akan dipertahankan kecuali jika Anda mengunggah yang baru.</p>
                                        )}
                                    </motion.div>

                                    <DialogFooter className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
                                        <MotionButton
                                            type="button"
                                            onClick={() => {
                                                setShowModal(false);
                                                setEditMode(false);
                                                setFormData({
                                                    nama_kegiatan: '',
                                                    deskripsi: '',
                                                    tanggal: '',
                                                    waktu: '',
                                                    lokasi: '',
                                                });
                                                setGambar(null);
                                                setError(null);
                                            }}
                                            variant="outline"
                                            className="px-7 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-lg font-semibold transition-colors duration-200 w-full sm:w-auto"
                                            disabled={isLoading}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Batal
                                        </MotionButton>
                                        <MotionButton
                                            type="submit"
                                            variant="default"
                                            className="px-7 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-md text-lg font-semibold disabled:opacity-50 transition-colors duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
                                            disabled={isLoading}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Menyimpan...</span>
                                                </>
                                            ) : (
                                                'Simpan'
                                            )}
                                        </MotionButton>
                                    </DialogFooter>
                                </form>
                            </motion.div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Dialog */}
            <AnimatePresence>
                {showDeleteDialog && (
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogContent className="bg-[#1A1614] border-gray-700 text-white shadow-xl p-8 rounded-xl max-w-md max-h-[90vh] overflow-y-auto">
                            <motion.div
                                variants={modalDialogVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <DialogHeader className="text-center">
                                    <DialogTitle className="text-3xl font-bold text-yellow-400 mb-2">Konfirmasi Hapus</DialogTitle>
                                    <DialogDescription className="text-gray-300 text-lg">
                                        Apakah Anda yakin ingin menghapus kegiatan{' '}
                                        <strong className="text-yellow-300">{kegiatanToDelete?.nama_kegiatan}</strong>? Tindakan ini tidak dapat dibatalkan.
                                    </DialogDescription>
                                </DialogHeader>

                                <DialogFooter className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                                    <MotionButton
                                        variant="outline"
                                        onClick={() => setShowDeleteDialog(false)}
                                        className="px-7 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-lg font-semibold transition-colors duration-200 w-full sm:w-auto"
                                        disabled={isLoading}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Batal
                                    </MotionButton>
                                    <MotionButton
                                        variant="destructive"
                                        onClick={handleDeleteConfirm}
                                        className="px-7 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md text-lg font-semibold disabled:opacity-50 transition-colors duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
                                        disabled={isLoading}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {isLoading ? (
                                            <>
                                                <motion.svg
                                                    className="h-5 w-5 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                >
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </motion.svg>
                                                <span>Menghapus...</span>
                                            </>
                                        ) : (
                                            'Hapus'
                                        )}
                                    </MotionButton>
                                </DialogFooter>
                            </motion.div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>

            {/* Read Modal */}
            <AnimatePresence>
                {showReadModal && selectedKegiatan && (
                    <Dialog open={showReadModal} onOpenChange={setShowReadModal}>
                        <DialogContent className="bg-[#1A1614] border-gray-700 text-white shadow-xl p-8 rounded-xl max-w-2xl max-h-[90vh] overflow-y-auto">
                            <motion.div
                                variants={modalDialogVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <DialogHeader className="text-center">
                                    <DialogTitle className="text-3xl font-bold mb-2 text-yellow-400">
                                        {selectedKegiatan.nama_kegiatan}
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="mt-6 space-y-6">
                                    {selectedKegiatan.gambar && (
                                        <div className="relative w-full h-64 rounded-lg overflow-hidden">
                                            <img
                                                src={`http://localhost:8000/storage/${selectedKegiatan.gambar}`}
                                                alt={selectedKegiatan.nama_kegiatan}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-yellow-400 mb-2">Deskripsi</h3>
                                            <p className="text-gray-300 leading-relaxed">{selectedKegiatan.deskripsi}</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-semibold text-yellow-400">Tanggal:</span>
                                                <span className="text-gray-300">{new Date(selectedKegiatan.tanggal).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-semibold text-yellow-400">Waktu:</span>
                                                <span className="text-gray-300">{selectedKegiatan.waktu.slice(0, 5)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-semibold text-yellow-400">Lokasi:</span>
                                                <span className="text-gray-300">{selectedKegiatan.lokasi}</span>
                                            </div>
                                            {selectedKegiatan.user && (
                                                <div className="flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="font-semibold text-yellow-400">Oleh:</span>
                                                    <span className="text-gray-300">{selectedKegiatan.user.nama || selectedKegiatan.user.name || 'Anonim'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <DialogFooter className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
                                        {(userRole === 'admin' || userRole === 'takmir') && (
                                            <>
                                                <MotionButton
                                                    onClick={() => {
                                                        setFormData({
                                                            id: selectedKegiatan.id,
                                                            nama_kegiatan: selectedKegiatan.nama_kegiatan,
                                                            deskripsi: selectedKegiatan.deskripsi,
                                                            tanggal: selectedKegiatan.tanggal.slice(0, 10),
                                                            waktu: selectedKegiatan.waktu,
                                                            lokasi: selectedKegiatan.lokasi,
                                                        });
                                                        setGambar(null);
                                                        setEditMode(true);
                                                        setShowModal(true);
                                                        setShowReadModal(false);
                                                        setError(null);
                                                    }}
                                                    className="px-7 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-md text-lg font-semibold transition-colors duration-200 w-full sm:w-auto"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Edit
                                                </MotionButton>
                                                <MotionButton
                                                    onClick={() => {
                                                        setKegiatanToDelete(selectedKegiatan);
                                                        setShowDeleteDialog(true);
                                                        setShowReadModal(false);
                                                    }}
                                                    className="px-7 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md text-lg font-semibold transition-colors duration-200 w-full sm:w-auto"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Hapus
                                                </MotionButton>
                                            </>
                                        )}
                                        <MotionButton
                                            onClick={() => setShowReadModal(false)}
                                            className="px-7 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-lg font-semibold transition-colors duration-200 w-full sm:w-auto"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Tutup
                                        </MotionButton>
                                    </DialogFooter>
                                </div>
                            </motion.div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </div>
    );
};

export default KegiatanPage;