// src/app/register/page.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/register', formData);
      router.push('/login'); // Redirect to login after successful register
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold">Register</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300"
          required
        />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
