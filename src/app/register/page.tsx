'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/utils/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, X } from "lucide-react";

const Register = () => {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      await api.post('/register', { ...data, role: 'jamaah' });
      router.push('/login');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registrasi gagal');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/masjid4.jpg"
          alt="Background Mosque"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Content */}
      <div className="container relative z-10 flex items-center justify-center px-4">
        <div className="flex w-full max-w-5xl h-[600px] overflow-hidden rounded-[1rem] bg-neutral-900/50 backdrop-blur-md relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-neutral-400 hover:text-white hover:bg-neutral-800/50 z-20"
            onClick={() => router.push('/')}
          >
            <X className="h-5 w-5" />
          </Button>
          {/* Left Side - Mosque Image */}
          <div className="hidden w-1/2 lg:block relative">
            <Image
              src="/images/login_masjid.png"
              alt="Mosque"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* Right Side - Register Form */}
          <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center">
            <Card className="border-0 bg-transparent shadow-none">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center text-white">Buat Akun</CardTitle>
                <CardDescription className="text-center text-neutral-400">
                  Masukkan informasi Anda untuk membuat akun
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nama" className="text-neutral-200">Nama Lengkap</Label>
                    <Input
                      id="nama"
                      type="text"
                      placeholder="Masukkan nama lengkap Anda"
                      className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500"
                      {...register("nama", { required: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-neutral-200">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Masukkan email Anda"
                      className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500"
                      {...register("email", { required: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-neutral-200">Kata Sandi</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Buat kata sandi"
                        className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 pr-10"
                        {...register("password", { required: true })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
                    Daftar
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-neutral-400">
                  Sudah punya akun?{' '}
                  <Link href="/login" className="text-yellow-500 hover:text-yellow-400 underline-offset-4 hover:underline">
                    Masuk di sini
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
