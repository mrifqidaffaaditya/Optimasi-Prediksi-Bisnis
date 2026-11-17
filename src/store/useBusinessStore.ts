// ============================================================================
// STORE STATE MANAGEMENT APLIKASI OPTIMASI BISNIS
// Menggunakan Zustand dengan persistensi lokal (Client-Side, tanpa login)
// Variabel & fungsi berbahasa Indonesia ramah non-IT
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  TipeTujuan,
  Produk,
  SumberDaya,
  MatriksPemakaian,
  SolusiBisnis,
  SkenarioBisnis,
  PengaturanAI,
  JenisBatasan,
} from '@/types';
import { hitungSolusiOptimasi } from '@/lib/solver/simplex';
import { TEMPLAT_BISNIS } from '@/lib/templates';
import LZString from 'lz-string';

export type TabAktif = 'wizard' | 'table' | 'results' | 'scenarios';
export type ActiveTab = TabAktif;

export type KepadatanTabel = 'comfortable' | 'compact';
export type TableDensity = KepadatanTabel;

export type TingkatKetahanan = 'none' | 'light' | 'medium' | 'heavy';
export type RobustnessLevel = TingkatKetahanan;

export interface StateBisnis {
  // Model Data Inti
  tujuanBisnis: TipeTujuan;
  objective: TipeTujuan;
  daftarProduk: Produk[];
  products: Produk[];
  daftarSumberDaya: SumberDaya[];
  resources: SumberDaya[];
  matriksPemakaian: MatriksPemakaian;
  usage: MatriksPemakaian;

  // Navigasi & Tampilan
  tabAktif: TabAktif;
  activeTab: TabAktif;
  langkahPanduan: 1 | 2 | 3 | 4;
  wizardStep: 1 | 2 | 3 | 4;
  kepadatanTabel: KepadatanTabel;
  tableDensity: KepadatanTabel;

  // Simulasi Bagaimana Jika & Uji Ketahanan
  penyesuaianSimulasi: { [idSumberDaya: string]: number };
  whatIfAdjustments: { [resourceId: string]: number };
  tingkatKetahanan: TingkatKetahanan;
  robustnessLevel: TingkatKetahanan;

  // Skenario & AI
  daftarSkenario: SkenarioBisnis[];
  scenarios: SkenarioBisnis[];
  pengaturanAI: PengaturanAI;
  aiSettings: PengaturanAI;

  // Hasil Optimasi Terkini
  solusiBisnis: SolusiBisnis;
  solution: SolusiBisnis;

  // Aksi (Functions) Berbahasa Indonesia & Alias Kompatibilitas
  aturTujuanBisnis: (tujuan: TipeTujuan) => void;
  setObjective: (tujuan: TipeTujuan) => void;

  aturLangkahPanduan: (langkah: 1 | 2 | 3 | 4) => void;
  setWizardStep: (langkah: 1 | 2 | 3 | 4) => void;

  aturTabAktif: (tab: TabAktif) => void;
  setActiveTab: (tab: TabAktif) => void;

  aturKepadatanTabel: (kepadatan: KepadatanTabel) => void;
  setTableDensity: (kepadatan: KepadatanTabel) => void;

  // Manajemen Produk
  tambahProduk: (produkBaru?: Partial<Produk>) => void;
  addProduct: (produkBaru?: Partial<Produk>) => void;

  perbaruiProduk: (id: string, pembaruan: Partial<Produk>) => void;
  updateProduct: (id: string, pembaruan: Partial<Produk>) => void;

  hapusProduk: (id: string) => void;
  removeProduct: (id: string) => void;

  // Manajemen Sumber Daya
  tambahSumberDaya: (sumberDayaBaru?: Partial<SumberDaya>) => void;
  addResource: (sumberDayaBaru?: Partial<SumberDaya>) => void;

  perbaruiSumberDaya: (id: string, pembaruan: Partial<SumberDaya>) => void;
  updateResource: (id: string, pembaruan: Partial<SumberDaya>) => void;

  hapusSumberDaya: (id: string) => void;
  removeResource: (id: string) => void;

  // Matriks Pemakaian
  perbaruiPemakaian: (idProduk: string, idSumberDaya: string, nilai: number) => void;
  updateUsage: (idProduk: string, idSumberDaya: string, nilai: number) => void;

  // Templat Kasus
  muatTemplat: (idTemplat: string) => void;
  loadTemplate: (idTemplat: string) => void;

  aturUlangSemua: () => void;
  resetAll: () => void;

  // Simulasi Bagaimana Jika (What-If)
  aturKapasitasSimulasi: (idSumberDaya: string, kapasitas: number) => void;
  setWhatIfCapacity: (idSumberDaya: string, kapasitas: number) => void;

  geserKapasitasPersen: (idSumberDaya: string, persentase: number) => void;
  adjustWhatIfPercent: (idSumberDaya: string, persentase: number) => void;

  aturUlangSimulasi: () => void;
  resetWhatIf: () => void;

  aturTingkatKetahanan: (tingkat: TingkatKetahanan) => void;
  setRobustnessLevel: (tingkat: TingkatKetahanan) => void;

  // Terapkan Solusi Otomatis Perbaikan Tabrakan
  terapkanSaranPerbaikan: (idSumberDaya: string, saranKapasitas: number) => void;
  applySuggestedFix: (idSumberDaya: string, saranKapasitas: number) => void;

  // Skenario
  simpanSkenarioSaatIni: (nama: string) => void;
  saveCurrentScenario: (nama: string) => void;

  hapusSkenario: (id: string) => void;
  deleteScenario: (id: string) => void;

  muatSkenario: (id: string) => void;
  loadScenario: (id: string) => void;

  // Pengaturan AI
  aturPengaturanAI: (pengaturan: Partial<PengaturanAI>) => void;
  setAISettings: (pengaturan: Partial<PengaturanAI>) => void;

  // Berbagi & Impor
  imporDataModel: (
    tujuan: TipeTujuan,
    daftarProduk: Produk[],
    daftarSumberDaya: SumberDaya[],
    matriksPemakaian: MatriksPemakaian
  ) => void;
  importModelData: (
    tujuan: TipeTujuan,
    daftarProduk: Produk[],
    daftarSumberDaya: SumberDaya[],
    matriksPemakaian: MatriksPemakaian
  ) => void;

  dapatkanKodeBerbagi: () => string;
  getShareableHash: () => string;

  muatDariKodeBerbagi: (kodeTautan: string) => boolean;
  loadFromShareableHash: (kodeTautan: string) => boolean;
}

const templatAwal = TEMPLAT_BISNIS[0];

/**
 * Fungsi pembantu untuk menghitung ulang solusi dengan penyesuaian kapasitas & stres ketahanan
 */
function jalankanPerhitunganBisnis(
  tujuan: TipeTujuan,
  daftarProduk: Produk[],
  daftarSumberDaya: SumberDaya[],
  matriksPemakaian: MatriksPemakaian,
  penyesuaian: { [idSumberDaya: string]: number },
  ketahanan: TingkatKetahanan
): SolusiBisnis {
  const sumberDayaAktif = daftarSumberDaya.map((r) => {
    let kapasitas = penyesuaian[r.id] !== undefined ? penyesuaian[r.id] : (r.kapasitas ?? r.capacity ?? 0);

    // Pengujian Stres Ketahanan (PRD 5.2)
    if (ketahanan === 'light') {
      kapasitas = kapasitas * 0.95; // Stres pasokan -5%
    } else if (ketahanan === 'medium') {
      kapasitas = kapasitas * 0.90; // Stres pasokan -10%
    } else if (ketahanan === 'heavy') {
      kapasitas = kapasitas * 0.80; // Stres pasokan -20%
    }

    const kapasitasDibulatkan = Math.round(kapasitas * 10) / 10;
    return {
      ...r,
      kapasitas: kapasitasDibulatkan,
      capacity: kapasitasDibulatkan,
    };
  });

  return hitungSolusiOptimasi(tujuan, daftarProduk, sumberDayaAktif, matriksPemakaian);
}

export const useBusinessStore = create<StateBisnis>()(
  persist(
    (set, get) => {
      const produkAwal = templatAwal.daftarProduk || templatAwal.products || [];
      const sumberDayaAwal = templatAwal.daftarSumberDaya || templatAwal.resources || [];
      const pemakaianAwal = templatAwal.matriksPemakaian || templatAwal.usage || {};
      const tujuanAwal = templatAwal.tujuanBisnis || templatAwal.objective || 'MAKSIMALKAN_UNTUNG';

      const solusiAwal = jalankanPerhitunganBisnis(
        tujuanAwal,
        produkAwal,
        sumberDayaAwal,
        pemakaianAwal,
        {},
        'none'
      );

      return {
        tujuanBisnis: tujuanAwal,
        objective: tujuanAwal,
        daftarProduk: produkAwal,
        products: produkAwal,
        daftarSumberDaya: sumberDayaAwal,
        resources: sumberDayaAwal,
        matriksPemakaian: pemakaianAwal,
        usage: pemakaianAwal,

        tabAktif: 'wizard',
        activeTab: 'wizard',
        langkahPanduan: 1,
        wizardStep: 1,
        kepadatanTabel: 'comfortable',
        tableDensity: 'comfortable',

        penyesuaianSimulasi: {},
        whatIfAdjustments: {},
        tingkatKetahanan: 'none',
        robustnessLevel: 'none',

        daftarSkenario: [],
        scenarios: [],
        pengaturanAI: {
          penyedia: 'openai',
          provider: 'openai',
          kunciAPI: '',
          apiKey: '',
          urlBasis: 'https://api.openai.com/v1',
          baseUrl: 'https://api.openai.com/v1',
          namaModel: 'gpt-4o',
          model: 'gpt-4o',
          apakahLokal: true,
          isLocal: true,
        },
        aiSettings: {
          penyedia: 'openai',
          provider: 'openai',
          kunciAPI: '',
          apiKey: '',
          urlBasis: 'https://api.openai.com/v1',
          baseUrl: 'https://api.openai.com/v1',
          namaModel: 'gpt-4o',
          model: 'gpt-4o',
          apakahLokal: true,
          isLocal: true,
        },

        solusiBisnis: solusiAwal,
        solution: solusiAwal,

        // Aksi Pengaturan Tujuan
        aturTujuanBisnis: (tujuan) => {
          set((state) => {
            const nextSolution = jalankanPerhitunganBisnis(
              tujuan,
              state.daftarProduk,
              state.daftarSumberDaya,
              state.matriksPemakaian,
              state.penyesuaianSimulasi,
              state.tingkatKetahanan
            );
            return {
              tujuanBisnis: tujuan,
              objective: tujuan,
              solusiBisnis: nextSolution,
              solution: nextSolution,
            };
          });
        },
        setObjective: (tujuan) => get().aturTujuanBisnis(tujuan),

        aturLangkahPanduan: (langkah) => set({ langkahPanduan: langkah, wizardStep: langkah }),
        setWizardStep: (langkah) => get().aturLangkahPanduan(langkah),

        aturTabAktif: (tab) => set({ tabAktif: tab, activeTab: tab }),
        setActiveTab: (tab) => get().aturTabAktif(tab),

        aturKepadatanTabel: (kepadatan) =>
          set({ kepadatanTabel: kepadatan, tableDensity: kepadatan }),
        setTableDensity: (kepadatan) => get().aturKepadatanTabel(kepadatan),

        // Manajemen Produk
        tambahProduk: (produkBaru) => {
          set((state) => {
            const idBaru = `p${Date.now()}`;
            const namaBaru =
              produkBaru?.nama ||
              produkBaru?.name ||
              `Produk ${state.daftarProduk.length + 1}`;
            const untungBaru =
              produkBaru?.keuntungan ?? produkBaru?.profit ?? 10000;
            const satuanBaru =
              produkBaru?.satuan || produkBaru?.unit || 'unit';
            const hanyaUtuh =
              produkBaru?.hanyaJumlahUtuh ?? produkBaru?.integerOnly ?? true;

            const produkDitambahkan: Produk = {
              id: idBaru,
              nama: namaBaru,
              name: namaBaru,
              keuntungan: untungBaru,
              profit: untungBaru,
              satuan: satuanBaru,
              unit: satuanBaru,
              hanyaJumlahUtuh: hanyaUtuh,
              integerOnly: hanyaUtuh,
            };

            const produkDiperbarui = [...state.daftarProduk, produkDitambahkan];
            const pemakaianDiperbarui: MatriksPemakaian = {
              ...state.matriksPemakaian,
              [idBaru]: {},
            };
            state.daftarSumberDaya.forEach((r) => {
              pemakaianDiperbarui[idBaru][r.id] = 1;
            });

            const nextSolution = jalankanPerhitunganBisnis(
              state.tujuanBisnis,
              produkDiperbarui,
              state.daftarSumberDaya,
              pemakaianDiperbarui,
              state.penyesuaianSimulasi,
              state.tingkatKetahanan
            );

            return {
              daftarProduk: produkDiperbarui,
              products: produkDiperbarui,
              matriksPemakaian: pemakaianDiperbarui,
              usage: pemakaianDiperbarui,
              solusiBisnis: nextSolution,
              solution: nextSolution,
            };
          });
        },
        addProduct: (produkBaru) => get().tambahProduk(produkBaru),

        perbaruiProduk: (id, pembaruan) => {
          set((state) => {
            const produkDiperbarui = state.daftarProduk.map((p) => {
              if (p.id !== id) return p;
              const nama = pembaruan.nama ?? pembaruan.name ?? p.nama;
              const untung = pembaruan.keuntungan ?? pembaruan.profit ?? p.keuntungan;
              const satuan = pembaruan.satuan ?? pembaruan.unit ?? p.satuan;
              const hanyaUtuh =
                pembaruan.hanyaJumlahUtuh ?? pembaruan.integerOnly ?? p.hanyaJumlahUtuh;
              return {
                ...p,
                ...pembaruan,
                nama,
                name: nama,
                keuntungan: untung,
                profit: untung,
                satuan,
                unit: satuan,
                hanyaJumlahUtuh: hanyaUtuh,
                integerOnly: hanyaUtuh,
              };
            });

            const nextSolution = jalankanPerhitunganBisnis(
              state.tujuanBisnis,
              produkDiperbarui,
              state.daftarSumberDaya,
              state.matriksPemakaian,
              state.penyesuaianSimulasi,
              state.tingkatKetahanan
            );

            return {
              daftarProduk: produkDiperbarui,
              products: produkDiperbarui,
              solusiBisnis: nextSolution,
              solution: nextSolution,
            };
          });
        },
        updateProduct: (id, pembaruan) => get().perbaruiProduk(id, pembaruan),

        hapusProduk: (id) => {
          set((state) => {
            if (state.daftarProduk.length <= 1) return state; // Minimal pertahankan 1 produk
            const produkDiperbarui = state.daftarProduk.filter((p) => p.id !== id);
            const pemakaianDiperbarui: MatriksPemakaian = { ...state.matriksPemakaian };
            delete pemakaianDiperbarui[id];

            const nextSolution = jalankanPerhitunganBisnis(
              state.tujuanBisnis,
              produkDiperbarui,
              state.daftarSumberDaya,
              pemakaianDiperbarui,
              state.penyesuaianSimulasi,
              state.tingkatKetahanan
            );

            return {
              daftarProduk: produkDiperbarui,
              products: produkDiperbarui,
              matriksPemakaian: pemakaianDiperbarui,
              usage: pemakaianDiperbarui,
              solusiBisnis: nextSolution,
              solution: nextSolution,
            };
          });
        },
        removeProduct: (id) => get().hapusProduk(id),

        // Manajemen Sumber Daya
        tambahSumberDaya: (sumberDayaBaru) => {
          set((state) => {
            const idBaru = `r${Date.now()}`;
            const namaBaru =
              sumberDayaBaru?.nama ||
              sumberDayaBaru?.name ||
              `Sumber Daya ${state.daftarSumberDaya.length + 1}`;
            const kapasitasBaru =
              sumberDayaBaru?.kapasitas ?? sumberDayaBaru?.capacity ?? 100;
            const satuanBaru =
              sumberDayaBaru?.satuan || sumberDayaBaru?.unit || 'unit';
            const jenisBaru =
              sumberDayaBaru?.jenisBatasan ||
              sumberDayaBaru?.type ||
              'TIDAK_LEBIH_DARI';

            const sumberDayaDitambahkan: SumberDaya = {
              id: idBaru,
              nama: namaBaru,
              name: namaBaru,
              kapasitas: kapasitasBaru,
              capacity: kapasitasBaru,
              satuan: satuanBaru,
              unit: satuanBaru,
              jenisBatasan: jenisBaru,
              type: jenisBaru,
            };

            const sumberDayaDiperbarui = [...state.daftarSumberDaya, sumberDayaDitambahkan];
            const pemakaianDiperbarui: MatriksPemakaian = { ...state.matriksPemakaian };
            state.daftarProduk.forEach((p) => {
              if (!pemakaianDiperbarui[p.id]) pemakaianDiperbarui[p.id] = {};
              pemakaianDiperbarui[p.id][idBaru] = 1;
            });

            const nextSolution = jalankanPerhitunganBisnis(
              state.tujuanBisnis,
              state.daftarProduk,
              sumberDayaDiperbarui,
              pemakaianDiperbarui,
              state.penyesuaianSimulasi,
              state.tingkatKetahanan
            );

            return {
              daftarSumberDaya: sumberDayaDiperbarui,
              resources: sumberDayaDiperbarui,
              matriksPemakaian: pemakaianDiperbarui,
              usage: pemakaianDiperbarui,
              solusiBisnis: nextSolution,
              solution: nextSolution,
            };
          });
        },
        addResource: (sumberDayaBaru) => get().tambahSumberDaya(sumberDayaBaru),

        perbaruiSumberDaya: (id, pembaruan) => {
          set((state) => {
            const sumberDayaDiperbarui = state.daftarSumberDaya.map((r) => {
              if (r.id !== id) return r;
              const nama = pembaruan.nama ?? pembaruan.name ?? r.nama;
              const kapasitas =
                pembaruan.kapasitas ?? pembaruan.capacity ?? r.kapasitas;
              const satuan = pembaruan.satuan ?? pembaruan.unit ?? r.satuan;
              const jenis =
                pembaruan.jenisBatasan ?? pembaruan.type ?? r.jenisBatasan;

              return {
                ...r,
                ...pembaruan,
                nama,
                name: nama,
                kapasitas,
                capacity: kapasitas,
                satuan,
                unit: satuan,
                jenisBatasan: jenis,
                type: jenis,
              };
            });

            const nextSolution = jalankanPerhitunganBisnis(
              state.tujuanBisnis,
              state.daftarProduk,
              sumberDayaDiperbarui,
              state.matriksPemakaian,
              state.penyesuaianSimulasi,
              state.tingkatKetahanan
            );

            return {
              daftarSumberDaya: sumberDayaDiperbarui,
              resources: sumberDayaDiperbarui,
              solusiBisnis: nextSolution,
              solution: nextSolution,
            };
          });
        },
        updateResource: (id, pembaruan) => get().perbaruiSumberDaya(id, pembaruan),

        hapusSumberDaya: (id) => {
          set((state) => {
            if (state.daftarSumberDaya.length <= 1) return state; // Minimal 1 sumber daya
            const sumberDayaDiperbarui = state.daftarSumberDaya.filter((r) => r.id !== id);
            const pemakaianDiperbarui: MatriksPemakaian = { ...state.matriksPemakaian };
            state.daftarProduk.forEach((p) => {
              if (pemakaianDiperbarui[p.id]) {
                delete pemakaianDiperbarui[p.id][id];
              }
            });

            const nextSolution = jalankanPerhitunganBisnis(
              state.tujuanBisnis,
              state.daftarProduk,
              sumberDayaDiperbarui,
              pemakaianDiperbarui,
              state.penyesuaianSimulasi,
              state.tingkatKetahanan
            );

            return {
              daftarSumberDaya: sumberDayaDiperbarui,
              resources: sumberDayaDiperbarui,
              matriksPemakaian: pemakaianDiperbarui,
              usage: pemakaianDiperbarui,
              solusiBisnis: nextSolution,
              solution: nextSolution,
            };
          });
        },
        removeResource: (id) => get().hapusSumberDaya(id),

        // Matriks Pemakaian
        perbaruiPemakaian: (idProduk, idSumberDaya, nilai) => {
          set((state) => {
            const pemakaianDiperbarui = {
              ...state.matriksPemakaian,
              [idProduk]: {
                ...(state.matriksPemakaian[idProduk] || {}),
                [idSumberDaya]: Math.max(0, nilai),
              },
            };

            const nextSolution = jalankanPerhitunganBisnis(
              state.tujuanBisnis,
              state.daftarProduk,
              state.daftarSumberDaya,
              pemakaianDiperbarui,
              state.penyesuaianSimulasi,
              state.tingkatKetahanan
            );

            return {
              matriksPemakaian: pemakaianDiperbarui,
              usage: pemakaianDiperbarui,
              solusiBisnis: nextSolution,
              solution: nextSolution,
            };
          });
        },
        updateUsage: (idProduk, idSumberDaya, nilai) =>
          get().perbaruiPemakaian(idProduk, idSumberDaya, nilai),

        // Templat Kasus
        muatTemplat: (idTemplat) => {
          const tmpl =
            TEMPLAT_BISNIS.find((t) => t.id === idTemplat) || TEMPLAT_BISNIS[0];
          const produkTmpl = tmpl.daftarProduk || tmpl.products || [];
          const sumberDayaTmpl = tmpl.daftarSumberDaya || tmpl.resources || [];
          const pemakaianTmpl = tmpl.matriksPemakaian || tmpl.usage || {};
          const tujuanTmpl = tmpl.tujuanBisnis || tmpl.objective || 'MAKSIMALKAN_UNTUNG';

          set(() => {
            const nextSolution = jalankanPerhitunganBisnis(
              tujuanTmpl,
              produkTmpl,
              sumberDayaTmpl,
              pemakaianTmpl,
              {},
              'none'
            );

            return {
              tujuanBisnis: tujuanTmpl,
              objective: tujuanTmpl,
              daftarProduk: produkTmpl,
              products: produkTmpl,
              daftarSumberDaya: sumberDayaTmpl,
              resources: sumberDayaTmpl,
              matriksPemakaian: pemakaianTmpl,
              usage: pemakaianTmpl,
              penyesuaianSimulasi: {},
              whatIfAdjustments: {},
              tingkatKetahanan: 'none',
              robustnessLevel: 'none',
              solusiBisnis: nextSolution,
              solution: nextSolution,
            };
          });
        },
        loadTemplate: (idTemplat) => get().muatTemplat(idTemplat),

        aturUlangSemua: () => {
          get().muatTemplat('roti-rumahan');
        },
        resetAll: () => get().aturUlangSemua(),

        // Simulasi Bagaimana Jika
        aturKapasitasSimulasi: (idSumberDaya, kapasitas) => {
          set((state) => {
            const penyesuaianBaru = {
              ...state.penyesuaianSimulasi,
              [idSumberDaya]: kapasitas,
            };
            const nextSolution = jalankanPerhitunganBisnis(
              state.tujuanBisnis,
              state.daftarProduk,
              state.daftarSumberDaya,
              state.matriksPemakaian,
              penyesuaianBaru,
              state.tingkatKetahanan
            );

            return {
              penyesuaianSimulasi: penyesuaianBaru,
              whatIfAdjustments: penyesuaianBaru,
              solusiBisnis: nextSolution,
              solution: nextSolution,
            };
          });
        },
        setWhatIfCapacity: (idSumberDaya, kapasitas) =>
          get().aturKapasitasSimulasi(idSumberDaya, kapasitas),

        geserKapasitasPersen: (idSumberDaya, persentase) => {
          const res = get().daftarSumberDaya.find((r) => r.id === idSumberDaya);
          if (!res) return;
          const capAsli = res.kapasitas ?? res.capacity ?? 0;
          const capSekarang =
            get().penyesuaianSimulasi[idSumberDaya] !== undefined
              ? get().penyesuaianSimulasi[idSumberDaya]
              : capAsli;
          const capBaru = Math.max(0, Math.round(capSekarang * (1 + persentase / 100)));
          get().aturKapasitasSimulasi(idSumberDaya, capBaru);
        },
        adjustWhatIfPercent: (idSumberDaya, persentase) =>
          get().geserKapasitasPersen(idSumberDaya, persentase),

        aturUlangSimulasi: () => {
          set((state) => {
            const nextSolution = jalankanPerhitunganBisnis(
              state.tujuanBisnis,
              state.daftarProduk,
              state.daftarSumberDaya,
              state.matriksPemakaian,
              {},
              state.tingkatKetahanan
            );
            return {
              penyesuaianSimulasi: {},
              whatIfAdjustments: {},
              solusiBisnis: nextSolution,
              solution: nextSolution,
            };
          });
        },
        resetWhatIf: () => get().aturUlangSimulasi(),

        aturTingkatKetahanan: (tingkat) => {
          set((state) => {
            const nextSolution = jalankanPerhitunganBisnis(
              state.tujuanBisnis,
              state.daftarProduk,
              state.daftarSumberDaya,
              state.matriksPemakaian,
              state.penyesuaianSimulasi,
              tingkat
            );
            return {
              tingkatKetahanan: tingkat,
              robustnessLevel: tingkat,
              solusiBisnis: nextSolution,
              solution: nextSolution,
            };
          });
        },
        setRobustnessLevel: (tingkat) => get().aturTingkatKetahanan(tingkat),

        terapkanSaranPerbaikan: (idSumberDaya, saranKapasitas) => {
          get().perbaruiSumberDaya(idSumberDaya, { kapasitas: saranKapasitas, capacity: saranKapasitas });
          get().aturUlangSimulasi();
        },
        applySuggestedFix: (idSumberDaya, saranKapasitas) =>
          get().terapkanSaranPerbaikan(idSumberDaya, saranKapasitas),

        // Skenario
        simpanSkenarioSaatIni: (nama) => {
          set((state) => {
            const skenarioBaru: SkenarioBisnis = {
              id: `skenario_${Date.now()}`,
              nama: nama || `Skenario ${state.daftarSkenario.length + 1}`,
              name: nama || `Skenario ${state.daftarSkenario.length + 1}`,
              waktuDibuat: new Date().toLocaleString('id-ID'),
              createdAt: new Date().toLocaleString('id-ID'),
              tujuanBisnis: state.tujuanBisnis,
              objective: state.tujuanBisnis,
              daftarProduk: state.daftarProduk,
              products: state.daftarProduk,
              daftarSumberDaya: state.daftarSumberDaya,
              resources: state.daftarSumberDaya,
              matriksPemakaian: state.matriksPemakaian,
              usage: state.matriksPemakaian,
              solusiBisnis: state.solusiBisnis,
              solution: state.solusiBisnis,
            };
            const skenarioDiperbarui = [...state.daftarSkenario, skenarioBaru];
            return {
              daftarSkenario: skenarioDiperbarui,
              scenarios: skenarioDiperbarui,
            };
          });
        },
        saveCurrentScenario: (nama) => get().simpanSkenarioSaatIni(nama),

        hapusSkenario: (id) => {
          set((state) => {
            const skenarioDiperbarui = state.daftarSkenario.filter((s) => s.id !== id);
            return {
              daftarSkenario: skenarioDiperbarui,
              scenarios: skenarioDiperbarui,
            };
          });
        },
        deleteScenario: (id) => get().hapusSkenario(id),

        muatSkenario: (id) => {
          const skenario = get().daftarSkenario.find((s) => s.id === id);
          if (!skenario) return;
          const tujuan = skenario.tujuanBisnis || skenario.objective || 'MAKSIMALKAN_UNTUNG';
          const produk = skenario.daftarProduk || skenario.products || [];
          const sumberDaya = skenario.daftarSumberDaya || skenario.resources || [];
          const pemakaian = skenario.matriksPemakaian || skenario.usage || {};
          const solusi = skenario.solusiBisnis || skenario.solution;

          set(() => ({
            tujuanBisnis: tujuan,
            objective: tujuan,
            daftarProduk: produk,
            products: produk,
            daftarSumberDaya: sumberDaya,
            resources: sumberDaya,
            matriksPemakaian: pemakaian,
            usage: pemakaian,
            penyesuaianSimulasi: {},
            whatIfAdjustments: {},
            solusiBisnis: solusi,
            solution: solusi,
            tabAktif: 'results',
            activeTab: 'results',
          }));
        },
        loadScenario: (id) => get().muatSkenario(id),

        // Pengaturan AI
        aturPengaturanAI: (pengaturan) => {
          set((state) => {
            const kunci = pengaturan.kunciAPI ?? pengaturan.apiKey ?? state.pengaturanAI.kunciAPI;
            const apakahLokal = !kunci || kunci.trim() === '';
            const baru: PengaturanAI = {
              ...state.pengaturanAI,
              ...pengaturan,
              kunciAPI: kunci,
              apiKey: kunci,
              apakahLokal,
              isLocal: apakahLokal,
            };
            return { pengaturanAI: baru, aiSettings: baru };
          });
        },
        setAISettings: (pengaturan) => get().aturPengaturanAI(pengaturan),

        // Berbagi & Impor
        imporDataModel: (tujuan, daftarProduk, daftarSumberDaya, matriksPemakaian) => {
          set(() => {
            const nextSolution = jalankanPerhitunganBisnis(
              tujuan,
              daftarProduk,
              daftarSumberDaya,
              matriksPemakaian,
              {},
              'none'
            );
            return {
              tujuanBisnis: tujuan,
              objective: tujuan,
              daftarProduk,
              products: daftarProduk,
              daftarSumberDaya,
              resources: daftarSumberDaya,
              matriksPemakaian,
              usage: matriksPemakaian,
              penyesuaianSimulasi: {},
              whatIfAdjustments: {},
              tingkatKetahanan: 'none',
              robustnessLevel: 'none',
              solusiBisnis: nextSolution,
              solution: nextSolution,
              tabAktif: 'results',
              activeTab: 'results',
            };
          });
        },
        importModelData: (tujuan, daftarProduk, daftarSumberDaya, matriksPemakaian) =>
          get().imporDataModel(tujuan, daftarProduk, daftarSumberDaya, matriksPemakaian),

        dapatkanKodeBerbagi: () => {
          const state = get();
          const dataPaket = {
            o: state.tujuanBisnis,
            p: state.daftarProduk,
            r: state.daftarSumberDaya,
            u: state.matriksPemakaian,
          };
          return LZString.compressToEncodedURIComponent(JSON.stringify(dataPaket));
        },
        getShareableHash: () => get().dapatkanKodeBerbagi(),

        muatDariKodeBerbagi: (kodeTautan) => {
          try {
            const dekompresi = LZString.decompressFromEncodedURIComponent(kodeTautan);
            if (!dekompresi) return false;
            const data = JSON.parse(dekompresi);
            if (data.p && data.r && data.u) {
              get().imporDataModel(
                data.o || 'MAKSIMALKAN_UNTUNG',
                data.p,
                data.r,
                data.u
              );
              return true;
            }
          } catch (e) {
            console.error('Gagal membuka tautan berbagi model', e);
          }
          return false;
        },
        loadFromShareableHash: (kodeTautan) => get().muatDariKodeBerbagi(kodeTautan),
      };
    },
    {
      name: 'optimasi-prediksi-bisnis-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return undefined as any;
        }
        return persistedState;
      },
      partialize: (state) => ({
        tujuanBisnis: state.tujuanBisnis,
        daftarProduk: state.daftarProduk,
        daftarSumberDaya: state.daftarSumberDaya,
        matriksPemakaian: state.matriksPemakaian,
        daftarSkenario: state.daftarSkenario,
        pengaturanAI: {
          ...state.pengaturanAI,
          kunciAPI: '',
          apiKey: '', // Jangan simpan kunci API ke storage lokal demi privasi klien (PRD 7 & 12)
        },
      }),
    }
  )
);
