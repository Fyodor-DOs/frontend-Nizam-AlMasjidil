'use client';

import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '@/utils/api';

const LaporanPage = () => {
  const [laporan, setLaporan] = useState<any[]>([]);
  const [bulan, setBulan] = useState('');
  const [tahun, setTahun] = useState('');
  const [saldoAkhir, setSaldoAkhir] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) setAuthToken(token);
  }, []);

  const fetchLaporan = async () => {
    try {
      const response = await api.get(`/laporan-keuangan/generate?bulan=${bulan}&tahun=${tahun}`);
      const data = response.data.data;
      setLaporan(data);
      setSaldoAkhir(response.data.saldo_akhir);
    } catch (err) {
      console.error('Error fetching laporan:', err);
    }
  };

  const exportToExcel = () => {
    const rows = laporan.map((item) => ({
      Tanggal: new Date(item.tanggal).toLocaleDateString('id-ID'),
      Keterangan: item.keterangan,
      'Uang Masuk': item.tipe_keuangan_id === 1 ? item.jumlah : '',
      'Uang Keluar': item.tipe_keuangan_id === 2 ? item.jumlah : '',
    }));

    rows.push({
      Tanggal: '',
      Keterangan: 'Saldo Akhir',
      'Uang Masuk': '',
      'Uang Keluar': saldoAkhir,
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');
    XLSX.writeFile(workbook, `Laporan_Keuangan_${bulan}_${tahun}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableData = laporan.map((item) => [
      new Date(item.tanggal).toLocaleDateString('id-ID'),
      item.keterangan,
      item.tipe_keuangan_id === 1 ? item.jumlah : '',
      item.tipe_keuangan_id === 2 ? item.jumlah : '',
    ]);

    tableData.push(['', 'Saldo Akhir', '', saldoAkhir]);

    doc.text(`Laporan Keuangan Bulan ${bulan}/${tahun}`, 10, 10);
    doc.autoTable({
      head: [['Tanggal', 'Keterangan', 'Uang Masuk', 'Uang Keluar']],
      body: tableData,
      startY: 20,
    });
    doc.save(`Laporan_Keuangan_${bulan}_${tahun}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Laporan Keuangan Bulanan</h1>

        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="text-sm font-medium text-gray-800">Pilih Bulan dan Tahun</label>
            <input
              type="month"
              className="border border-gray-300 p-2 rounded-md w-full sm:w-auto text-gray-800"
              value={`${tahun}-${bulan.padStart(2, '0')}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split('-');
                setTahun(y);
                setBulan(m);
              }}
            />
            <button
              onClick={fetchLaporan}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Tampilkan
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-800 border border-black">
            <thead className="bg-gray-100 text-gray-800">
              <tr>
                <th className="px-4 py-2 border border-black">Tanggal</th>
                <th className="px-4 py-2 border border-black">Keterangan</th>
                <th className="px-4 py-2 border border-black">Uang Masuk</th>
                <th className="px-4 py-2 border border-black">Uang Keluar</th>
              </tr>
            </thead>
            <tbody>
              {laporan.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500 border border-black">
                    Tidak ada data.
                  </td>
                </tr>
              ) : (
                <>
                  {laporan.map((item, idx) => (
                    <tr key={idx} className="border border-black">
                      <td className="px-4 py-2 border border-black">
                        {new Date(item.tanggal).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-2 border border-black">{item.keterangan}</td>
                      <td className="px-4 py-2 border border-black text-green-600 font-medium">
                        {item.tipe_keuangan_id === 1 ? `Rp ${parseFloat(item.jumlah).toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="px-4 py-2 border border-black text-red-600 font-medium">
                        {item.tipe_keuangan_id === 2 ? `Rp ${parseFloat(item.jumlah).toLocaleString('id-ID')}` : '-'}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-200 font-semibold">
                    <td className="px-4 py-2 border border-black"></td>
                    <td className="px-4 py-2 border border-black"></td>
                    <td className="px-4 py-2 border border-black">Saldo Akhir</td>
                    <td className="px-4 py-2 border border-black text-blue-700">
                      Rp {saldoAkhir.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex gap-4 mt-6 justify-end">
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Export Excel
          </button>
          <button
            onClick={exportToPDF}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Export PDF
          </button>
        </div>
        <button
            onClick={() => router.push('/keuangan')}
            className="mt-6 text-sm text-yellow-600 hover:underline block text-center"
            >
            ← Kembali ke Keuangan
        </button>
      </div>
    </div>
  );
};

export default LaporanPage;
