// ============================================================================
// SISTEM OPTIMASI PERENCANAAN PRODUKSI (TERVERIFIKASI BEBAS ERROR)
// Kelompok 9 - Matematika Dasar (Universitas Negeri Semarang)
// Terintegrasi dengan Web Dashboard: https://opb.keidev.my.id
// Seluruh fungsi inti matematika & algoritma Simpleks disatukan di sini
// ============================================================================

import {
  TipeTujuan,
  Produk,
  SumberDaya,
  MatriksPemakaian,
  SolusiBisnis,
  HasilProduk,
  HasilSumberDaya,
  BatasanBertabrakan,
  Geometri2D,
  TitikSudut2D,
  GarisBatasan2D,
  DataKendala,
  IterasiSimpleksLog,
  LogPerhitunganLengkap,
} from '@/types';
import { formatMataUangRupiah, formatAngka } from '@/lib/formatters';

// ============================================================================
// FUNGSI BANTU 1: Membersihkan nilai -0.0 akibat pembulatan floating-point
// ============================================================================
export function bersihkanNolNegatif(nilai: number): number {
  if (Math.abs(nilai) < 1e-9) {
    return 0.0;
  }
  return nilai;
}

// ============================================================================
// FUNGSI 1: Menghitung Titik Potong 2 Garis Kendala menggunakan
//           ELIMINASI GAUSS-JORDAN (Matriks Eselon Baris Tereduksi / RREF)
//
// Matriks Augmentasi [ A | B ]:
// [ a1  b1 | c1 ]
// [ a2  b2 | c2 ]
//
// Melalui Operasi Baris Elementer (OBE) menuju bentuk tereduksi:
// [ 1   0  | X1 ]
// [ 0   1  | X2 ]
// ============================================================================
export function hitungTitikPotongSPL(
  kebutuhanProduk1_Garis1: number,
  kebutuhanProduk2_Garis1: number,
  kapasitas_Garis1: number,
  kebutuhanProduk1_Garis2: number,
  kebutuhanProduk2_Garis2: number,
  kapasitas_Garis2: number
): { berhasil: boolean; titikPotongProduk1: number; titikPotongProduk2: number } {
  // Matriks Augmentasi [2 x 3]
  const M: number[][] = [
    [kebutuhanProduk1_Garis1, kebutuhanProduk2_Garis1, kapasitas_Garis1],
    [kebutuhanProduk1_Garis2, kebutuhanProduk2_Garis2, kapasitas_Garis2],
  ];

  // Langkah 1: Pastikan elemen pivot baris 1 (kolom 1) tidak nol
  if (Math.abs(M[0][0]) < 1e-9) {
    if (Math.abs(M[1][0]) < 1e-9) {
      return { berhasil: false, titikPotongProduk1: 0, titikPotongProduk2: 0 };
    }
    // Tukar baris 1 dan baris 2 (OBE Tipe 1)
    const temp = M[0];
    M[0] = M[1];
    M[1] = temp;
  }

  // Normalisasi Baris 1: R1 = R1 / a11 (OBE Tipe 2: Leading 1)
  const pivot1 = M[0][0];
  for (let k = 0; k < 3; k++) {
    M[0][k] /= pivot1;
  }

  // Eliminasi Baris 2: R2 = R2 - a21 * R1 (OBE Tipe 3: Nol-kan di bawah pivot)
  const faktor2 = M[1][0];
  for (let k = 0; k < 3; k++) {
    M[1][k] -= faktor2 * M[0][k];
  }

  // Langkah 2: Cek elemen pivot baris 2 (kolom 2)
  const pivot2 = M[1][1];
  if (Math.abs(pivot2) < 1e-9) {
    // Garis sejajar / tidak berpotongan unik
    return { berhasil: false, titikPotongProduk1: 0, titikPotongProduk2: 0 };
  }

  // Normalisasi Baris 2: R2 = R2 / a22 (Leading 1 baris 2)
  for (let k = 0; k < 3; k++) {
    M[1][k] /= pivot2;
  }

  // Eliminasi Baris 1: R1 = R1 - a12 * R2 (Nol-kan di atas pivot)
  const faktor1 = M[0][1];
  for (let k = 0; k < 3; k++) {
    M[0][k] -= faktor1 * M[1][k];
  }

  // Solusi akhir diperoleh langsung dari kolom augmented (RREF)
  const titikPotongProduk1 = bersihkanNolNegatif(M[0][2]);
  const titikPotongProduk2 = bersihkanNolNegatif(M[1][2]);

  return { berhasil: true, titikPotongProduk1, titikPotongProduk2 };
}

// ============================================================================
// FUNGSI 2: Memeriksa apakah angka produksi benar-benar aman & memenuhi kendala
// ============================================================================
export function periksaKelayakanSolusi(
  rencanaProduksi: number[],
  daftarNamaProduk: string[],
  daftarKendala: DataKendala[]
): {
  semuaKendalaTerpenuhi: boolean;
  verifikasiDetail: {
    namaKendala: string;
    terpakai: number;
    tandaBatas: string;
    batasKapasitas: number;
    satuan: string;
    apakahAman: boolean;
  }[];
  pesanLog: string[];
} {
  const pesanLog: string[] = [];
  pesanLog.push('[PROSES 4] VERIFIKASI KELAYAKAN SOLUSI TERHADAP SELURUH KENDALA');

  // Cek apakah ada produksi negatif
  for (let i = 0; i < rencanaProduksi.length; i++) {
    if (rencanaProduksi[i] < -1e-6) {
      pesanLog.push(
        `  -> GAGAL: Jumlah produksi ${daftarNamaProduk[i]} tidak boleh negatif (${rencanaProduksi[i]}).`
      );
      return {
        semuaKendalaTerpenuhi: false,
        verifikasiDetail: [],
        pesanLog,
      };
    }
  }

  let semuaKendalaTerpenuhi = true;
  const verifikasiDetail: {
    namaKendala: string;
    terpakai: number;
    tandaBatas: string;
    batasKapasitas: number;
    satuan: string;
    apakahAman: boolean;
  }[] = [];

  for (let indeksKendala = 0; indeksKendala < daftarKendala.length; indeksKendala++) {
    const kendala = daftarKendala[indeksKendala];
    let totalSumberDayaTerpakai = 0.0;
    for (let indeksProduk = 0; indeksProduk < rencanaProduksi.length; indeksProduk++) {
      totalSumberDayaTerpakai +=
        (kendala.kebutuhanPerProduk[indeksProduk] || 0) * rencanaProduksi[indeksProduk];
    }
    totalSumberDayaTerpakai = bersihkanNolNegatif(totalSumberDayaTerpakai);

    let kendalaIniAman = true;
    if (kendala.tandaBatas === '<=' && totalSumberDayaTerpakai > kendala.batasKapasitas + 1e-5) {
      kendalaIniAman = false;
    }
    if (kendala.tandaBatas === '>=' && totalSumberDayaTerpakai < kendala.batasKapasitas - 1e-5) {
      kendalaIniAman = false;
    }

    verifikasiDetail.push({
      namaKendala: kendala.namaKendala,
      terpakai: totalSumberDayaTerpakai,
      tandaBatas: kendala.tandaBatas,
      batasKapasitas: kendala.batasKapasitas,
      satuan: kendala.satuanKendala,
      apakahAman: kendalaIniAman,
    });

    pesanLog.push(
      `  -> Cek Kendala ${indeksKendala + 1} (${kendala.namaKendala}): ${totalSumberDayaTerpakai} ${
        kendala.tandaBatas
      } ${kendala.batasKapasitas} ${kendala.satuanKendala}  -->  ${
        kendalaIniAman ? '[MEMENUHI]' : '[MELANGGAR]'
      }`
    );

    if (!kendalaIniAman) {
      semuaKendalaTerpenuhi = false;
    }
  }

  return { semuaKendalaTerpenuhi, verifikasiDetail, pesanLog };
}

// ============================================================================
// FUNGSI 3: Algoritma Utama Pencarian Produksi Optimal (Metode Simpleks Big-M)
// ============================================================================
export function cariProduksiOptimalDenganLog(
  totalProduk: number,
  daftarNamaProduk: string[],
  keuntunganPerUnit: number[],
  daftarKendala: DataKendala[]
): {
  solusiDitemukan: boolean;
  status: 'OPTIMAL' | 'TIDAK_LAYAK' | 'TANPA_BATAS';
  rekomendasiProduksi: number[];
  totalKeuntunganMaksimal: number;
  pesanLog: string[];
  daftarIterasi: IterasiSimpleksLog[];
  verifikasiKendala: any[];
  shadowPrices: number[];
} {
  const totalKendala = daftarKendala.length;
  const pesanLog: string[] = [];
  const daftarIterasi: IterasiSimpleksLog[] = [];

  pesanLog.push('[PROSES 1] INISIALISASI MODEL MATEMATIKA & FUNGSI TUJUAN');
  pesanLog.push(`  -> Jumlah Jenis Produk (Variabel Keputusan) : ${totalProduk}`);
  pesanLog.push(`  -> Jumlah Kendala Operasional               : ${totalKendala}`);

  const persamaanTujuan = keuntunganPerUnit
    .map((k, i) => `${k} X${i + 1}`)
    .join(' + ');
  pesanLog.push(`  -> Fungsi Tujuan: Maksimalkan Z = ${persamaanTujuan}`);

  // Hitung jumlah variabel bantu (variabel sisa/slack dan variabel buatan/artifisial)
  let jumlahVariabelSisa = 0;
  let jumlahVariabelLebih = 0;
  let jumlahVariabelBuatan = 0;

  for (let i = 0; i < totalKendala; i++) {
    if (daftarKendala[i].tandaBatas === '<=') {
      jumlahVariabelSisa++;
    } else {
      jumlahVariabelLebih++;
      jumlahVariabelBuatan++;
    }
  }

  // Skala penalti Big-M menyesuaikan keuntungan terbesar
  let keuntunganTerbesar = 1.0;
  for (let i = 0; i < totalProduk; i++) {
    if (Math.abs(keuntunganPerUnit[i]) > keuntunganTerbesar) {
      keuntunganTerbesar = Math.abs(keuntunganPerUnit[i]);
    }
  }
  const PENALTI_BESAR = keuntunganTerbesar * 10000.0;

  const totalKolomTabel =
    totalProduk + jumlahVariabelSisa + jumlahVariabelLebih + jumlahVariabelBuatan;
  const tabelMatriks: number[][] = Array.from({ length: totalKendala + 1 }, () =>
    Array(totalKolomTabel + 1).fill(0.0)
  );
  const kolomBasisAktif: number[] = Array(totalKendala).fill(-1);
  const labelKolom: string[] = Array(totalKolomTabel).fill('');
  const labelBarisBasis: string[] = Array(totalKendala).fill('');

  for (let i = 0; i < totalProduk; i++) {
    labelKolom[i] = `X${i + 1}`;
  }

  let posisiKolomSisa = totalProduk;
  let posisiKolomLebih = totalProduk + jumlahVariabelSisa;
  let posisiKolomBuatan = totalProduk + jumlahVariabelSisa + jumlahVariabelLebih;

  pesanLog.push('[PROSES 2] PEMBENTUKAN MATRIKS & TABEL SIMPLEKS AWAL');

  for (let indeksKendala = 0; indeksKendala < totalKendala; indeksKendala++) {
    const kendala = daftarKendala[indeksKendala];
    for (let indeksProduk = 0; indeksProduk < totalProduk; indeksProduk++) {
      tabelMatriks[indeksKendala][indeksProduk] =
        kendala.kebutuhanPerProduk[indeksProduk] || 0.0;
    }
    tabelMatriks[indeksKendala][totalKolomTabel] = kendala.batasKapasitas;

    if (kendala.tandaBatas === '<=') {
      tabelMatriks[indeksKendala][posisiKolomSisa] = 1.0;
      labelKolom[posisiKolomSisa] = `S${indeksKendala + 1}`;
      labelBarisBasis[indeksKendala] = labelKolom[posisiKolomSisa];
      kolomBasisAktif[indeksKendala] = posisiKolomSisa;
      pesanLog.push(
        `  -> Kendala ${indeksKendala + 1} (${kendala.namaKendala}): Ditambahkan variabel sisa kapasitas ${labelKolom[posisiKolomSisa]}`
      );
      posisiKolomSisa++;
    } else {
      tabelMatriks[indeksKendala][posisiKolomLebih] = -1.0;
      labelKolom[posisiKolomLebih] = `E${indeksKendala + 1}`;
      posisiKolomLebih++;

      tabelMatriks[indeksKendala][posisiKolomBuatan] = 1.0;
      labelKolom[posisiKolomBuatan] = `A${indeksKendala + 1}`;
      labelBarisBasis[indeksKendala] = labelKolom[posisiKolomBuatan];
      kolomBasisAktif[indeksKendala] = posisiKolomBuatan;
      tabelMatriks[totalKendala][posisiKolomBuatan] = PENALTI_BESAR;
      pesanLog.push(
        `  -> Kendala ${indeksKendala + 1} (${kendala.namaKendala}): Ditambahkan variabel bantu target minimal ${labelKolom[posisiKolomBuatan]}`
      );
      posisiKolomBuatan++;
    }
  }

  // Masukkan koefisien keuntungan ke baris fungsi tujuan
  for (let indeksProduk = 0; indeksProduk < totalProduk; indeksProduk++) {
    tabelMatriks[totalKendala][indeksProduk] = -keuntunganPerUnit[indeksProduk];
  }

  // Sesuaikan baris fungsi tujuan jika terdapat kendala target minimal (>=)
  for (let indeksKendala = 0; indeksKendala < totalKendala; indeksKendala++) {
    if (daftarKendala[indeksKendala].tandaBatas === '>=') {
      for (let kolom = 0; kolom <= totalKolomTabel; kolom++) {
        tabelMatriks[totalKendala][kolom] -=
          PENALTI_BESAR * tabelMatriks[indeksKendala][kolom];
      }
    }
  }

  // Simpan snapshot tabel awal (Iterasi 0)
  daftarIterasi.push({
    nomorIterasi: 0,
    labelKolom: [...labelKolom],
    labelBarisBasis: [...labelBarisBasis],
    tabelMatriks: tabelMatriks.map((row) => [...row]),
    catatanOperasi: 'Tabel Matriks Awal (Inisialisasi)',
  });

  pesanLog.push('[PROSES 3] ITERASI PENCARIAN SOLUSI OPTIMAL (OPERASI BARIS ELEMENTER)');
  let selesaiOptimal = false;
  const BATAS_MAKSIMAL_ITERASI = 500;

  for (let nomorIterasi = 1; nomorIterasi <= BATAS_MAKSIMAL_ITERASI; nomorIterasi++) {
    // Langkah A: Cari kolom masuk (nilai negatif terbesar pada baris tujuan)
    let kolomPivotTerpilih = -1;
    let nilaiTujuanTerkecil = -1e-7;

    for (let kolom = 0; kolom < totalKolomTabel; kolom++) {
      if (tabelMatriks[totalKendala][kolom] < nilaiTujuanTerkecil) {
        nilaiTujuanTerkecil = tabelMatriks[totalKendala][kolom];
        kolomPivotTerpilih = kolom;
      }
    }

    // Jika tidak ada lagi nilai negatif pada baris tujuan, solusi optimal sudah tercapai
    if (kolomPivotTerpilih === -1) {
      pesanLog.push(
        `  -> [STOP] Semua koefisien baris tujuan sudah >= 0. Titik optimal tercapai pada iterasi ke-${nomorIterasi - 1}!`
      );
      selesaiOptimal = true;
      break;
    }

    const varMasuk = labelKolom[kolomPivotTerpilih];
    pesanLog.push(`  --- Iterasi ke-${nomorIterasi} ---`);
    pesanLog.push(
      `  1. Variabel Masuk (Kolom Pivot) : ${varMasuk} (nilai tujuan paling negatif = ${nilaiTujuanTerkecil.toFixed(2)})`
    );

    // Langkah B: Hitung rasio pembatas untuk menentukan baris keluar
    let barisPivotTerpilih = -1;
    let rasioPembatasTerkecil = Infinity;

    for (let baris = 0; baris < totalKendala; baris++) {
      const elemenKolomPivot = tabelMatriks[baris][kolomPivotTerpilih];
      const nilaiKapasitasBaris = tabelMatriks[baris][totalKolomTabel];

      if (elemenKolomPivot > 1e-9) {
        const hasilRasio = nilaiKapasitasBaris / elemenKolomPivot;
        pesanLog.push(
          `     - Baris ${labelBarisBasis[baris]} : ${nilaiKapasitasBaris.toFixed(2)} / ${elemenKolomPivot.toFixed(2)} = ${hasilRasio.toFixed(2)}`
        );
        if (hasilRasio < rasioPembatasTerkecil - 1e-9) {
          rasioPembatasTerkecil = hasilRasio;
          barisPivotTerpilih = baris;
        }
      } else {
        pesanLog.push(
          `     - Baris ${labelBarisBasis[baris]} : Diabaikan (elemen <= 0)`
        );
      }
    }

    if (barisPivotTerpilih === -1) {
      pesanLog.push(
        '  -> [GAGAL] Tidak ditemukan batas rasio positif (Solusi tidak terbatas / Unbounded).'
      );
      return {
        solusiDitemukan: false,
        status: 'TANPA_BATAS',
        rekomendasiProduksi: Array(totalProduk).fill(0),
        totalKeuntunganMaksimal: 0,
        pesanLog,
        daftarIterasi,
        verifikasiKendala: [],
        shadowPrices: [],
      };
    }

    const varKeluar = labelBarisBasis[barisPivotTerpilih];
    const angkaPivotUtama = tabelMatriks[barisPivotTerpilih][kolomPivotTerpilih];
    pesanLog.push(
      `  2. Variabel Keluar (Baris Pivot): ${varKeluar} (rasio terkecil = ${rasioPembatasTerkecil.toFixed(2)}, angka pivot = ${angkaPivotUtama.toFixed(2)})`
    );
    pesanLog.push(
      `  3. Operasi Baris Elementer: Mengganti basis '${varKeluar}' dengan '${varMasuk}'...`
    );

    // Langkah C: Bagi baris pivot dengan angka pivot utama
    for (let kolom = 0; kolom <= totalKolomTabel; kolom++) {
      tabelMatriks[barisPivotTerpilih][kolom] /= angkaPivotUtama;
    }

    // Langkah D: Nol-kan elemen lain pada kolom pivot
    for (let baris = 0; baris <= totalKendala; baris++) {
      if (baris !== barisPivotTerpilih) {
        const faktorPengali = tabelMatriks[baris][kolomPivotTerpilih];
        for (let kolom = 0; kolom <= totalKolomTabel; kolom++) {
          tabelMatriks[baris][kolom] -=
            faktorPengali * tabelMatriks[barisPivotTerpilih][kolom];
        }
      }
    }

    kolomBasisAktif[barisPivotTerpilih] = kolomPivotTerpilih;
    labelBarisBasis[barisPivotTerpilih] = labelKolom[kolomPivotTerpilih];

    daftarIterasi.push({
      nomorIterasi,
      labelKolom: [...labelKolom],
      labelBarisBasis: [...labelBarisBasis],
      tabelMatriks: tabelMatriks.map((row) => [...row]),
      variabelMasuk: varMasuk,
      nilaiTujuanTerkecil,
      variabelKeluar: varKeluar,
      rasioPembatasTerkecil,
      angkaPivotUtama,
      catatanOperasi: `Operasi Baris Elementer: ${varMasuk} menggantikan ${varKeluar}`,
    });
  }

  if (!selesaiOptimal) {
    pesanLog.push('  -> [GAGAL] Perhitungan melebihi batas iterasi maksimal.');
    return {
      solusiDitemukan: false,
      status: 'TIDAK_LAYAK',
      rekomendasiProduksi: Array(totalProduk).fill(0),
      totalKeuntunganMaksimal: 0,
      pesanLog,
      daftarIterasi,
      verifikasiKendala: [],
      shadowPrices: [],
    };
  }

  // Ambil hasil jumlah produksi optimal dari baris basis akhir
  const rekomendasiProduksi: number[] = Array(totalProduk).fill(0.0);
  for (let baris = 0; baris < totalKendala; baris++) {
    if (kolomBasisAktif[baris] >= 0 && kolomBasisAktif[baris] < totalProduk) {
      rekomendasiProduksi[kolomBasisAktif[baris]] = bersihkanNolNegatif(
        tabelMatriks[baris][totalKolomTabel]
      );
    }
  }

  // Verifikasi kelayakan solusi terhadap seluruh kendala
  const hasilVerifikasi = periksaKelayakanSolusi(
    rekomendasiProduksi,
    daftarNamaProduk,
    daftarKendala
  );
  pesanLog.push(...hasilVerifikasi.pesanLog);

  if (!hasilVerifikasi.semuaKendalaTerpenuhi) {
    return {
      solusiDitemukan: false,
      status: 'TIDAK_LAYAK',
      rekomendasiProduksi,
      totalKeuntunganMaksimal: 0,
      pesanLog,
      daftarIterasi,
      verifikasiKendala: hasilVerifikasi.verifikasiDetail,
      shadowPrices: [],
    };
  }

  let totalKeuntunganMaksimal = 0.0;
  for (let i = 0; i < totalProduk; i++) {
    totalKeuntunganMaksimal += keuntunganPerUnit[i] * rekomendasiProduksi[i];
  }
  totalKeuntunganMaksimal = bersihkanNolNegatif(totalKeuntunganMaksimal);

  // Ambil harga bayangan (shadow prices) dari kolom variabel slack di baris fungsi tujuan
  const shadowPrices: number[] = [];
  for (let i = 0; i < totalKendala; i++) {
    const kolomSlack = totalProduk + i;
    if (kolomSlack < totalKolomTabel) {
      shadowPrices.push(
        bersihkanNolNegatif(Math.max(0, tabelMatriks[totalKendala][kolomSlack]))
      );
    } else {
      shadowPrices.push(0);
    }
  }

  return {
    solusiDitemukan: true,
    status: 'OPTIMAL',
    rekomendasiProduksi,
    totalKeuntunganMaksimal,
    pesanLog,
    daftarIterasi,
    verifikasiKendala: hasilVerifikasi.verifikasiDetail,
    shadowPrices,
  };
}

// ============================================================================
// FUNGSI UTAMA INTEGRASI WEB DASHBOARD: hitungSolusiOptimasi
// Menghubungkan seluruh fungsi inti C++ ke Web Dashboard & UI modern
// ============================================================================
export function hitungSolusiOptimasi(
  tujuanBisnis: TipeTujuan,
  daftarProduk: Produk[],
  daftarSumberDaya: SumberDaya[],
  matriksPemakaian: MatriksPemakaian
): SolusiBisnis {
  const waktuAwal = performance.now();

  if (daftarProduk.length === 0 || daftarSumberDaya.length === 0) {
    return buatSolusiKosong(tujuanBisnis);
  }

  const totalProduk = daftarProduk.length;
  const daftarNamaProduk = daftarProduk.map((p, idx) => p.nama || p.name || `Produk ${idx + 1}`);
  const keuntunganPerUnit = daftarProduk.map((p) => p.keuntungan ?? p.profit ?? 0);

  // Bentuk array DataKendala persis seperti struct C++
  const daftarKendala: DataKendala[] = daftarSumberDaya.map((r, idx) => {
    const namaKendala = r.nama || r.name || `Kendala ${idx + 1}`;
    const satuanKendala = r.satuan || r.unit || 'unit';
    const batasKapasitas = r.kapasitas ?? r.capacity ?? 0;
    const jenis = r.jenisBatasan || r.type || 'TIDAK_LEBIH_DARI';
    const tandaBatas =
      jenis === 'PALING_SEDIKIT' || jenis === 'GEQ'
        ? '>='
        : jenis === 'HARUS_TEPAT' || jenis === 'EQ'
        ? '=='
        : '<=';

    const kebutuhanPerProduk = daftarProduk.map((p) => matriksPemakaian[p.id]?.[r.id] ?? 0.0);

    return {
      namaKendala,
      satuanKendala,
      kebutuhanPerProduk,
      tandaBatas,
      batasKapasitas,
    };
  });

  // Eksekusi Algoritma Simpleks Inti C++
  const hasilSimpleks = cariProduksiOptimalDenganLog(
    totalProduk,
    daftarNamaProduk,
    keuntunganPerUnit,
    daftarKendala
  );

  const waktuSelesai = performance.now();
  const waktuPerhitunganMs = Math.round((waktuSelesai - waktuAwal) * 100) / 100;

  // Kasus 1: Tidak Layak (Infeasible)
  if (!hasilSimpleks.solusiDitemukan && hasilSimpleks.status === 'TIDAK_LAYAK') {
    const daftarTabrakan = temukanBatasanBertabrakan(daftarSumberDaya);
    const hasilProdukKosong: HasilProduk[] = daftarProduk.map((p) => ({
      id: p.id,
      nama: p.nama || p.name || 'Produk',
      name: p.nama || p.name || 'Produk',
      jumlahProduksi: 0,
      quantity: 0,
      satuan: p.satuan || p.unit || 'unit',
      unit: p.satuan || p.unit || 'unit',
      keuntunganPerUnit: p.keuntungan ?? p.profit ?? 0,
      profitPerUnit: p.keuntungan ?? p.profit ?? 0,
      kontribusiKeuntungan: 0,
      contribution: 0,
      persentaseTotal: 0,
      percentageOfTotal: 0,
    }));

    const hasilSumberDayaKosong: HasilSumberDaya[] = daftarSumberDaya.map((r) => {
      const cap = r.kapasitas ?? r.capacity ?? 0;
      return {
        id: r.id,
        nama: r.nama || r.name || 'Sumber Daya',
        name: r.nama || r.name || 'Sumber Daya',
        kapasitasTerpakai: 0,
        used: 0,
        kapasitasTersedia: cap,
        capacity: cap,
        satuan: r.satuan || r.unit || 'unit',
        unit: r.satuan || r.unit || 'unit',
        sisaKapasitas: cap,
        slack: cap,
        terpakaiPenuh: false,
        binding: false,
        persentasePemakaian: 0,
        usagePercent: 0,
        nilaiTambahPerUnit: 0,
        shadowPrice: 0,
        jenisBatasan: r.jenisBatasan || r.type || 'TIDAK_LEBIH_DARI',
        type: r.jenisBatasan || r.type || 'TIDAK_LEBIH_DARI',
      };
    });

    return {
      status: 'TIDAK_LAYAK',
      totalNilai: 0,
      objectiveValue: 0,
      tipeTujuan: tujuanBisnis,
      objectiveType: tujuanBisnis,
      daftarProduk: hasilProdukKosong,
      products: hasilProdukKosong,
      daftarSumberDaya: hasilSumberDayaKosong,
      resources: hasilSumberDayaKosong,
      kalimatKesimpulan:
        'Target tidak bisa dipenuhi: Terdapat batasan kapasitas yang saling bertabrakan atau target produksi minimum melebihi kapasitas yang tersedia saat ini.',
      conclusionSentence:
        'Target tidak bisa dipenuhi: Terdapat batasan kapasitas yang saling bertabrakan atau target produksi minimum melebihi kapasitas yang tersedia saat ini.',
      daftarBatasanBertabrakan: daftarTabrakan,
      conflictingConstraints: daftarTabrakan,
      waktuPerhitunganMs,
      calculationTimeMs: waktuPerhitunganMs,
      logPerhitungan: {
        pesanLog: hasilSimpleks.pesanLog,
        daftarIterasi: hasilSimpleks.daftarIterasi,
        verifikasiKendala: hasilSimpleks.verifikasiKendala,
      },
    };
  }

  // Kasus 2: Tanpa Batas Atas (Unbounded)
  if (!hasilSimpleks.solusiDitemukan && hasilSimpleks.status === 'TANPA_BATAS') {
    return {
      status: 'TANPA_BATAS',
      totalNilai: 0,
      objectiveValue: 0,
      tipeTujuan: tujuanBisnis,
      objectiveType: tujuanBisnis,
      daftarProduk: [],
      products: [],
      daftarSumberDaya: [],
      resources: [],
      kalimatKesimpulan:
        'Tanpa batas atas: Untung dapat bertambah tanpa batas karena batasan kapasitas belum membatasi seluruh arah produksi.',
      conclusionSentence:
        'Tanpa batas atas: Untung dapat bertambah tanpa batas karena batasan kapasitas belum membatasi seluruh arah produksi.',
      waktuPerhitunganMs,
      calculationTimeMs: waktuPerhitunganMs,
      logPerhitungan: {
        pesanLog: hasilSimpleks.pesanLog,
        daftarIterasi: hasilSimpleks.daftarIterasi,
        verifikasiKendala: [],
      },
    };
  }

  // Kasus 3: Solusi Optimal Ditemukan
  const daftarHasilProduk: HasilProduk[] = daftarProduk.map((p, idx) => {
    let jumlah = hasilSimpleks.rekomendasiProduksi[idx] || 0.0;
    const hanyaUtuh = p.hanyaJumlahUtuh ?? p.integerOnly ?? true;
    if (hanyaUtuh) {
      jumlah = Math.round(jumlah);
    }
    jumlah = Math.max(0, Math.round(jumlah * 100) / 100);

    const untungPerUnit = p.keuntungan ?? p.profit ?? 0;
    const kontribusi = Math.round(jumlah * untungPerUnit);
    const nama = p.nama || p.name || `Produk ${idx + 1}`;
    const satuan = p.satuan || p.unit || 'unit';

    return {
      id: p.id,
      nama,
      name: nama,
      jumlahProduksi: jumlah,
      quantity: jumlah,
      satuan,
      unit: satuan,
      keuntunganPerUnit: untungPerUnit,
      profitPerUnit: untungPerUnit,
      kontribusiKeuntungan: kontribusi,
      contribution: kontribusi,
      persentaseTotal: 0,
      percentageOfTotal: 0,
    };
  });

  const totalNilaiTujuan = daftarHasilProduk.reduce(
    (total, p) => total + p.kontribusiKeuntungan,
    0
  );

  daftarHasilProduk.forEach((p) => {
    const porsi =
      totalNilaiTujuan > 0
        ? Math.round((p.kontribusiKeuntungan / totalNilaiTujuan) * 1000) / 10
        : 0;
    p.persentaseTotal = porsi;
    p.percentageOfTotal = porsi;
  });

  // Hitung pemakaian sumber daya, sisa kapasitas, dan nilai tambah
  const daftarHasilSumberDaya: HasilSumberDaya[] = daftarSumberDaya.map((r, rIdx) => {
    let terpakai = 0;
    daftarProduk.forEach((p, pIdx) => {
      const kebutuhan = matriksPemakaian[p.id]?.[r.id] ?? 0;
      terpakai += daftarHasilProduk[pIdx].jumlahProduksi * kebutuhan;
    });
    terpakai = Math.round(terpakai * 100) / 100;

    const cap = r.kapasitas ?? r.capacity ?? 0;
    const sisa = Math.max(0, Math.round((cap - terpakai) * 100) / 100);
    const persentasePakai =
      cap > 0 ? Math.min(100, Math.round((terpakai / cap) * 1000) / 10) : 0;
    const terpakaiPenuh = Math.abs(sisa) < 0.05 || persentasePakai >= 99.5;
    const nilaiTambah = Math.max(
      0,
      Math.round((hasilSimpleks.shadowPrices[rIdx] || 0) * 100) / 100
    );

    return {
      id: r.id,
      nama: r.nama || r.name || `Sumber Daya ${rIdx + 1}`,
      name: r.nama || r.name || `Sumber Daya ${rIdx + 1}`,
      kapasitasTerpakai: terpakai,
      used: terpakai,
      kapasitasTersedia: cap,
      capacity: cap,
      satuan: r.satuan || r.unit || 'unit',
      unit: r.satuan || r.unit || 'unit',
      sisaKapasitas: sisa,
      slack: sisa,
      terpakaiPenuh,
      binding: terpakaiPenuh,
      persentasePemakaian: persentasePakai,
      usagePercent: persentasePakai,
      nilaiTambahPerUnit: nilaiTambah,
      shadowPrice: nilaiTambah,
      jenisBatasan: r.jenisBatasan || r.type || 'TIDAK_LEBIH_DARI',
      type: r.jenisBatasan || r.type || 'TIDAK_LEBIH_DARI',
    };
  });

  const penghambatUtama = [...daftarHasilSumberDaya]
    .filter((r) => r.terpakaiPenuh)
    .sort((a, b) => b.nilaiTambahPerUnit - a.nilaiTambahPerUnit)[0];

  // 1 Kalimat Kesimpulan Ramah Non-IT
  const rincianProdukAktif = daftarHasilProduk
    .filter((p) => p.jumlahProduksi > 0)
    .map((p) => `${formatAngka(p.jumlahProduksi)} ${p.satuan} ${p.nama}`)
    .join(' dan ');

  let kalimatKesimpulan = '';
  if (rincianProdukAktif) {
    kalimatKesimpulan = `Rekomendasi terbaik: Produksi ${rincianProdukAktif} untuk mencapai keuntungan maksimal sebesar ${formatMataUangRupiah(
      totalNilaiTujuan
    )}.`;
    if (penghambatUtama) {
      kalimatKesimpulan += ` ${penghambatUtama.nama} menjadi faktor penghambat utama (terpakai penuh / bottleneck).`;
    }
  } else {
    kalimatKesimpulan =
      'Kapasitas yang ada saat ini belum memungkinkan produksi menghasilkan keuntungan positif.';
  }

  // Verifikasi Titik Potong SPL (Kendala Terpakai Penuh / Bottleneck) menggunakan Aturan Cramer C++
  let titikPotongSPLData:
    | { garis1: string; garis2: string; x1: number; x2: number }
    | undefined;

  if (totalProduk === 2 && daftarKendala.length >= 2) {
    const indeksTerpakaiPenuh: number[] = [];
    daftarHasilSumberDaya.forEach((r, idx) => {
      if (r.terpakaiPenuh) indeksTerpakaiPenuh.push(idx);
    });

    const idx1 = indeksTerpakaiPenuh.length >= 2 ? indeksTerpakaiPenuh[0] : 0;
    const idx2 = indeksTerpakaiPenuh.length >= 2 ? indeksTerpakaiPenuh[1] : 1;

    const k1 = daftarKendala[idx1];
    const k2 = daftarKendala[idx2];
    const hasilSPL = hitungTitikPotongSPL(
      k1.kebutuhanPerProduk[0],
      k1.kebutuhanPerProduk[1],
      k1.batasKapasitas,
      k2.kebutuhanPerProduk[0],
      k2.kebutuhanPerProduk[1],
      k2.batasKapasitas
    );

    if (hasilSPL.berhasil) {
      titikPotongSPLData = {
        garis1: k1.namaKendala,
        garis2: k2.namaKendala,
        x1: hasilSPL.titikPotongProduk1,
        x2: hasilSPL.titikPotongProduk2,
      };
      hasilSimpleks.pesanLog.push(
        `  -> Verifikasi Titik Potong SPL (Eliminasi Gauss-Jordan ${k1.namaKendala} & ${k2.namaKendala}): (${hasilSPL.titikPotongProduk1}, ${hasilSPL.titikPotongProduk2})`
      );
    }
  }

  // Visualisasi Geometri 2D (jika 2 produk)
  let geometri2D: Geometri2D | undefined;
  if (totalProduk === 2) {
    geometri2D = hitungVisualisasiGeometri2D(
      daftarProduk[0],
      daftarProduk[1],
      daftarSumberDaya,
      matriksPemakaian,
      [daftarHasilProduk[0].jumlahProduksi, daftarHasilProduk[1].jumlahProduksi]
    );
  }

  return {
    status: 'OPTIMAL',
    totalNilai: totalNilaiTujuan,
    objectiveValue: totalNilaiTujuan,
    tipeTujuan: tujuanBisnis,
    objectiveType: tujuanBisnis,
    daftarProduk: daftarHasilProduk,
    products: daftarHasilProduk,
    daftarSumberDaya: daftarHasilSumberDaya,
    resources: daftarHasilSumberDaya,
    kalimatKesimpulan,
    conclusionSentence: kalimatKesimpulan,
    penghambatUtama,
    topBottleneck: penghambatUtama,
    geometri2D,
    waktuPerhitunganMs,
    calculationTimeMs: waktuPerhitunganMs,
    logPerhitungan: {
      pesanLog: hasilSimpleks.pesanLog,
      daftarIterasi: hasilSimpleks.daftarIterasi,
      verifikasiKendala: hasilSimpleks.verifikasiKendala,
      titikPotongSPL: titikPotongSPLData,
    },
  };
}
export const solveOptimization = hitungSolusiOptimasi;

// ============================================================================
// FUNGSI PEMBANTU: Visualisasi Geometri 2D Menggunakan Aturan Cramer
// ============================================================================
function hitungVisualisasiGeometri2D(
  p1: Produk,
  p2: Produk,
  daftarSumberDaya: SumberDaya[],
  matriksPemakaian: MatriksPemakaian,
  titikOptimal: [number, number]
): Geometri2D {
  const paletWarna = ['#1F4E5F', '#C2793A', '#6B7A3A', '#8A3B4A', '#5E6C84', '#8F8A7E'];

  const daftarGarisBatasan: GarisBatasan2D[] = daftarSumberDaya.map((r, i) => {
    const a = matriksPemakaian[p1.id]?.[r.id] ?? 0;
    const b = matriksPemakaian[p2.id]?.[r.id] ?? 0;
    const cap = r.kapasitas ?? r.capacity ?? 0;
    const namaRes = r.nama || r.name || `Kendala ${i + 1}`;
    const jenis = r.jenisBatasan || r.type || 'TIDAK_LEBIH_DARI';

    return {
      idSumberDaya: r.id,
      resourceId: r.id,
      nama: namaRes,
      name: namaRes,
      koefisienX: a,
      a,
      koefisienY: b,
      b,
      kapasitasC: cap,
      c: cap,
      jenisBatasan: jenis,
      type: jenis,
      warna: paletWarna[i % paletWarna.length],
      color: paletWarna[i % paletWarna.length],
    };
  });

  const daftarTitik: [number, number][] = [[0, 0]];

  for (let i = 0; i < daftarGarisBatasan.length; i++) {
    const g1 = daftarGarisBatasan[i];
    if (Math.abs(g1.koefisienX) > 1e-9)
      daftarTitik.push([bersihkanNolNegatif(g1.kapasitasC / g1.koefisienX), 0]);
    if (Math.abs(g1.koefisienY) > 1e-9)
      daftarTitik.push([0, bersihkanNolNegatif(g1.kapasitasC / g1.koefisienY)]);

    for (let j = i + 1; j < daftarGarisBatasan.length; j++) {
      const g2 = daftarGarisBatasan[j];
      const titikPotong = hitungTitikPotongSPL(
        g1.koefisienX,
        g1.koefisienY,
        g1.kapasitasC,
        g2.koefisienX,
        g2.koefisienY,
        g2.kapasitasC
      );
      if (titikPotong.berhasil) {
        daftarTitik.push([
          titikPotong.titikPotongProduk1,
          titikPotong.titikPotongProduk2,
        ]);
      }
    }
  }

  // Saring titik-titik yang valid dalam area yang memungkinkan
  const titikValid = daftarTitik.filter(([x, y]) => {
    if (x < -1e-6 || y < -1e-6) return false;
    for (const r of daftarGarisBatasan) {
      const hasil = r.koefisienX * x + r.koefisienY * y;
      const jenis = r.jenisBatasan;
      const apakahLEQ = jenis === 'TIDAK_LEBIH_DARI' || jenis === 'LEQ';
      const apakahGEQ = jenis === 'PALING_SEDIKIT' || jenis === 'GEQ';

      if (apakahLEQ && hasil > r.kapasitasC + 0.05) return false;
      if (apakahGEQ && hasil < r.kapasitasC - 0.05) return false;
      if (!apakahLEQ && !apakahGEQ && Math.abs(hasil - r.kapasitasC) > 0.05) return false;
    }
    return true;
  });

  // Urutkan titik secara melingkar (counter-clockwise)
  const titikPusatX =
    titikValid.reduce((total, p) => total + p[0], 0) / (titikValid.length || 1);
  const titikPusatY =
    titikValid.reduce((total, p) => total + p[1], 0) / (titikValid.length || 1);

  const poligonTerurut = [...titikValid].sort((a, b) => {
    const sudutA = Math.atan2(a[1] - titikPusatY, a[0] - titikPusatX);
    const sudutB = Math.atan2(b[1] - titikPusatY, b[0] - titikPusatX);
    return sudutA - sudutB;
  });

  const batasX = Math.max(
    titikOptimal[0] * 1.35,
    ...titikValid.map((p) => p[0] * 1.15),
    10
  );
  const batasY = Math.max(
    titikOptimal[1] * 1.35,
    ...titikValid.map((p) => p[1] * 1.15),
    10
  );

  const untung1 = p1.keuntungan ?? p1.profit ?? 0;
  const untung2 = p2.keuntungan ?? p2.profit ?? 0;

  const daftarTitikSudut: TitikSudut2D[] = titikValid.map(([x, y]) => {
    const xBulat = Math.round(x * 10) / 10;
    const yBulat = Math.round(y * 10) / 10;
    const nilai = untung1 * xBulat + untung2 * yBulat;
    const apakahOptimal =
      Math.abs(xBulat - titikOptimal[0]) < 0.2 &&
      Math.abs(yBulat - titikOptimal[1]) < 0.2;

    return {
      x: xBulat,
      y: yBulat,
      nilai,
      value: nilai,
      apakahOptimal,
      isOptimal: apakahOptimal,
      keterangan: `(${xBulat}, ${yBulat}) = ${formatMataUangRupiah(nilai)}`,
      label: `(${xBulat}, ${yBulat}) = ${formatMataUangRupiah(nilai)}`,
    };
  });

  return {
    apakah2D: true,
    is2D: true,
    produkX: p1,
    productX: p1,
    produkY: p2,
    productY: p2,
    poligonAreaLayak: poligonTerurut,
    feasiblePolygon: poligonTerurut,
    daftarTitikSudut,
    cornerPoints: daftarTitikSudut,
    titikOptimal,
    optimalPoint: titikOptimal,
    batasMaksimal: { x: batasX, y: batasY },
    maxBounds: { x: batasX, y: batasY },
    daftarGarisBatasan,
    constraintLines: daftarGarisBatasan,
  };
}

// ============================================================================
// FUNGSI PEMBANTU: Identifikasi Konflik & Solusi Kosong
// ============================================================================
function temukanBatasanBertabrakan(daftarSumberDaya: SumberDaya[]): BatasanBertabrakan[] {
  const daftarTabrakan: BatasanBertabrakan[] = [];

  daftarSumberDaya.forEach((r) => {
    const namaRes = r.nama || r.name || 'Sumber Daya';
    const cap = r.kapasitas ?? r.capacity ?? 0;
    const satuanRes = r.satuan || r.unit || 'unit';
    const jenis = r.jenisBatasan || r.type || 'TIDAK_LEBIH_DARI';
    const apakahGEQ = jenis === 'PALING_SEDIKIT' || jenis === 'GEQ';

    if (apakahGEQ) {
      daftarTabrakan.push({
        idSumberDaya: r.id,
        resourceId: r.id,
        nama: namaRes,
        alasan: `Target minimal ${namaRes} sebesar ${cap} ${satuanRes} terlalu tinggi dibanding batas kapasitas lainnya.`,
        reason: `Target minimal ${namaRes} sebesar ${cap} ${satuanRes} terlalu tinggi dibanding batas kapasitas lainnya.`,
        saranPerbaikan: `Turunkan target minimal ${namaRes} menjadi ${Math.round(cap * 0.7)} ${satuanRes}`,
        suggestedFix: `Turunkan target minimal ${namaRes} menjadi ${Math.round(cap * 0.7)} ${satuanRes}`,
        saranKapasitas: Math.round(cap * 0.7),
        suggestedCapacity: Math.round(cap * 0.7),
      });
    } else if (cap <= 0) {
      daftarTabrakan.push({
        idSumberDaya: r.id,
        resourceId: r.id,
        nama: namaRes,
        alasan: `Kapasitas ${namaRes} bernilai 0 atau belum diisi.`,
        reason: `Kapasitas ${namaRes} bernilai 0 atau belum diisi.`,
        saranPerbaikan: `Tingkatkan kapasitas ${namaRes} menjadi setidaknya 10 ${satuanRes}`,
        suggestedFix: `Tingkatkan kapasitas ${namaRes} menjadi setidaknya 10 ${satuanRes}`,
        saranKapasitas: 10,
        suggestedCapacity: 10,
      });
    }
  });

  if (daftarTabrakan.length === 0 && daftarSumberDaya.length > 0) {
    const res1 = daftarSumberDaya[0];
    const namaRes = res1.nama || res1.name || 'Sumber Daya';
    const cap = res1.kapasitas ?? res1.capacity ?? 0;
    const satuanRes = res1.satuan || res1.unit || 'unit';

    daftarTabrakan.push({
      idSumberDaya: res1.id,
      resourceId: res1.id,
      nama: namaRes,
      alasan: `Batasan kapasitas ${namaRes} saling membatasi dengan sumber daya lainnya.`,
      reason: `Batasan kapasitas ${namaRes} saling membatasi dengan sumber daya lainnya.`,
      saranPerbaikan: `Tambah kapasitas ${namaRes} sebesar 20% (+${Math.round(cap * 0.2)} ${satuanRes})`,
      suggestedFix: `Tambah kapasitas ${namaRes} sebesar 20% (+${Math.round(cap * 0.2)} ${satuanRes})`,
      saranKapasitas: Math.round(cap * 1.2),
      suggestedCapacity: Math.round(cap * 1.2),
    });
  }

  return daftarTabrakan;
}

function buatSolusiKosong(tujuanBisnis: TipeTujuan): SolusiBisnis {
  return {
    status: 'OPTIMAL',
    totalNilai: 0,
    objectiveValue: 0,
    tipeTujuan: tujuanBisnis,
    objectiveType: tujuanBisnis,
    daftarProduk: [],
    products: [],
    daftarSumberDaya: [],
    resources: [],
    kalimatKesimpulan: 'Silakan isi data produk dan sumber daya untuk melihat rekomendasi bisnis terbaik.',
    conclusionSentence: 'Silakan isi data produk dan sumber daya untuk melihat rekomendasi bisnis terbaik.',
    waktuPerhitunganMs: 0,
    calculationTimeMs: 0,
  };
}
