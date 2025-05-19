"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { setAuthToken } from "@/utils/api"; // Pastikan utils/api.ts ada dan meng-handle axios instance dengan benar

interface Profile {
  id: number;
  nama: string;
  email: string;
  role: string;
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken"); // gunakan key yang sama seperti di contoh donasi
    if (!token) {
      setError("Token tidak ditemukan. Silakan login terlebih dahulu.");
      setLoading(false);
      router.push("/login");
      return;
    }
    setAuthToken(token);

    api
      .get("/profile")
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err: any) => {
        console.error("Error memuat profil:", err.response || err.message || err);
        if (err.response?.status === 401) {
          setError("Sesi habis. Silakan login ulang.");
          localStorage.removeItem("authToken");
          router.push("/login");
        } else {
          setError("Gagal memuat data profil.");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <p className="p-4">Memuat data profil...</p>;
  if (error)
    return (
      <p className="p-4 text-red-600">
        {error}
      </p>
    );

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profil Pengguna</h1>
      {profile && (
        <div className="space-y-2 bg-gray-100 p-4 rounded-lg shadow">
          <p>
            <strong>Nama:</strong> {profile.nama}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Role:</strong> {profile.role}
          </p>
        </div>
      )}
    </div>
  );
}
