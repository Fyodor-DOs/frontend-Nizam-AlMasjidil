'use client';

import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '@/utils/api';

interface LaporanItem {
  tanggal: string;
  keterangan: string;
  tipe_keuangan_id: 1 | 2; 
  jumlah: string | number;
}

interface jsPDFWithPlugin extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

const LaporanPage = () => {
  const [laporan, setLaporan] = useState<LaporanItem[]>([]);
  const [bulan, setBulan] = useState('');
  const [tahun, setTahun] = useState('');
  const [saldoAkhir, setSaldoAkhir] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) setAuthToken(token);
    
    const now = new Date();
    setBulan(String(now.getMonth() + 1).padStart(2, '0'));
    setTahun(String(now.getFullYear()));
  }, []);

  const fetchLaporan = async () => {
    if (!bulan || !tahun) {
      alert('Silakan pilih bulan dan tahun terlebih dahulu');
      return;
    }
    try {
      const response = await api.get(`/laporan-keuangan/generate?bulan=${bulan}&tahun=${tahun}`);
      const data = response.data.data;
      setLaporan(data);
      setSaldoAkhir(response.data.saldo_akhir);
    } catch (err: unknown) { 
      console.error('Error fetching laporan:', err);
      alert('Gagal mengambil data laporan');
    }
  };

  const getNamaBulan = (bulan: string) => {
    const bulanList = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return bulanList[parseInt(bulan) - 1];
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('MASJID NIZAM AL-MASJIDIL', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Jl. Rawasari Timur Raya No.04, Kota Jakarta Pusat', 105, 30, { align: 'center' });
    doc.text('Telp: (021) 7543541', 105, 40, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`LAPORAN KEUANGAN BULAN ${getNamaBulan(bulan).toUpperCase()} ${tahun}`, 105, 55, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.line(20, 60, 190, 60);
    
    const tableData = laporan.map((item: LaporanItem) => [
      new Date(item.tanggal).toLocaleDateString('id-ID'),
      item.keterangan,
      item.tipe_keuangan_id === 1 ? `Rp ${parseFloat(String(item.jumlah)).toLocaleString('id-ID')}` : '',
      item.tipe_keuangan_id === 2 ? `Rp ${parseFloat(String(item.jumlah)).toLocaleString('id-ID')}` : '',
    ]);

    const totalPemasukan = laporan
      .filter(item => item.tipe_keuangan_id === 1)
      .reduce((sum, item) => sum + parseFloat(String(item.jumlah)), 0);

    const totalPengeluaran = laporan
      .filter(item => item.tipe_keuangan_id === 2)
      .reduce((sum, item) => sum + parseFloat(String(item.jumlah)), 0);

    autoTable(doc, {
      head: [['Tanggal', 'Keterangan', 'Uang Masuk', 'Uang Keluar']],
      body: tableData,
      startY: 70,
      margin: { top: 70 },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
        textColor: 0
      },
      didDrawPage: (data) => {
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(
          `Halaman ${data.pageNumber} dari ${pageCount}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      }
    });

    const finalY = (doc as jsPDFWithPlugin).lastAutoTable.finalY;

    autoTable(doc, {
      startY: finalY + 10,
      head: [['Ringkasan', 'Jumlah']],
      body: [
          ['Total Pemasukan', `Rp ${totalPemasukan.toLocaleString('id-ID')}`],
          ['Total Pengeluaran', `Rp ${totalPengeluaran.toLocaleString('id-ID')}`],
          ['Saldo Akhir', `Rp ${saldoAkhir.toLocaleString('id-ID')}`]
      ],
      theme: 'grid',
      headStyles: {
          fillColor: [22, 160, 133],
          fontStyle: 'bold',
      },
      bodyStyles: {
          fontStyle: 'bold'
      }
    });


    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
    }

    doc.save(`Laporan_Keuangan_${getNamaBulan(bulan)}_${tahun}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#1A1614] p-6 text-gray-300 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-yellow-400 text-center">
          Laporan Keuangan Bulanan
        </h1>

        <div className="bg-white/5 border border-white/10 backdrop-blur-sm p-6 rounded-xl shadow mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-200 mb-2">Pilih Bulan</label>
              <select
                className="bg-[#1A1614] border border-gray-500 text-white p-2 rounded-md w-full"
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
              >
                <option value="01">Januari</option>
                <option value="02">Februari</option>
                <option value="03">Maret</option>
                <option value="04">April</option>
                <option value="05">Mei</option>
                <option value="06">Juni</option>
                <option value="07">Juli</option>
                <option value="08">Agustus</option>
                <option value="09">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-200 mb-2">Pilih Tahun</label>
              <select
                className="bg-[#1A1614] border border-gray-500 text-white p-2 rounded-md w-full"
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
              >
                <option value="">Pilih Tahun</option>
                {Array.from({ length: 5 }, (_, i) => { 
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex-1">
              <div className="h-[40px]">
                <button
                  onClick={fetchLaporan}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded transition w-full h-full"
                >
                  Tampilkan Laporan
                </button>
              </div>
            </div>
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
                    Tidak ada data. Silakan pilih bulan dan tahun lalu klik &quot;Tampilkan Laporan&quot;.
                  </td>
                </tr>
              ) : (
                <>
                  {laporan.map((item: LaporanItem, idx) => (
                    <tr key={idx} className="border border-gray-700">
                      <td className="px-4 py-2 border border-gray-700">
                        {new Date(item.tanggal).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-2 border border-gray-700">{item.keterangan}</td>
                      <td className="px-4 py-2 border border-gray-700 text-green-400 font-medium">
                        {item.tipe_keuangan_id === 1 ? `Rp ${parseFloat(String(item.jumlah)).toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="px-4 py-2 border border-gray-700 text-red-400 font-medium">
                        {item.tipe_keuangan_id === 2 ? `Rp ${parseFloat(String(item.jumlah)).toLocaleString('id-ID')}` : '-'}
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

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => router.push('/keuangan')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
          >
            ← Kembali ke Keuangan
          </button>

          <button
            onClick={exportToPDF}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
            disabled={laporan.length === 0}
          >
            Export PDF
          </button>
        </div>

      </div>
    </div>
  );
};

export default LaporanPage;