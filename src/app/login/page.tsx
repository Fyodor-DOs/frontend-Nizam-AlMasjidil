// src/app/login/page.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '@/utils/api';

const Login = () => {
  const [formData, setFormData] = useState({
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
      const response = await api.post('/login', formData);
      const token = response.data.token;
      setAuthToken(token); // Store token in axios headers
      localStorage.setItem('authToken', token); // Store token in localStorage
      router.push('/dashboard'); // Redirect to dashboard
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold">Login</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
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
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
