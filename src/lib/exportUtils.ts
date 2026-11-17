// ============================================================================
// UTILITAS EKSPOR & DOKUMEN LAPORAN BISNIS
// Diformat ramah untuk bahan rapat direksi, UMKM, dan perbankan
// ============================================================================

import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import { Produk, SumberDaya, MatriksPemakaian, SolusiBisnis, TipeTujuan } from '@/types';
import { formatMataUangRupiah, formatAngka } from '@/lib/formatters';

/**
 * Ekspor Lembar Kerja Excel Multi-Sheet (PRD 6)
 * Berisi 4 lembar: Ringkasan, Rencana Produksi, Pemakaian Sumber Daya, dan Data Input.
 */
export function eksporKeExcel(
  tujuanBisnis: TipeTujuan,
  daftarProduk: Produk[],
  daftarSumberDaya: SumberDaya[],
  matriksPemakaian: MatriksPemakaian,
  solusi: SolusiBisnis,
  namaPerusahaan: string = 'Usaha Saya'
) {
  const bukuKerja = XLSX.utils.book_new();

  const apakahMaksimalkan =
    tujuanBisnis === 'MAKSIMALKAN_UNTUNG' || tujuanBisnis === 'MAXIMIZE_PROFIT';
  const totalNilai = solusi.totalNilai ?? solusi.objectiveValue ?? 0;
  const kalimatKesimpulan = solusi.kalimatKesimpulan || solusi.conclusionSentence || '';
  const produkSolusi = solusi.daftarProduk || solusi.products || [];
  const sumberDayaSolusi = solusi.daftarSumberDaya || solusi.resources || [];
  const penghambatUtama = solusi.penghambatUtama || solusi.topBottleneck;

  // 1. Lembar Ringkasan Eksekutif
  const dataRingkasan = [
    ['RINGKASAN REKOMENDASI OPTIMASI BISNIS'],
    ['Nama Usaha / Proyek', namaPerusahaan],
    ['Tanggal Pembuatan', new Date().toLocaleString('id-ID')],
    ['Tujuan Bisnis', apakahMaksimalkan ? 'Maksimalkan Untung' : 'Minimalkan Biaya'],
    ['Status Solusi', solusi.status === 'OPTIMAL' ? 'Rekomendasi Berhasil Ditemukan' : solusi.status],
    [
      apakahMaksimalkan ? 'Total Proyeksi Untung Maksimal' : 'Total Proyeksi Biaya Minimum',
      formatMataUangRupiah(totalNilai),
    ],
    ['Kesimpulan Bisnis', kalimatKesimpulan],
    [],
    [
      'Faktor Penghambat Utama',
      penghambatUtama ? `${penghambatUtama.nama || penghambatUtama.name} (Terpakai Penuh)` : '-',
    ],
    [
      'Nilai Tambah per 1 Unit Tambahan',
      penghambatUtama
        ? formatMataUangRupiah(penghambatUtama.nilaiTambahPerUnit ?? penghambatUtama.shadowPrice ?? 0)
        : '-',
    ],
  ];
  const lembarRingkasan = XLSX.utils.aoa_to_sheet(dataRingkasan);
  XLSX.utils.book_append_sheet(bukuKerja, lembarRingkasan, 'Ringkasan');

  // 2. Lembar Rencana Produksi
  const dataProduksi = [
    [
      'Nama Produk',
      'Rekomendasi Jumlah',
      'Satuan',
      'Untung / Biaya per Unit',
      'Kontribusi Total',
      'Porsi dari Total (%)',
    ],
    ...produkSolusi.map((p) => [
      p.nama || p.name,
      p.jumlahProduksi ?? p.quantity ?? 0,
      p.satuan || p.unit,
      p.keuntunganPerUnit ?? p.profitPerUnit ?? 0,
      p.kontribusiKeuntungan ?? p.contribution ?? 0,
      `${p.persentaseTotal ?? p.percentageOfTotal ?? 0}%`,
    ]),
  ];
  const lembarProduksi = XLSX.utils.aoa_to_sheet(dataProduksi);
  XLSX.utils.book_append_sheet(bukuKerja, lembarProduksi, 'Rencana Produksi');

  // 3. Lembar Pemakaian Sumber Daya
  const dataSumberDaya = [
    [
      'Sumber Daya',
      'Kapasitas Tersedia',
      'Kapasitas Terpakai',
      'Sisa Kapasitas',
      'Satuan',
      'Persentase Terpakai (%)',
      'Status Keterpakaian',
      'Nilai Tambah per 1 Unit Tambahan',
    ],
    ...sumberDayaSolusi.map((r) => {
      const terpakaiPenuh = r.terpakaiPenuh ?? r.binding ?? false;
      const nilaiTambah = r.nilaiTambahPerUnit ?? r.shadowPrice ?? 0;
      return [
        r.nama || r.name,
        r.kapasitasTersedia ?? r.capacity ?? 0,
        r.kapasitasTerpakai ?? r.used ?? 0,
        r.sisaKapasitas ?? r.slack ?? 0,
        r.satuan || r.unit,
        `${r.persentasePemakaian ?? r.usagePercent ?? 0}%`,
        terpakaiPenuh ? 'Terpakai Penuh (Faktor Penghambat)' : 'Aman (Masih Bersisa)',
        nilaiTambah > 0 ? formatMataUangRupiah(nilaiTambah) : 'Rp 0',
      ];
    }),
  ];
  const lembarSumberDaya = XLSX.utils.aoa_to_sheet(dataSumberDaya);
  XLSX.utils.book_append_sheet(bukuKerja, lembarSumberDaya, 'Pemakaian Sumber Daya');

  // 4. Lembar Data Input (Dapat diunggah kembali tanpa perubahan - PRD 6)
  const dataInput = [
    ['[PRODUK]'],
    ['ID', 'Nama Produk', 'Untung per Unit', 'Satuan', 'Hanya Jumlah Utuh (Ya/Tidak)'],
    ...daftarProduk.map((p) => [
      p.id,
      p.nama || p.name,
      p.keuntungan ?? p.profit ?? 0,
      p.satuan || p.unit,
      (p.hanyaJumlahUtuh ?? p.integerOnly) ? 'Ya' : 'Tidak',
    ]),
    [],
    ['[SUMBER DAYA]'],
    ['ID', 'Nama Sumber Daya', 'Kapasitas', 'Satuan', 'Tipe Batasan'],
    ...daftarSumberDaya.map((r) => {
      const jenis = r.jenisBatasan || r.type || 'TIDAK_LEBIH_DARI';
      const jenisTeks =
        jenis === 'PALING_SEDIKIT' || jenis === 'GEQ'
          ? 'Paling sedikit'
          : jenis === 'HARUS_TEPAT' || jenis === 'EQ'
          ? 'Harus tepat'
          : 'Tidak boleh lebih dari';
      return [r.id, r.nama || r.name, r.kapasitas ?? r.capacity ?? 0, r.satuan || r.unit, jenisTeks];
    }),
    [],
    ['[PEMAKAIAN PER UNIT]'],
    ['ID Produk', 'Nama Produk', ...daftarSumberDaya.map((r) => `${r.nama || r.name} (${r.satuan || r.unit})`)],
    ...daftarProduk.map((p) => [
      p.id,
      p.nama || p.name,
      ...daftarSumberDaya.map((r) => matriksPemakaian[p.id]?.[r.id] ?? 0),
    ]),
  ];
  const lembarInput = XLSX.utils.aoa_to_sheet(dataInput);
  XLSX.utils.book_append_sheet(bukuKerja, lembarInput, 'Data Input');

  // Simpan berkas Excel
  const namaBerkas = `Rencana_Optimasi_Bisnis_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(bukuKerja, namaBerkas);
}
export const exportToExcel = eksporKeExcel;

/**
 * Ekspor Data CSV dengan UTF-8 BOM dan proteksi injeksi formula Excel (PRD 6 & 12)
 */
export function eksporKeCSV(solusi: SolusiBisnis, tujuanBisnis: TipeTujuan) {
  const sanitasiTeks = (nilai: any) => {
    const teks = String(nilai ?? '');
    if (/^[=+@-].*/.test(teks)) {
      return `'${teks}`; // Mencegah eksekusi rumus berbahaya di spreadsheet
    }
    return teks;
  };

  const apakahMaksimalkan =
    tujuanBisnis === 'MAKSIMALKAN_UNTUNG' || tujuanBisnis === 'MAXIMIZE_PROFIT';
  const totalNilai = solusi.totalNilai ?? solusi.objectiveValue ?? 0;
  const kalimatKesimpulan = solusi.kalimatKesimpulan || solusi.conclusionSentence || '';
  const produkSolusi = solusi.daftarProduk || solusi.products || [];
  const sumberDayaSolusi = solusi.daftarSumberDaya || solusi.resources || [];

  const barisData = [
    ['--- HASIL REKOMENDASI OPTIMASI BISNIS ---'],
    ['Tujuan Bisnis', apakahMaksimalkan ? 'Maksimalkan Untung' : 'Minimalkan Biaya'],
    ['Status Solusi', solusi.status],
    ['Total Nilai Proyeksi', formatMataUangRupiah(totalNilai)],
    ['Kesimpulan', sanitasiTeks(kalimatKesimpulan)],
    [],
    ['--- RENCANA PRODUKSI ---'],
    ['Nama Produk', 'Jumlah Rekomendasi', 'Satuan', 'Untung per Unit', 'Kontribusi Total', 'Porsi (%)'],
    ...produkSolusi.map((p) => [
      sanitasiTeks(p.nama || p.name),
      p.jumlahProduksi ?? p.quantity ?? 0,
      sanitasiTeks(p.satuan || p.unit),
      p.keuntunganPerUnit ?? p.profitPerUnit ?? 0,
      p.kontribusiKeuntungan ?? p.contribution ?? 0,
      p.persentaseTotal ?? p.percentageOfTotal ?? 0,
    ]),
    [],
    ['--- PEMAKAIAN KAPASITAS SUMBER DAYA ---'],
    ['Sumber Daya', 'Kapasitas', 'Terpakai', 'Sisa', 'Satuan', 'Penggunaan (%)', 'Status'],
    ...sumberDayaSolusi.map((r) => {
      const terpakaiPenuh = r.terpakaiPenuh ?? r.binding ?? false;
      return [
        sanitasiTeks(r.nama || r.name),
        r.kapasitasTersedia ?? r.capacity ?? 0,
        r.kapasitasTerpakai ?? r.used ?? 0,
        r.sisaKapasitas ?? r.slack ?? 0,
        sanitasiTeks(r.satuan || r.unit),
        r.persentasePemakaian ?? r.usagePercent ?? 0,
        terpakaiPenuh ? 'Terpakai Penuh' : 'Bersisa',
      ];
    }),
  ];

  const csv = Papa.unparse(barisData);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const tautanUrl = URL.createObjectURL(blob);
  const elemenA = document.createElement('a');
  elemenA.href = tautanUrl;
  elemenA.download = `Optimasi_Bisnis_${new Date().toISOString().slice(0, 10)}.csv`;
  elemenA.click();
  URL.revokeObjectURL(tautanUrl);
}
export const exportToCSV = eksporKeCSV;

/**
 * Ekspor Dokumen Laporan PDF Resmi Siap Dibawa ke Rapat Bisnis (PRD 7.2)
 */
export function eksporKePDF(
  tujuanBisnis: TipeTujuan,
  solusi: SolusiBisnis,
  namaPerusahaan: string = 'Laporan Eksekutif Optimasi Bisnis'
) {
  const dokumen = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const apakahMaksimalkan =
    tujuanBisnis === 'MAKSIMALKAN_UNTUNG' || tujuanBisnis === 'MAXIMIZE_PROFIT';
  const totalNilai = solusi.totalNilai ?? solusi.objectiveValue ?? 0;
  const kalimatKesimpulan = solusi.kalimatKesimpulan || solusi.conclusionSentence || '';
  const produkSolusi = solusi.daftarProduk || solusi.products || [];
  const sumberDayaSolusi = solusi.daftarSumberDaya || solusi.resources || [];

  // Kepala Dokumen (Header)
  dokumen.setFillColor(31, 78, 95); // Warna aksen biru tua profesional
  dokumen.rect(0, 0, 210, 24, 'F');

  dokumen.setTextColor(255, 255, 255);
  dokumen.setFontSize(14);
  dokumen.setFont('helvetica', 'bold');
  dokumen.text(namaPerusahaan, 14, 15);

  dokumen.setFontSize(9);
  dokumen.setFont('helvetica', 'normal');
  dokumen.text(`Dibuat: ${new Date().toLocaleDateString('id-ID')}`, 160, 15);

  // Kartu Ringkasan Eksekutif
  dokumen.setTextColor(22, 32, 42);
  dokumen.setFontSize(16);
  dokumen.setFont('helvetica', 'bold');
  dokumen.text('Ringkasan Rekomendasi Bisnis', 14, 38);

  dokumen.setFillColor(247, 246, 243);
  dokumen.roundedRect(14, 44, 182, 32, 2, 2, 'F');

  dokumen.setFontSize(11);
  dokumen.setFont('helvetica', 'bold');
  dokumen.text(
    apakahMaksimalkan ? 'Proyeksi Keuntungan Maksimal:' : 'Proyeksi Biaya Operasional Minimum:',
    20,
    54
  );
  dokumen.setTextColor(47, 125, 87);
  dokumen.setFontSize(16);
  dokumen.text(formatMataUangRupiah(totalNilai), 20, 62);

  dokumen.setTextColor(91, 102, 114);
  dokumen.setFontSize(9);
  dokumen.setFont('helvetica', 'normal');
  const barisKesimpulan = dokumen.splitTextToSize(kalimatKesimpulan, 170);
  dokumen.text(barisKesimpulan, 20, 70);

  // Tabel Rencana Produksi
  let posisiY = 88;
  dokumen.setTextColor(22, 32, 42);
  dokumen.setFontSize(13);
  dokumen.setFont('helvetica', 'bold');
  dokumen.text('1. Rencana Produksi yang Direkomendasikan', 14, posisiY);

  posisiY += 6;
  dokumen.setFillColor(227, 225, 219);
  dokumen.rect(14, posisiY, 182, 8, 'F');
  dokumen.setFontSize(9);
  dokumen.setFont('helvetica', 'bold');
  dokumen.text('Nama Produk', 16, posisiY + 5.5);
  dokumen.text('Jumlah Rekomendasi', 80, posisiY + 5.5);
  dokumen.text('Untung / Unit', 125, posisiY + 5.5);
  dokumen.text('Kontribusi Total', 160, posisiY + 5.5);

  posisiY += 8;
  dokumen.setFont('helvetica', 'normal');
  produkSolusi.forEach((p, idx) => {
    if (idx % 2 === 1) {
      dokumen.setFillColor(250, 250, 248);
      dokumen.rect(14, posisiY, 182, 7, 'F');
    }
    const jumlah = p.jumlahProduksi ?? p.quantity ?? 0;
    const untungUnit = p.keuntunganPerUnit ?? p.profitPerUnit ?? 0;
    const kontribusi = p.kontribusiKeuntungan ?? p.contribution ?? 0;
    dokumen.text(p.nama || p.name || 'Produk', 16, posisiY + 5);
    dokumen.text(`${formatAngka(jumlah)} ${p.satuan || p.unit}`, 80, posisiY + 5);
    dokumen.text(formatMataUangRupiah(untungUnit), 125, posisiY + 5);
    dokumen.text(formatMataUangRupiah(kontribusi), 160, posisiY + 5);
    posisiY += 7;
  });

  // Tabel Pemakaian Sumber Daya
  posisiY += 8;
  dokumen.setFontSize(13);
  dokumen.setFont('helvetica', 'bold');
  dokumen.text('2. Pemakaian Kapasitas Sumber Daya', 14, posisiY);

  posisiY += 6;
  dokumen.setFillColor(227, 225, 219);
  dokumen.rect(14, posisiY, 182, 8, 'F');
  dokumen.setFontSize(9);
  dokumen.setFont('helvetica', 'bold');
  dokumen.text('Sumber Daya', 16, posisiY + 5.5);
  dokumen.text('Kapasitas', 65, posisiY + 5.5);
  dokumen.text('Terpakai', 95, posisiY + 5.5);
  dokumen.text('Sisa Kapasitas', 130, posisiY + 5.5);
  dokumen.text('Status', 165, posisiY + 5.5);

  posisiY += 8;
  dokumen.setFont('helvetica', 'normal');
  sumberDayaSolusi.forEach((r, idx) => {
    if (idx % 2 === 1) {
      dokumen.setFillColor(250, 250, 248);
      dokumen.rect(14, posisiY, 182, 7, 'F');
    }
    const cap = r.kapasitasTersedia ?? r.capacity ?? 0;
    const used = r.kapasitasTerpakai ?? r.used ?? 0;
    const slack = r.sisaKapasitas ?? r.slack ?? 0;
    const terpakaiPenuh = r.terpakaiPenuh ?? r.binding ?? false;

    dokumen.text(r.nama || r.name || 'Sumber Daya', 16, posisiY + 5);
    dokumen.text(`${formatAngka(cap)} ${r.satuan || r.unit}`, 65, posisiY + 5);
    dokumen.text(`${formatAngka(used)} ${r.satuan || r.unit}`, 95, posisiY + 5);
    dokumen.text(`${formatAngka(slack)} ${r.satuan || r.unit}`, 130, posisiY + 5);

    if (terpakaiPenuh) {
      dokumen.setTextColor(179, 56, 44);
      dokumen.text('Terpakai Penuh', 165, posisiY + 5);
      dokumen.setTextColor(22, 32, 42);
    } else {
      dokumen.setTextColor(47, 125, 87);
      dokumen.text('Aman (Bersisa)', 165, posisiY + 5);
      dokumen.setTextColor(22, 32, 42);
    }
    posisiY += 7;
  });

  // Catatan Kaki (Footer)
  posisiY += 12;
  dokumen.setFontSize(8);
  dokumen.setTextColor(91, 102, 114);
  dokumen.text(
    'Catatan: Laporan ini dihitung secara langsung di perangkat browser Anda (client-side) tanpa menyimpan data bisnis ke server publik.',
    14,
    posisiY
  );

  dokumen.save(`Laporan_Rekomendasi_Bisnis_${new Date().toISOString().slice(0, 10)}.pdf`);
}
export const exportToPDF = eksporKePDF;

/**
 * Mengunduh Berkas Template Excel Kosong untuk Diisi Pengguna (PRD 6.1)
 */
export function unduhTemplatExcel() {
  const bukuKerja = XLSX.utils.book_new();

  // 1. Lembar Mulai di Sini
  const dataMulai = [
    ['PANDUAN MENGISI TEMPLATE OPTIMASI BISNIS'],
    [],
    ['Langkah 1: Buka lembar "Produk", isi nama produk dan keuntungan per unit.'],
    ['Langkah 2: Buka lembar "Sumber Daya", tentukan batasan bahan baku atau jam kerja.'],
    ['Langkah 3: Buka lembar "Pemakaian", isi berapa kebutuhan bahan untuk tiap produk.'],
    ['Langkah 4: Simpan berkas ini dan unggah kembali ke aplikasi web.'],
    [],
    ['PETUNJUK FORMAT PENTING:'],
    ['- Gunakan angka standar (contoh: 5000 atau 0.5) tanpa titik ribuan di dalam sel angka.'],
    ['- Selalu lengkapi kolom satuan (contoh: bungkus, kg, jam) agar laporan mudah dibaca.'],
  ];
  const lembarMulai = XLSX.utils.aoa_to_sheet(dataMulai);
  XLSX.utils.book_append_sheet(bukuKerja, lembarMulai, 'Mulai di Sini');

  // 2. Lembar Produk
  const dataProduk = [
    ['ID', 'Nama Produk', 'Untung per Unit (Rp)', 'Satuan', 'Hanya Jumlah Utuh (Ya/Tidak)'],
    ['p1', 'Roti Tawar', 6000, 'bungkus', 'Ya'],
    ['p2', 'Roti Manis', 9000, 'bungkus', 'Ya'],
  ];
  const lembarProduk = XLSX.utils.aoa_to_sheet(dataProduk);
  XLSX.utils.book_append_sheet(bukuKerja, lembarProduk, 'Produk');

  // 3. Lembar Sumber Daya
  const dataSumberDaya = [
    ['ID', 'Nama Sumber Daya', 'Kapasitas', 'Satuan', 'Tipe Batasan'],
    ['r1', 'Tepung Terigu', 120, 'kg', 'Tidak boleh lebih dari'],
    ['r2', 'Mentega', 45, 'kg', 'Tidak boleh lebih dari'],
    ['r3', 'Kapasitas Oven', 50, 'jam', 'Tidak boleh lebih dari'],
  ];
  const lembarSumberDaya = XLSX.utils.aoa_to_sheet(dataSumberDaya);
  XLSX.utils.book_append_sheet(bukuKerja, lembarSumberDaya, 'Sumber Daya');

  // 4. Lembar Pemakaian
  const dataPemakaian = [
    ['ID Produk', 'Nama Produk', 'Tepung Terigu (kg)', 'Mentega (kg)', 'Kapasitas Oven (jam)'],
    ['p1', 'Roti Tawar', 0.25, 0.05, 0.08],
    ['p2', 'Roti Manis', 0.2, 0.12, 0.1],
  ];
  const lembarPemakaian = XLSX.utils.aoa_to_sheet(dataPemakaian);
  XLSX.utils.book_append_sheet(bukuKerja, lembarPemakaian, 'Pemakaian');

  XLSX.writeFile(bukuKerja, 'Template_Optimasi_Bisnis.xlsx');
}
export const downloadExcelTemplate = unduhTemplatExcel;

/**
 * Menyimpan Grafik SVG sebagai Berkas Vektor SVG Tajam
 */
export function unduhSvgSebagaiSVG(
  elemenSvg: SVGSVGElement,
  namaBerkas: string = 'grafik-area-produksi.svg'
) {
  const penyusunXml = new XMLSerializer();
  let kodeSumber = penyusunXml.serializeToString(elemenSvg);
  if (!kodeSumber.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    kodeSumber = kodeSumber.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  const blobSvg = new Blob([kodeSumber], { type: 'image/svg+xml;charset=utf-8' });
  const tautanUrl = URL.createObjectURL(blobSvg);
  const elemenA = document.createElement('a');
  elemenA.href = tautanUrl;
  elemenA.download = namaBerkas;
  document.body.appendChild(elemenA);
  elemenA.click();
  document.body.removeChild(elemenA);
  URL.revokeObjectURL(tautanUrl);
}
export const downloadSvgAsSVG = unduhSvgSebagaiSVG;

/**
 * Mengonversi dan Mengunduh Elemen SVG Menjadi Gambar PNG Resolusi Tinggi (Retina 2x)
 */
export function unduhSvgSebagaiPNG(
  elemenSvg: SVGSVGElement,
  namaBerkas: string = 'grafik-area-produksi.png'
) {
  const penyusunXml = new XMLSerializer();
  let kodeSumber = penyusunXml.serializeToString(elemenSvg);
  if (!kodeSumber.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    kodeSumber = kodeSumber.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  const blobSvg = new Blob([kodeSumber], { type: 'image/svg+xml;charset=utf-8' });
  const tautanUrl = URL.createObjectURL(blobSvg);
  const gambar = new Image();
  gambar.onload = () => {
    const kanvas = document.createElement('canvas');
    kanvas.width = 1120;
    kanvas.height = 800;
    const konteks = kanvas.getContext('2d');
    if (konteks) {
      konteks.fillStyle = '#FFFFFF';
      konteks.fillRect(0, 0, kanvas.width, kanvas.height);
      konteks.drawImage(gambar, 0, 0, kanvas.width, kanvas.height);
      const urlPng = kanvas.toDataURL('image/png');
      const elemenA = document.createElement('a');
      elemenA.href = urlPng;
      elemenA.download = namaBerkas;
      document.body.appendChild(elemenA);
      elemenA.click();
      document.body.removeChild(elemenA);
      URL.revokeObjectURL(tautanUrl);
    }
  };
  gambar.src = tautanUrl;
}
export const downloadSvgAsPNG = unduhSvgSebagaiPNG;
