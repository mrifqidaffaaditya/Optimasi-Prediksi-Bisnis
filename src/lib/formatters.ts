// ============================================================================
// FORMATTER & KAMUS ISTILAH BISNIS RAMAH NON-IT
// ============================================================================

/**
 * Format angka ke mata uang Rupiah Indonesia (Rp)
 * Contoh: 1500000 -> "Rp 1.500.000"
 */
export function formatMataUangRupiah(nilai: number): string {
  if (isNaN(nilai)) return 'Rp 0';
  const nilaiNegatif = nilai < 0;
  const nilaiAbsolut = Math.abs(Math.round(nilai));
  const formatAngka = new Intl.NumberFormat('id-ID').format(nilaiAbsolut);
  return `${nilaiNegatif ? '-' : ''}Rp ${formatAngka}`;
}
export const formatRupiah = formatMataUangRupiah;

/**
 * Format angka bilangan bulat atau pecahan desimal gaya Indonesia (koma untuk desimal)
 * Contoh: 125.5 -> "125,5"
 */
export function formatAngka(nilai: number, desimal: number = 1): string {
  if (isNaN(nilai)) return '0';
  // Jika bilangan bulat, tidak perlu menampilkan angka di belakang koma
  if (Math.abs(nilai - Math.round(nilai)) < 0.01) {
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(nilai);
  }
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: desimal,
  }).format(nilai);
}
export const formatNumber = formatAngka;

/**
 * Format persentase gaya Indonesia
 * Contoh: 45.2 -> "45,2%"
 */
export function formatPersen(nilai: number): string {
  if (isNaN(nilai)) return '0%';
  return (
    new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(nilai) + '%'
  );
}
export const formatPercent = formatPersen;

/**
 * Kamus Istilah Bisnis Non-IT:
 * Mengubah konsep riset operasi / program linear yang rumit menjadi bahasa usaha sehari-hari.
 */
export const KAMUS_ISTILAH_BISNIS: {
  [kunci: string]: { ui: string; explanation: string };
} = {
  decisionVariable: {
    ui: 'Produk atau Pilihan Usaha',
    explanation:
      'Barang atau jenis layanan yang ingin Anda tentukan berapa banyak jumlah produksinya agar menghasilkan laba tertinggi.',
  },
  constraint: {
    ui: 'Batasan Operasional',
    explanation:
      'Keterbatasan nyata di tempat usaha Anda, seperti persediaan bahan baku, jam operasional mesin, jam kerja karyawan, atau luas gudang.',
  },
  slack: {
    ui: 'Sisa Kapasitas',
    explanation:
      'Jumlah bahan mentah atau jam kerja yang masih tersisa (menganggur) dan belum terpakai pada rencana produksi ini.',
  },
  binding: {
    ui: 'Terpakai Penuh (Faktor Penghambat Utama)',
    explanation:
      'Sumber daya yang habis terpakai 100%. Inilah batas utama yang menahan bisnis Anda untuk meraup keuntungan yang lebih besar lagi.',
  },
  feasibleRegion: {
    ui: 'Area Produksi yang Aman',
    explanation:
      'Kumpulan seluruh kombinasi jumlah produksi yang aman dijalankan tanpa khawatir kehabisan bahan atau melebihi kapasitas jam kerja.',
  },
  infeasible: {
    ui: 'Target Belum Bisa Dipenuhi',
    explanation:
      'Kapasitas bahan baku atau waktu yang ada saat ini belum mencukupi untuk memenuhi target minimal produksi yang Anda inginkan.',
  },
  unbounded: {
    ui: 'Tanpa Batas Atas',
    explanation:
      'Belum ada batasan kapasitas yang membatasi produksi, sehingga perhitungan laba seolah-olah bisa bertambah terus tanpa henti.',
  },
  shadowPrice: {
    ui: 'Nilai Tambah per 1 Unit Kapasitas',
    explanation:
      'Perkiraan berapa rupiah tambahan keuntungan yang langsung Anda dapatkan jika menambah 1 unit kapasitas lagi (misal: tambah 1 jam oven atau 1 kg tepung).',
  },
  tornadoChart: {
    ui: 'Peringkat Sumber Daya Paling Berharga',
    explanation:
      'Urutan sumber daya dari yang paling menguntungkan jika kapasitasnya diperbesar atau ditambah.',
  },
  whatIf: {
    ui: 'Simulasi "Bagaimana Jika"',
    explanation:
      'Fitur untuk menguji skenario perubahan kapasitas (misal: menambah jam lembur atau menambah stok bahan) dan melihat perubahan laba secara seketika.',
  },
  robustnessTest: {
    ui: 'Uji Ketahanan Rencana Usaha',
    explanation:
      'Simulasi untuk menguji apakah rencana bisnis Anda tetap menghasilkan keuntungan jika pasokan bahan berkurang atau terhambat (stres 5%, 10%, atau 20%).',
  },
};
export const BUSINESS_GLOSSARY = KAMUS_ISTILAH_BISNIS;
