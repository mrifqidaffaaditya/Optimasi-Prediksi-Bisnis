// ============================================================================
// SISTEM OPTIMASI PERENCANAAN PRODUKSI (TERVERIFIKASI BEBAS ERROR)
// Metode: Pemrograman Linear Simpleks & Eliminasi Gauss-Jordan
// Terintegrasi dengan Web Dashboard: https://opb.keidev.my.id
// DEFINISI TIPE DATA OPTIMASI BISNIS (RAMAH & MUDAH DIPAHAMI NON-IT)
// ============================================================================

/**
 * Tipe Tujuan Bisnis yang ingin dicapai klien:
 * - MAKSIMALKAN_UNTUNG: Menghasilkan laba bersih sebesar-besarnya dari penjualan.
 * - MINIMALKAN_BIAYA: Menekan seluruh pengeluaran operasional serendah-rendahnya.
 */
export type TipeTujuan =
  | 'MAKSIMALKAN_UNTUNG'
  | 'MINIMALKAN_BIAYA'
  | 'MAXIMIZE_PROFIT'
  | 'MINIMIZE_COST';
export type ObjectiveType = TipeTujuan;

/**
 * Jenis Batasan Operasional Sumber Daya:
 * - TIDAK_LEBIH_DARI (<= / LEQ): Pemakaian tidak boleh melampaui kapasitas (contoh: stok bahan, jam oven).
 * - PALING_SEDIKIT (>= / GEQ): Pemakaian minimal yang wajib dipenuhi (contoh: kontrak minimal pelanggan).
 * - HARUS_TEPAT (== / EQ): Pemakaian yang harus persis sesuai alokasi target.
 */
export type JenisBatasan =
  | 'TIDAK_LEBIH_DARI'
  | 'PALING_SEDIKIT'
  | 'HARUS_TEPAT'
  | 'LEQ'
  | 'GEQ'
  | 'EQ';
export type ConstraintType = JenisBatasan;

/**
 * Struktur Data Kendala C++:
 * Sesuai struct DataKendala pada kode C++ Sistem Optimasi
 */
export interface DataKendala {
  namaKendala: string;
  satuanKendala: string;
  kebutuhanPerProduk: number[]; // Kebutuhan sumber daya untuk 1 unit tiap produk
  tandaBatas: '<=' | '>=' | '==' | string; // "<=" (batas maksimal) atau ">=" (target minimal)
  batasKapasitas: number; // Total kapasitas sumber daya yang tersedia
}

/**
 * Produk atau Pilihan Layanan Usaha:
 * Barang atau jasa yang diproduksi dan dijual oleh bisnis klien.
 */
export interface Produk {
  id: string; // Kode pengenal produk (contoh: 'p1')
  nama: string; // Nama produk yang ramah dibaca (contoh: 'Kemeja Batik')
  keuntungan: number; // Untung per unit (contoh: 65000)
  satuan: string; // Satuan fisik produk (contoh: 'potong', 'bungkus')
  hanyaJumlahUtuh: boolean; // True jika produk tidak bisa dijual pecahan (wajib bilangan bulat)

  // Kompatibilitas properti
  name?: string;
  profit?: number;
  unit?: string;
  integerOnly?: boolean;
}
export type Product = Produk;

/**
 * Sumber Daya & Kapasitas Operasional Usaha:
 * Keterbatasan nyata seperti bahan baku, jam kerja, jam mesin, atau anggaran.
 */
export interface SumberDaya {
  id: string; // Kode pengenal sumber daya (contoh: 'r1')
  nama: string; // Nama sumber daya (contoh: 'Bahan Baku Kain', 'Jam Kerja Jahit')
  kapasitas: number; // Jumlah kapasitas maksimal/tersedia saat ini (contoh: 95.0)
  satuan: string; // Satuan sumber daya (contoh: 'meter', 'jam', 'kg')
  jenisBatasan: JenisBatasan; // Aturan batasan (tidak boleh melebihi, dll.)

  // Kompatibilitas properti
  name?: string;
  capacity?: number;
  unit?: string;
  type?: JenisBatasan;
}
export type Resource = SumberDaya;

/**
 * Matriks Pemakaian Bahan / Waktu:
 * Format: matriksPemakaian[idProduk][idSumberDaya] = jumlahKebutuhan
 */
export type MatriksPemakaian = {
  [idProduk: string]: {
    [idSumberDaya: string]: number;
  };
};
export type UsageMatrix = MatriksPemakaian;

/**
 * Status Hasil Perhitungan Optimasi:
 */
export type StatusSolusi =
  | 'OPTIMAL'
  | 'TIDAK_LAYAK'
  | 'TANPA_BATAS'
  | 'WAKTU_HABIS'
  | 'INFEASIBLE'
  | 'UNBOUNDED'
  | 'TIMEOUT';
export type SolverStatus = StatusSolusi;

/**
 * Rincian Rekomendasi Produksi untuk Tiap Produk
 */
export interface HasilProduk {
  id: string;
  nama: string;
  jumlahProduksi: number; // Rekomendasi jumlah unit yang ideal diproduksi
  satuan: string;
  keuntunganPerUnit: number;
  kontribusiKeuntungan: number; // Total untung dari produk ini (jumlahProduksi * keuntunganPerUnit)
  persentaseTotal: number; // Porsi kontribusi terhadap total keuntungan (%)

  // Kompatibilitas properti
  name?: string;
  quantity?: number;
  unit?: string;
  profitPerUnit?: number;
  contribution?: number;
  percentageOfTotal?: number;
}
export type ProductResult = HasilProduk;

/**
 * Rincian Analisis Pemakaian untuk Tiap Sumber Daya
 */
export interface HasilSumberDaya {
  id: string;
  nama: string;
  kapasitasTerpakai: number; // Jumlah yang terpakai pada solusi optimal
  kapasitasTersedia: number; // Total kapasitas yang dimiliki
  satuan: string;
  sisaKapasitas: number; // Sisa bahan/waktu yang belum terpakai (Slack)
  terpakaiPenuh: boolean; // Apakah habis 100% dan jadi penghambat utama (Binding / Bottleneck)
  persentasePemakaian: number; // Keterpakaian dalam persen (%)
  nilaiTambahPerUnit: number; // Potensi kenaikan laba jika kapasitas ditambah 1 unit (Shadow Price)
  jenisBatasan: JenisBatasan;

  // Kompatibilitas properti
  name?: string;
  used?: number;
  capacity?: number;
  unit?: string;
  slack?: number;
  binding?: boolean;
  usagePercent?: number;
  shadowPrice?: number;
  type?: JenisBatasan;
}
export type ResourceResult = HasilSumberDaya;

/**
 * Penjelasan Batasan yang Saling Bertabrakan
 */
export interface BatasanBertabrakan {
  idSumberDaya: string;
  nama: string;
  alasan: string;
  saranPerbaikan: string;
  saranKapasitas: number;

  // Kompatibilitas properti
  resourceId?: string;
  reason?: string;
  suggestedFix?: string;
  suggestedCapacity?: number;
}
export type ConflictingConstraint = BatasanBertabrakan;

export interface TitikSudut2D {
  x: number;
  y: number;
  nilai: number;
  apakahOptimal: boolean;
  keterangan?: string;

  // Kompatibilitas properti
  value?: number;
  isOptimal?: boolean;
  label?: string;
}
export type CornerPoint2D = TitikSudut2D;

export interface GarisBatasan2D {
  idSumberDaya: string;
  nama: string;
  koefisienX: number; // a
  koefisienY: number; // b
  kapasitasC: number; // c
  jenisBatasan: JenisBatasan;
  warna: string;

  // Kompatibilitas properti
  resourceId?: string;
  name?: string;
  a?: number;
  b?: number;
  c?: number;
  type?: JenisBatasan;
  color?: string;
}

export interface Geometri2D {
  apakah2D: boolean;
  produkX: Produk;
  produkY: Produk;
  poligonAreaLayak: [number, number][]; // Koordinat area produksi yang aman dijalankan
  daftarTitikSudut: TitikSudut2D[];
  titikOptimal: [number, number];
  batasMaksimal: { x: number; y: number };
  daftarGarisBatasan: GarisBatasan2D[];

  // Kompatibilitas properti
  is2D?: boolean;
  productX?: Produk;
  productY?: Produk;
  feasiblePolygon?: [number, number][];
  cornerPoints?: TitikSudut2D[];
  optimalPoint?: [number, number];
  maxBounds?: { x: number; y: number };
  constraintLines?: GarisBatasan2D[];
}
export type Geometry2D = Geometri2D;

/**
 * Log Langkah-Langkah Iterasi Simpleks & Tabel Matriks
 * Sesuai pencetakan tabel matriks per iterasi pada C++
 */
export interface IterasiSimpleksLog {
  nomorIterasi: number;
  labelKolom: string[];
  labelBarisBasis: string[];
  tabelMatriks: number[][];
  variabelMasuk?: string;
  nilaiTujuanTerkecil?: number;
  variabelKeluar?: string;
  rasioPembatasTerkecil?: number;
  angkaPivotUtama?: number;
  catatanOperasi?: string;
}

export interface LogPerhitunganLengkap {
  pesanLog: string[];
  daftarIterasi: IterasiSimpleksLog[];
  verifikasiKendala: {
    namaKendala: string;
    terpakai: number;
    tandaBatas: string;
    batasKapasitas: number;
    satuan: string;
    apakahAman: boolean;
  }[];
  titikPotongSPL?: {
    garis1: string;
    garis2: string;
    x1: number;
    x2: number;
  };
}

/**
 * Solusi Lengkap Optimasi Bisnis
 */
export interface SolusiBisnis {
  status: StatusSolusi;
  totalNilai: number; // Total untung maksimal atau biaya minimum
  tipeTujuan: TipeTujuan;
  daftarProduk: HasilProduk[];
  daftarSumberDaya: HasilSumberDaya[];
  kalimatKesimpulan: string; // 1 kalimat kesimpulan eksekutif yang ramah non-IT
  penghambatUtama?: HasilSumberDaya; // Faktor penghambat utama laba bisnis
  daftarBatasanBertabrakan?: BatasanBertabrakan[];
  geometri2D?: Geometri2D;
  waktuPerhitunganMs: number; // Waktu komputasi dalam milidetik (<100ms)
  logPerhitungan?: LogPerhitunganLengkap; // Langkah-langkah detail simpleks C++

  // Kompatibilitas properti
  objectiveValue?: number;
  objectiveType?: TipeTujuan;
  products?: HasilProduk[];
  resources?: HasilSumberDaya[];
  conclusionSentence?: string;
  topBottleneck?: HasilSumberDaya;
  conflictingConstraints?: BatasanBertabrakan[];
  calculationTimeMs?: number;
}
export type Solution = SolusiBisnis;

/**
 * Skenario Bisnis untuk Disimpan dan Dibandingkan Berdampingan
 */
export interface SkenarioBisnis {
  id: string;
  nama: string;
  waktuDibuat: string;
  tujuanBisnis: TipeTujuan;
  daftarProduk: Produk[];
  daftarSumberDaya: SumberDaya[];
  matriksPemakaian: MatriksPemakaian;
  solusiBisnis: SolusiBisnis;

  // Kompatibilitas properti
  name?: string;
  createdAt?: string;
  objective?: TipeTujuan;
  products?: Produk[];
  resources?: SumberDaya[];
  usage?: MatriksPemakaian;
  solution?: SolusiBisnis;
}
export type Scenario = SkenarioBisnis;

export interface PengaturanAI {
  penyedia: 'openai' | 'groq' | 'openrouter' | 'deepseek' | 'ollama' | 'gemini' | 'local';
  kunciAPI: string;
  urlBasis: string;
  namaModel: string;
  apakahLokal: boolean;

  // Kompatibilitas properti
  provider?: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  isLocal?: boolean;
}
export type AISettings = PengaturanAI;

export interface TemplatBisnis {
  id: string;
  nama: string;
  kategori: string;
  deskripsi: string;
  tujuanBisnis: TipeTujuan;
  daftarProduk: Produk[];
  daftarSumberDaya: SumberDaya[];
  matriksPemakaian: MatriksPemakaian;

  // Kompatibilitas properti
  name?: string;
  category?: string;
  description?: string;
  objective?: TipeTujuan;
  products?: Produk[];
  resources?: SumberDaya[];
  usage?: MatriksPemakaian;
}
export type BusinessTemplate = TemplatBisnis;
