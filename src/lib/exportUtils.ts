import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import { Product, Resource, UsageMatrix, Solution, ObjectiveType } from '@/types';
import { formatRupiah, formatNumber, formatPercent } from '@/lib/formatters';

// Export Multi-Sheet Excel (PRD 6)
export function exportToExcel(
  objective: ObjectiveType,
  products: Product[],
  resources: Resource[],
  usage: UsageMatrix,
  solution: Solution,
  companyName: string = 'Perusahaan Saya'
) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Ringkasan
  const summaryData = [
    ['RINGKASAN REKOMENDASI OPTIMASI BISNIS'],
    ['Nama Usaha / Proyek', companyName],
    ['Tanggal Pembuatan', new Date().toLocaleString('id-ID')],
    ['Tujuan Bisnis', objective === 'MAXIMIZE_PROFIT' ? 'Maksimalkan Untung' : 'Minimalkan Biaya'],
    ['Status Solusi', solution.status === 'OPTIMAL' ? 'Rekomendasi Ditemukan' : solution.status],
    [
      objective === 'MAXIMIZE_PROFIT' ? 'Total Untung Maksimal' : 'Total Biaya Minimum',
      formatRupiah(solution.objectiveValue),
    ],
    ['Kesimpulan Bisnis', solution.conclusionSentence],
    [],
    ['Faktor Penghambat Utama', solution.topBottleneck ? `${solution.topBottleneck.name} (Terpakai Penuh)` : '-'],
    ['Nilai Tambah per Unit Tambahan', solution.topBottleneck ? formatRupiah(solution.topBottleneck.shadowPrice) : '-'],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

  // 2. Sheet Rencana Produksi
  const productionData = [
    ['Nama Produk', 'Rekomendasi Jumlah', 'Satuan', 'Untung / Biaya per Unit', 'Kontribusi Total', 'Porsi dari Total'],
    ...solution.products.map((p) => [
      p.name,
      p.quantity,
      p.unit,
      p.profitPerUnit,
      p.contribution,
      `${p.percentageOfTotal}%`,
    ]),
  ];
  const wsProduction = XLSX.utils.aoa_to_sheet(productionData);
  XLSX.utils.book_append_sheet(wb, wsProduction, 'Rencana Produksi');

  // 3. Sheet Pemakaian Sumber Daya
  const resourceData = [
    ['Sumber Daya', 'Kapasitas Tersedia', 'Terpakai', 'Sisa Kapasitas', 'Satuan', 'Persentase Terpakai', 'Status', 'Nilai Tambah per 1 Unit'],
    ...solution.resources.map((r) => [
      r.name,
      r.capacity,
      r.used,
      r.slack,
      r.unit,
      `${r.usagePercent}%`,
      r.binding ? 'Terpakai Penuh (Penghambat)' : 'Aman (Masih Bersisa)',
      r.shadowPrice > 0 ? formatRupiah(r.shadowPrice) : 'Rp 0',
    ]),
  ];
  const wsResource = XLSX.utils.aoa_to_sheet(resourceData);
  XLSX.utils.book_append_sheet(wb, wsResource, 'Pemakaian Sumber Daya');

  // 4. Sheet Data Input (Bisa di-upload ulang tanpa perubahan - PRD 6)
  const inputProducts = [
    ['[PRODUK]'],
    ['ID', 'Nama Produk', 'Untung per Unit', 'Satuan', 'Hanya Jumlah Utuh (Ya/Tidak)'],
    ...products.map((p) => [p.id, p.name, p.profit, p.unit, p.integerOnly ? 'Ya' : 'Tidak']),
    [],
    ['[SUMBER DAYA]'],
    ['ID', 'Nama Sumber Daya', 'Kapasitas', 'Satuan', 'Tipe Batasan'],
    ...resources.map((r) => [
      r.id,
      r.name,
      r.capacity,
      r.unit,
      r.type === 'LEQ' ? 'Tidak boleh lebih dari' : r.type === 'GEQ' ? 'Paling sedikit' : 'Harus tepat',
    ]),
    [],
    ['[PEMAKAIAN PER UNIT]'],
    ['ID Produk', 'Nama Produk', ...resources.map((r) => `${r.name} (${r.unit})`)],
    ...products.map((p) => [
      p.id,
      p.name,
      ...resources.map((r) => usage[p.id]?.[r.id] ?? 0),
    ]),
  ];
  const wsInput = XLSX.utils.aoa_to_sheet(inputProducts);
  XLSX.utils.book_append_sheet(wb, wsInput, 'Data Input');

  // Save workbook
  const filename = `Rencana_Optimasi_Bisnis_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// Export CSV with UTF-8 BOM and formula sanitization (PRD 6 & 12)
export function exportToCSV(solution: Solution, objective: ObjectiveType) {
  const sanitize = (val: any) => {
    const s = String(val);
    if (/^[=+@-].*/.test(s)) {
      return `'${s}`; // Escape formula injection characters
    }
    return s;
  };

  const rows = [
    ['--- HASIL OPTIMASI BISNIS ---'],
    ['Tujuan Bisnis', objective === 'MAXIMIZE_PROFIT' ? 'Maksimalkan Untung' : 'Minimalkan Biaya'],
    ['Status', solution.status],
    ['Total Nilai', formatRupiah(solution.objectiveValue)],
    ['Kesimpulan', sanitize(solution.conclusionSentence)],
    [],
    ['--- RENCANA PRODUKSI ---'],
    ['Nama Produk', 'Jumlah Rekomendasi', 'Satuan', 'Untung/Unit', 'Kontribusi Total', 'Porsi (%)'],
    ...solution.products.map((p) => [
      sanitize(p.name),
      p.quantity,
      sanitize(p.unit),
      p.profitPerUnit,
      p.contribution,
      p.percentageOfTotal,
    ]),
    [],
    ['--- PEMAKAIAN SUMBER DAYA ---'],
    ['Sumber Daya', 'Kapasitas', 'Terpakai', 'Sisa', 'Satuan', 'Penggunaan (%)', 'Status'],
    ...solution.resources.map((r) => [
      sanitize(r.name),
      r.capacity,
      r.used,
      r.slack,
      sanitize(r.unit),
      r.usagePercent,
      r.binding ? 'Terpakai Penuh' : 'Bersisa',
    ]),
  ];

  const csv = Papa.unparse(rows);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Optimasi_Bisnis_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Export PDF Report ready for business meetings (PRD 7.2)
export function exportToPDF(
  objective: ObjectiveType,
  solution: Solution,
  companyName: string = 'Laporan Eksekutif Optimasi Bisnis'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header
  doc.setFillColor(31, 78, 95); // #1F4E5F (accent)
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Dibuat: ${new Date().toLocaleDateString('id-ID')}`, 160, 15);

  // Executive Summary Card
  doc.setTextColor(22, 32, 42); // #16202A (ink)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Ringkasan Rekomendasi Bisnis', 14, 38);

  doc.setFillColor(247, 246, 243); // #F7F6F3 (bg)
  doc.roundedRect(14, 44, 182, 32, 2, 2, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(
    objective === 'MAXIMIZE_PROFIT' ? 'Proyeksi Untung Maksimal:' : 'Proyeksi Biaya Minimum:',
    20,
    54
  );
  doc.setTextColor(47, 125, 87); // #2F7D57 (optimal)
  doc.setFontSize(16);
  doc.text(formatRupiah(solution.objectiveValue), 20, 62);

  doc.setTextColor(91, 102, 114); // #5B6672 (muted)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const splitConclusion = doc.splitTextToSize(solution.conclusionSentence, 170);
  doc.text(splitConclusion, 20, 70);

  // Production Table
  let currentY = 88;
  doc.setTextColor(22, 32, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Rencana Produksi yang Direkomendasikan', 14, currentY);

  currentY += 6;
  doc.setFillColor(227, 225, 219); // border header
  doc.rect(14, currentY, 182, 8, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Nama Produk', 16, currentY + 5.5);
  doc.text('Jumlah Rekomendasi', 80, currentY + 5.5);
  doc.text('Untung / Unit', 125, currentY + 5.5);
  doc.text('Kontribusi Total', 160, currentY + 5.5);

  currentY += 8;
  doc.setFont('helvetica', 'normal');
  solution.products.forEach((p, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(250, 250, 248);
      doc.rect(14, currentY, 182, 7, 'F');
    }
    doc.text(p.name, 16, currentY + 5);
    doc.text(`${formatNumber(p.quantity)} ${p.unit}`, 80, currentY + 5);
    doc.text(formatRupiah(p.profitPerUnit), 125, currentY + 5);
    doc.text(formatRupiah(p.contribution), 160, currentY + 5);
    currentY += 7;
  });

  // Resource Usage Table
  currentY += 8;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Pemakaian Kapasitas Sumber Daya', 14, currentY);

  currentY += 6;
  doc.setFillColor(227, 225, 219);
  doc.rect(14, currentY, 182, 8, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Sumber Daya', 16, currentY + 5.5);
  doc.text('Kapasitas', 65, currentY + 5.5);
  doc.text('Terpakai', 95, currentY + 5.5);
  doc.text('Sisa Kapasitas', 130, currentY + 5.5);
  doc.text('Status', 165, currentY + 5.5);

  currentY += 8;
  doc.setFont('helvetica', 'normal');
  solution.resources.forEach((r, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(250, 250, 248);
      doc.rect(14, currentY, 182, 7, 'F');
    }
    doc.text(r.name, 16, currentY + 5);
    doc.text(`${formatNumber(r.capacity)} ${r.unit}`, 65, currentY + 5);
    doc.text(`${formatNumber(r.used)} ${r.unit}`, 95, currentY + 5);
    doc.text(`${formatNumber(r.slack)} ${r.unit}`, 130, currentY + 5);
    if (r.binding) {
      doc.setTextColor(179, 56, 44);
      doc.text('Terpakai Penuh', 165, currentY + 5);
      doc.setTextColor(22, 32, 42);
    } else {
      doc.setTextColor(47, 125, 87);
      doc.text('Aman (Bersisa)', 165, currentY + 5);
      doc.setTextColor(22, 32, 42);
    }
    currentY += 7;
  });

  // Footer notes
  currentY += 12;
  doc.setFontSize(8);
  doc.setTextColor(91, 102, 114);
  doc.text(
    'Catatan: Laporan ini dihitung secara client-side menggunakan mesin Linear Programming dan data tetap berada di perangkat Anda.',
    14,
    currentY
  );

  doc.save(`Laporan_Rekomendasi_Bisnis_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// Download Blank Template for Excel Import (PRD 6.1)
export function downloadExcelTemplate() {
  const wb = XLSX.utils.book_new();

  // 1. Mulai di Sini
  const startHereData = [
    ['PANDUAN MENGISI TEMPLATE OPTIMASI BISNIS'],
    [],
    ['Langkah 1: Buka lembar "Produk", isi nama produk dan keuntungan per unit.'],
    ['Langkah 2: Buka lembar "Sumber Daya", tentukan batasan bahan baku atau jam kerja.'],
    ['Langkah 3: Buka lembar "Pemakaian", isi berapa kebutuhan bahan untuk tiap produk.'],
    ['Langkah 4: Simpan berkas ini dan unggah kembali ke aplikasi web.'],
    [],
    ['PETUNJUK FORMAT:'],
    ['- Gunakan angka standar (contoh: 5000 atau 0.5) tanpa titik ribuan di dalam sel angka.'],
    ['- Selalu isi satuan (contoh: bungkus, kg, jam) agar laporan mudah dibaca.'],
  ];
  const wsStart = XLSX.utils.aoa_to_sheet(startHereData);
  XLSX.utils.book_append_sheet(wb, wsStart, 'Mulai di Sini');

  // 2. Produk
  const productsData = [
    ['ID', 'Nama Produk', 'Untung per Unit (Rp)', 'Satuan', 'Hanya Jumlah Utuh (Ya/Tidak)'],
    ['p1', 'Roti Tawar', 6000, 'bungkus', 'Ya'],
    ['p2', 'Roti Manis', 9000, 'bungkus', 'Ya'],
  ];
  const wsProd = XLSX.utils.aoa_to_sheet(productsData);
  XLSX.utils.book_append_sheet(wb, wsProd, 'Produk');

  // 3. Sumber Daya
  const resourcesData = [
    ['ID', 'Nama Sumber Daya', 'Kapasitas', 'Satuan', 'Tipe Batasan'],
    ['r1', 'Tepung Terigu', 120, 'kg', 'Tidak boleh lebih dari'],
    ['r2', 'Mentega', 45, 'kg', 'Tidak boleh lebih dari'],
    ['r3', 'Kapasitas Oven', 50, 'jam', 'Tidak boleh lebih dari'],
  ];
  const wsRes = XLSX.utils.aoa_to_sheet(resourcesData);
  XLSX.utils.book_append_sheet(wb, wsRes, 'Sumber Daya');

  // 4. Pemakaian
  const usageData = [
    ['ID Produk', 'Nama Produk', 'Tepung Terigu (kg)', 'Mentega (kg)', 'Kapasitas Oven (jam)'],
    ['p1', 'Roti Tawar', 0.25, 0.05, 0.08],
    ['p2', 'Roti Manis', 0.2, 0.12, 0.1],
  ];
  const wsUsage = XLSX.utils.aoa_to_sheet(usageData);
  XLSX.utils.book_append_sheet(wb, wsUsage, 'Pemakaian');

  XLSX.writeFile(wb, 'Template_Optimasi_Bisnis.xlsx');
}
