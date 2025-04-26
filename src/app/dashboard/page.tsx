// src/app/dashboard/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';

const Dashboard = () => {
  const [keuangan, setKeuangan] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/keuangan');
        setKeuangan(response.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to fetch data');
        router.push('/login');
      }
    };
    fetchData();
  }, [router]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="mt-8">
        <h2 className="text-xl">Keuangan</h2>
        <ul>
          {keuangan.map((item) => (
            <li key={item.id} className="p-2 border-b">
              <p>{item.keterangan}</p>
              <p>{item.jumlah}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
