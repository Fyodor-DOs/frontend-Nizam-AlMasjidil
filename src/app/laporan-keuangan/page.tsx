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
    <div className="min-h-screen bg-[#1A1614] p-6 text-gray-300 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-yellow-400 text-center">
          Laporan Keuangan Bulanan
        </h1>

        <div className="bg-white/5 border border-white/10 backdrop-blur-sm p-6 rounded-xl shadow mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="text-sm font-medium text-gray-200">Pilih Bulan dan Tahun</label>
            <input
              type="month"
              className="bg-[#1A1614] border border-gray-500 text-white p-2 rounded-md w-full sm:w-auto"
              value={`${tahun}-${bulan.padStart(2, '0')}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split('-');
                setTahun(y);
                setBulan(m);
              }}
            />
            <button
              onClick={fetchLaporan}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition"
            >
              Tampilkan
            </button>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl shadow p-4 overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-200 border border-gray-700">
            <thead className="bg-black/20 text-yellow-300">
              <tr>
                <th className="px-4 py-2 border border-gray-700">Tanggal</th>
                <th className="px-4 py-2 border border-gray-700">Keterangan</th>
                <th className="px-4 py-2 border border-gray-700">Uang Masuk</th>
                <th className="px-4 py-2 border border-gray-700">Uang Keluar</th>
              </tr>
            </thead>
            <tbody>
              {laporan.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500 border border-gray-700">
                    Tidak ada data.
                  </td>
                </tr>
              ) : (
                <>
                  {laporan.map((item, idx) => (
                    <tr key={idx} className="border border-gray-700">
                      <td className="px-4 py-2 border border-gray-700">
                        {new Date(item.tanggal).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-2 border border-gray-700">{item.keterangan}</td>
                      <td className="px-4 py-2 border border-gray-700 text-green-400 font-medium">
                        {item.tipe_keuangan_id === 1 ? `Rp ${parseFloat(item.jumlah).toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="px-4 py-2 border border-gray-700 text-red-400 font-medium">
                        {item.tipe_keuangan_id === 2 ? `Rp ${parseFloat(item.jumlah).toLocaleString('id-ID')}` : '-'}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-black/30 font-semibold">
                    <td className="px-4 py-2 border border-gray-700"></td>
                    <td className="px-4 py-2 border border-gray-700 text-right" colSpan={2}>
                      Saldo Akhir
                    </td>
                    <td className="px-4 py-2 border border-gray-700 text-blue-400">
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
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition"
          >
            Export Excel
          </button>
          <button
            onClick={exportToPDF}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
          >
            Export PDF
          </button>
        </div>

        <button
          onClick={() => router.push('/keuangan')}
          className="mt-6 text-sm text-blue-400 hover:underline block text-center"
        >
          ← Kembali ke Keuangan
        </button>
      </div>
    </div>
  );
};

export default LaporanPage;
