export function formatRupiah(value: number): string {
  if (isNaN(value)) return 'Rp 0';
  const isNegative = value < 0;
  const absValue = Math.abs(Math.round(value));
  const formatted = new Intl.NumberFormat('id-ID').format(absValue);
  return `${isNegative ? '-' : ''}Rp ${formatted}`;
}

export function formatNumber(value: number, decimals: number = 1): string {
  if (isNaN(value)) return '0';
  // If it's an integer, don't show trailing zero
  if (Math.abs(value - Math.round(value)) < 0.01) {
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value);
  }
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number): string {
  if (isNaN(value)) return '0%';
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value) + '%';
}

export const BUSINESS_GLOSSARY: { [key: string]: { ui: string; explanation: string } } = {
  decisionVariable: {
    ui: 'Produk atau pilihan',
    explanation: 'Hal yang ingin Anda tentukan jumlah produksinya untuk mendapatkan hasil terbaik.',
  },
  constraint: {
    ui: 'Batasan',
    explanation: 'Keterbatasan sumber daya seperti bahan baku, jam kerja, atau kapasitas mesin.',
  },
  slack: {
    ui: 'Sisa kapasitas',
    explanation: 'Berapa banyak bahan atau jam kerja yang masih tersisa dan tidak terpakai.',
  },
  binding: {
    ui: 'Terpakai penuh (penghambat)',
    explanation: 'Sumber daya yang habis terpakai 100%. Ini adalah batas utama yang mencegah Anda untung lebih besar.',
  },
  feasibleRegion: {
    ui: 'Area yang memungkinkan',
    explanation: 'Kumpulan seluruh kombinasi produksi yang aman dan tidak melanggar batasan kapasitas apa pun.',
  },
  infeasible: {
    ui: 'Target tidak bisa dipenuhi',
    explanation: 'Kapasitas yang ada tidak mencukupi untuk memenuhi target minimal yang Anda tentukan.',
  },
  unbounded: {
    ui: 'Tanpa batas atas',
    explanation: 'Belum ada batasan kapasitas yang membatasi produksi sehingga perhitungan tidak memiliki batas akhir.',
  },
  shadowPrice: {
    ui: 'Nilai tambah per 1 unit kapasitas',
    explanation: 'Berapa tambahan keuntungan yang Anda dapatkan jika menambah 1 unit (misal 1 jam oven atau 1 kg tepung).',
  },
  tornadoChart: {
    ui: 'Faktor paling berpengaruh',
    explanation: 'Urutan sumber daya yang paling berharga jika kapasitasnya dinaikkan.',
  },
  whatIf: {
    ui: 'Bagaimana jika',
    explanation: 'Simulasi geser kapasitas untuk melihat perubahan keuntungan seketika sebelum mengambil keputusan nyata.',
  },
  robustnessTest: {
    ui: 'Uji ketahanan',
    explanation: 'Menguji apakah rencana produksi Anda tetap aman jika terjadi fluktuasi kapasitas (5%, 10%, atau 20%).',
  },
};
