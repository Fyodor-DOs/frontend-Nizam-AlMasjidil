'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/utils/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, SubmitHandler } from "react-hook-form";
import { Eye, EyeOff, X } from "lucide-react";
import { motion } from "framer-motion";

const MotionButton = motion(Button);

interface RegisterFormInputs {
  nama: string;
  email: string;
  password: string;
}

const Register = () => {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>();

  useEffect(() => {
    document.body.style.backgroundColor = '#171717';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    try {
      await api.post('/register', { ...data, role: 'jamaah' });
      router.push('/login');
    } catch (err: unknown) { 
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const errorResponse = err.response as { data?: { message?: string } };
        setError(errorResponse.data?.message || 'Registrasi gagal. Silakan coba lagi.');
      } else {
        setError('Terjadi kesalahan yang tidak terduga.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
      >
        <Image
          src="/images/masjid4.jpg"
          alt="Background Mosque"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/70" />
      </motion.div>

      <div className="container relative z-10 flex items-center justify-center px-4">
        <motion.div
          className="flex w-full max-w-5xl h-[600px] overflow-hidden rounded-[1rem] bg-neutral-900/50 backdrop-blur-md relative"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          <MotionButton
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-neutral-400 hover:text-white hover:bg-neutral-800/50 z-20"
            onClick={() => router.push('/')}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <X className="h-5 w-5" />
          </MotionButton>

          <motion.div
            className="hidden w-1/2 lg:block relative"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.5 }}
          >
            <Image
              src="/images/login_masjid.png"
              alt="Mosque"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/30" />
          </motion.div>

          <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
            >
              <Card className="border-0 bg-transparent shadow-none">
                <CardHeader className="space-y-1">
                  <motion.h2
                    className="text-2xl font-bold text-center text-white"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
                  >
                    Buat Akun
                  </motion.h2>
                  <motion.p
                    className="text-center text-neutral-400"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.9, ease: "easeOut" }}
                  >
                    Masukkan informasi Anda untuk membuat akun
                  </motion.p>
                </CardHeader>
                <CardContent>
                  {error && (
                    <motion.div
                      className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {error}
                    </motion.div>
                  )}
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.0, ease: "easeOut" }}
                    >
                      <Label htmlFor="nama" className="text-neutral-200">Nama Lengkap</Label>
                      <Input
                        id="nama"
                        type="text"
                        placeholder="Masukkan nama lengkap Anda"
                        className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500"
                        {...register("nama", { required: "Nama lengkap tidak boleh kosong" })}
                      />
                      {errors.nama && <p className="text-xs text-red-500 mt-1">{errors.nama.message}</p>}
                    </motion.div>
                    
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.1, ease: "easeOut" }}
                    >
                      <Label htmlFor="email" className="text-neutral-200">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Masukkan email Anda"
                        className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500"
                        {...register("email", { required: "Email tidak boleh kosong" })}
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.2, ease: "easeOut" }}
                    >
                      <Label htmlFor="password" className="text-neutral-200">Kata Sandi</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Buat kata sandi"
                          className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 pr-10"
                          {...register("password", { required: "Kata sandi tidak boleh kosong" })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
                        >
                          {showPassword ? (<EyeOff className="h-5 w-5" />) : (<Eye className="h-5 w-5" />)}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.3, ease: "easeOut" }}
                    >
                      <MotionButton
                        type="submit"
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        Daftar
                      </MotionButton>
                    </motion.div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <motion.p
                    className="text-sm text-neutral-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                  >
                    Sudah punya akun?{' '}
                    <Link href="/login" className="text-yellow-500 hover:text-yellow-400 underline-offset-4 hover:underline">
                      Masuk di sini
                    </Link>
                  </motion.p>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;