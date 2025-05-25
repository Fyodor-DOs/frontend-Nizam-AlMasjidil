'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '@/utils/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Navbar from '@/components/Navbar';

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

const TausiyahDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = React.use(params);
  const [tausiyah, setTausiyah] = useState<Tausiyah | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    judul: '',
    isi: ''
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    if (token) {
      setAuthToken(token);
      setUserRole(role);
      fetchUserData();
    }
    fetchTausiyahDetail();
  }, [router, resolvedParams.id]);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/user');
      setUser(response.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchTausiyahDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/tausiyah/${resolvedParams.id}`);
      setTausiyah(response.data);
    } catch (err: any) {
      console.error('Error fetching tausiyah detail:', err);
      setError(err.response?.data?.message || 'Gagal mengambil detail tausiyah');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus tausiyah ini?')) return;
    try {
      setIsLoading(true);
      setError(null);
      await api.delete(`/tausiyah/${resolvedParams.id}`);
      router.push('/tausiyah');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menghapus tausiyah');
      console.error('Error deleting tausiyah:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (tausiyah) {
      setEditForm({
        judul: tausiyah.judul,
        isi: tausiyah.isi
      });
      setIsEditModalOpen(true);
    }
  };

  const handleEditSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await api.put(`/tausiyah/${resolvedParams.id}`, editForm);
      await fetchTausiyahDetail();
      setIsEditModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengedit tausiyah');
      console.error('Error editing tausiyah:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1614] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-yellow-400 border-t-transparent"></div>
          <p className="mt-2 text-gray-400">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1A1614] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => router.push('/tausiyah')} variant="outline">
            Kembali ke Daftar Tausiyah
          </Button>
        </div>
      </div>
    );
  }

  if (!tausiyah) {
    return (
      <div className="min-h-screen bg-[#1A1614] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Tausiyah tidak ditemukan</p>
          <Button onClick={() => router.push('/tausiyah')} variant="outline">
            Kembali ke Daftar Tausiyah
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1614]">
      <Navbar role={userRole} user={user} />
      
      {/* Banner */}
      <div className="relative h-64 w-full">
        <img
          src="/images/masjid7.jpg"
          alt="Banner Tausiyah"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-3xl md:text-4xl font-bold">Detail Tausiyah</h1>
        </div>
      </div>

      {/* Deskripsi */}
      <div className="max-w-3xl mx-auto px-6 py-10 text-center">
        <p className="text-white text-md leading-relaxed">
          Baca dan renungkan tausiyah ini untuk meningkatkan keimanan dan ketakwaan kita.
        </p>
      </div>

      {/* Container */}
      <div className="max-w-4xl mx-auto px-4 pb-10">
        <Card className="bg-black border-white/10">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-white">{tausiyah.judul}</CardTitle>
              <div className="flex space-x-2">
                <Button
                  onClick={() => router.push('/tausiyah')}
                  variant="outline"
                  className="text-white border-green-500 bg-green-500 hover:bg-green-600"
                >
                  Kembali
                </Button>
                {(userRole === 'admin' || userRole === 'takmir') && (
                  <>
                    <Button
                      onClick={handleEdit}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={handleDelete}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Hapus
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 whitespace-pre-wrap mb-6">{tausiyah.isi}</div>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <div>
                  Oleh: {tausiyah.user?.nama || tausiyah.user?.name || 'Anonim'}
                </div>
                <div>
                  {new Date(tausiyah.waktu).toLocaleString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-black border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Tausiyah</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="judul" className="text-white">Judul</label>
              <Input
                id="judul"
                value={editForm.judul}
                onChange={(e) => setEditForm({ ...editForm, judul: e.target.value })}
                className="bg-black border-white/10 text-white"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="isi" className="text-white">Isi</label>
              <textarea
                id="isi"
                value={editForm.isi}
                onChange={(e) => setEditForm({ ...editForm, isi: e.target.value })}
                className="min-h-[200px] p-3 rounded-md bg-black border border-white/10 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsEditModalOpen(false)}
              variant="outline"
              className="text-white border-white/10"
            >
              Batal
            </Button>
            <Button
              onClick={handleEditSubmit}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TausiyahDetailPage;
