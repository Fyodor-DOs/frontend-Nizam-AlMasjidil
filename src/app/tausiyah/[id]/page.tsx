'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '@/utils/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from '@/components/Navbar';
import GuestNavbar from '@/components/GuestNavbar';

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

interface User {
    id: number;
    nama: string;
    email: string;
    role: string;
}

const TausiyahDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = React.use(params);

  const [tausiyah, setTausiyah] = useState<Tausiyah | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUserData = useCallback(async () => {
    try {
      const response = await api.get('/user');
      setUser(response.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  }, []);

  const fetchTausiyahDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/tausiyah/${id}`);
      setTausiyah(response.data);
    } catch (err: unknown) { 
      console.error('Error fetching tausiyah detail:', err);
      if (typeof err === 'object' && err !== null && 'response' in err) {
          const errorResponse = err.response as { data?: { message?: string } };
          setError(errorResponse.data?.message || 'Gagal mengambil detail tausiyah');
      } else {
          setError('Gagal mengambil detail tausiyah');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    if (token) {
      setAuthToken(token);
      setUserRole(role);
      fetchUserData();
    }
    fetchTausiyahDetail();
  }, [id, fetchUserData, fetchTausiyahDetail]); 

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
      {userRole ? (
        <Navbar role={userRole} user={user} />
      ) : (
        <GuestNavbar />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="bg-black/50 border-white/10 shadow-lg backdrop-blur-sm">
          <CardHeader className="px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <CardTitle className="text-2xl lg:text-3xl font-bold text-yellow-400 leading-tight">
                {tausiyah.judul}
              </CardTitle>
              <Button 
                onClick={() => router.back()} 
                className="bg-green-600 text-white hover:bg-green-700 transition-colors duration-200" 
              >
                Kembali
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-8 py-6">
            <div className="prose prose-invert max-w-none text-white text-lg leading-relaxed whitespace-pre-wrap text-justify">
                {tausiyah.isi}
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-400 border-t border-gray-700 pt-6 mt-8 gap-2">
              <div>
                Oleh: {tausiyah.user?.nama || tausiyah.user?.name || 'Admin'}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TausiyahDetailPage;