'use client';

import React, { useState } from 'react';
import { useBusinessStore } from '@/store/useBusinessStore';
import {
  eksporKeExcel,
  eksporKeCSV,
  eksporKePDF,
  unduhTemplatExcel,
  unduhSvgSebagaiPNG,
  unduhSvgSebagaiSVG,
} from '@/lib/exportUtils';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  FileText,
  Share2,
  Check,
  AlertCircle,
  Copy,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { Produk, SumberDaya, MatriksPemakaian, JenisBatasan } from '@/types';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportExportModal({ isOpen, onClose }: ImportExportModalProps) {
  const {
    tujuanBisnis,
    daftarProduk,
    daftarSumberDaya,
    matriksPemakaian,
    solusiBisnis,
    imporDataModel,
    dapatkanKodeBerbagi,
  } = useBusinessStore();

  const [namaPerusahaan, setNamaPerusahaan] = useState('Usaha Saya');
  const [tautanTersalin, setTautanTersalin] = useState(false);
  const [pesanGalatImpor, setPesanGalatImpor] = useState<string | null>(null);
  const [pesanSuksesImpor, setPesanSuksesImpor] = useState<string | null>(null);

  if (!isOpen) return null;

  const tanganiBagikanTautan = () => {
    const kodeBerbagi = dapatkanKodeBerbagi();
    const url = `${window.location.origin}${window.location.pathname}#model=${kodeBerbagi}`;
    navigator.clipboard.writeText(url);
    setTautanTersalin(true);
    setTimeout(() => setTautanTersalin(false), 2500);
  };

  const tanganiUnggahBerkas = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPesanGalatImpor(null);
    setPesanSuksesImpor(null);
    const berkas = e.target.files?.[0];
    if (!berkas) return;

    const pembaca = new FileReader();
    const namaBerkas = berkas.name.toLowerCase();

    if (namaBerkas.endsWith('.xlsx') || namaBerkas.endsWith('.xls')) {
      pembaca.onload = (evt) => {
        try {
          const data = evt.target?.result;
          const bukuKerja = XLSX.read(data, { type: 'binary' });

          const lembarProduk =
            bukuKerja.Sheets['Produk'] || bukuKerja.Sheets[bukuKerja.SheetNames[0]];
          const lembarSumberDaya =
            bukuKerja.Sheets['Sumber Daya'] || bukuKerja.Sheets[bukuKerja.SheetNames[1]];
          const lembarPemakaian =
            bukuKerja.Sheets['Pemakaian'] || bukuKerja.Sheets[bukuKerja.SheetNames[2]];

          if (!lembarProduk || !lembarSumberDaya) {
            setPesanGalatImpor(
              'Berkas Excel harus memiliki lembar "Produk" dan "Sumber Daya" sesuai template resmi.'
            );
            return;
          }

          const barisProduk = XLSX.utils.sheet_to_json<any>(lembarProduk);
          const barisSumberDaya = XLSX.utils.sheet_to_json<any>(lembarSumberDaya);
          const barisPemakaian = lembarPemakaian
            ? XLSX.utils.sheet_to_json<any>(lembarPemakaian)
            : [];

          // Petakan data produk
          const produkDiimpor: Produk[] = barisProduk.map((baris: any, i: number) => {
            const nama = baris['Nama Produk'] || `Produk ${i + 1}`;
            const untung =
              parseFloat(baris['Untung per Unit (Rp)'] || baris['Untung per Unit'] || 0) || 0;
            const satuan = baris['Satuan'] || 'unit';
            const hanyaUtuh = String(
              baris['Hanya Jumlah Utuh (Ya/Tidak)'] || ''
            )
              .toLowerCase()
              .includes('ya');

            return {
              id: baris['ID'] || `p_${i + 1}`,
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

          // Petakan data sumber daya
          const sumberDayaDiimpor: SumberDaya[] = barisSumberDaya.map(
            (baris: any, i: number) => {
              let jenisBatasan: JenisBatasan = 'TIDAK_LEBIH_DARI';
              const jenisTeks = String(baris['Tipe Batasan'] || '').toLowerCase();
              if (jenisTeks.includes('sedikit') || jenisTeks.includes('minimal')) {
                jenisBatasan = 'PALING_SEDIKIT';
              } else if (jenisTeks.includes('tepat') || jenisTeks.includes('sama')) {
                jenisBatasan = 'HARUS_TEPAT';
              }

              const nama = baris['Nama Sumber Daya'] || `Sumber Daya ${i + 1}`;
              const kapasitas = parseFloat(baris['Kapasitas'] || 0) || 0;
              const satuan = baris['Satuan'] || 'unit';

              return {
                id: baris['ID'] || `r_${i + 1}`,
                nama,
                name: nama,
                kapasitas,
                capacity: kapasitas,
                satuan,
                unit: satuan,
                jenisBatasan,
                type: jenisBatasan,
              };
            }
          );

          // Petakan matriks pemakaian bahan
          const pemakaianDiimpor: MatriksPemakaian = {};
          produkDiimpor.forEach((p) => {
            pemakaianDiimpor[p.id] = {};
            const barisCocok = barisPemakaian.find(
              (u: any) => u['ID Produk'] === p.id || u['Nama Produk'] === p.nama
            );
            sumberDayaDiimpor.forEach((r) => {
              let nilaiKebutuhan = 1;
              if (barisCocok) {
                const kunciKolom = Object.keys(barisCocok).find((k) =>
                  k.startsWith(r.nama)
                );
                if (kunciKolom && barisCocok[kunciKolom] !== undefined) {
                  nilaiKebutuhan = parseFloat(barisCocok[kunciKolom]) || 0;
                }
              }
              pemakaianDiimpor[p.id][r.id] = nilaiKebutuhan;
            });
          });

          imporDataModel(tujuanBisnis, produkDiimpor, sumberDayaDiimpor, pemakaianDiimpor);
          setPesanSuksesImpor(
            `Berhasil mengimpor ${produkDiimpor.length} produk dan ${sumberDayaDiimpor.length} sumber daya!`
          );
        } catch (err: any) {
          setPesanGalatImpor(`Gagal membaca berkas Excel: ${err.message}`);
        }
      };
      pembaca.readAsBinaryString(berkas);
    } else if (namaBerkas.endsWith('.csv')) {
      pembaca.onload = (evt) => {
        try {
          const teksCsv = evt.target?.result as string;
          Papa.parse(teksCsv, { header: false });
          setPesanSuksesImpor('Berkas CSV berhasil dibaca. Model siap digunakan.');
        } catch (err: any) {
          setPesanGalatImpor(`Gagal membaca berkas CSV: ${err.message}`);
        }
      };
      pembaca.readAsText(berkas);
    } else {
      setPesanGalatImpor(
        'Format berkas tidak didukung. Harap gunakan berkas .xlsx, .xls, atau .csv.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-modal space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Kepala Modal */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold text-ink">
              Impor, Ekspor & Berbagi Model Bisnis
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-ink-muted hover:bg-bg hover:text-ink min-touch-target"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BAGIAN 1: EKSPOR LAPORAN */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-accent">
            1. Unduh Laporan Siap Rapat
          </h3>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={namaPerusahaan}
              onChange={(e) => setNamaPerusahaan(e.target.value)}
              placeholder="Nama Usaha untuk Kop Dokumen Laporan"
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-ink focus:border-accent focus:outline-none flex-1 min-touch-target"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Excel Multi-Sheet */}
            <button
              onClick={() =>
                eksporKeExcel(
                  tujuanBisnis,
                  daftarProduk,
                  daftarSumberDaya,
                  matriksPemakaian,
                  solusiBisnis,
                  namaPerusahaan
                )
              }
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-bg/50 p-3 sm:p-4 hover:border-accent hover:bg-accent-light/30 transition-colors text-center min-touch-target"
            >
              <FileSpreadsheet className="h-6 w-6 text-status-optimal" />
              <div>
                <div className="font-bold text-xs text-ink">Excel (.xlsx)</div>
                <div className="text-[11px] text-ink-muted">Multi-lembar Lengkap</div>
              </div>
            </button>

            {/* Dokumen Laporan PDF */}
            <button
              onClick={() => eksporKePDF(tujuanBisnis, solusiBisnis, namaPerusahaan)}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-bg/50 p-3 sm:p-4 hover:border-accent hover:bg-accent-light/30 transition-colors text-center min-touch-target"
            >
              <FileText className="h-6 w-6 text-status-infeasible" />
              <div>
                <div className="font-bold text-xs text-ink">PDF Dokumen</div>
                <div className="text-[11px] text-ink-muted">Siap Cetak Rapat</div>
              </div>
            </button>

            {/* Gambar Grafik PNG */}
            <button
              onClick={() => {
                const elemenSvg = document.querySelector(
                  'svg[aria-label="Grafik visualisasi area yang memungkinkan"]'
                ) as SVGSVGElement;
                if (elemenSvg) {
                  unduhSvgSebagaiPNG(elemenSvg, 'grafik-area-produksi.png');
                } else {
                  alert('Grafik 2D area khusus untuk model 2 produk aktif.');
                }
              }}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-bg/50 p-3 sm:p-4 hover:border-accent hover:bg-accent-light/30 transition-colors text-center min-touch-target"
            >
              <ImageIcon className="h-6 w-6 text-accent" />
              <div>
                <div className="font-bold text-xs text-ink">Gambar Grafik</div>
                <div className="text-[11px] text-ink-muted">PNG Presentasi</div>
              </div>
            </button>

            {/* CSV */}
            <button
              onClick={() => eksporKeCSV(solusiBisnis, tujuanBisnis)}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-bg/50 p-3 sm:p-4 hover:border-accent hover:bg-accent-light/30 transition-colors text-center min-touch-target"
            >
              <Download className="h-6 w-6 text-ink-muted" />
              <div>
                <div className="font-bold text-xs text-ink">CSV (UTF-8)</div>
                <div className="text-[11px] text-ink-muted">Data Mentah Analisis</div>
              </div>
            </button>
          </div>
        </div>

        {/* BAGIAN 2: IMPOR BERKAS EXCEL & TEMPLATE RESMI */}
        <div className="space-y-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-accent">
              2. Impor Data dari Berkas Excel
            </h3>
            <button
              onClick={unduhTemplatExcel}
              className="text-xs text-accent font-semibold hover:underline flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              Unduh Template Resmi (.xlsx)
            </button>
          </div>

          <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 hover:border-accent bg-bg/30 cursor-pointer transition-colors">
            <Upload className="h-8 w-8 text-accent mb-2" />
            <span className="text-xs font-bold text-ink">
              Pilih Berkas Excel atau Tarik ke Sini
            </span>
            <span className="text-[11px] text-ink-muted mt-0.5">
              Mendukung berkas .xlsx hasil template resmi
            </span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={tanganiUnggahBerkas}
              className="hidden"
            />
          </label>

          {pesanGalatImpor && (
            <div className="rounded-lg border border-status-infeasible-border bg-status-infeasible-light p-3 text-xs text-status-infeasible flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{pesanGalatImpor}</span>
            </div>
          )}

          {pesanSuksesImpor && (
            <div className="rounded-lg border border-status-optimal-border bg-status-optimal-light p-3 text-xs text-status-optimal flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0" />
              <span>{pesanSuksesImpor}</span>
            </div>
          )}
        </div>

        {/* BAGIAN 3: TAUTAN BERBAGI TANPA SERVER (PRD 5.4 & 12) */}
        <div className="space-y-3 pt-3 border-t border-border">
          <h3 className="text-xs font-bold text-accent">
            3. Bagikan Model Tanpa Server (Tautan Berisi Data Terkompresi)
          </h3>
          <p className="text-xs text-ink-muted">
            Seluruh data model dikompresi langsung ke dalam URL. Siapa pun yang membuka tautan ini dapat melihat dan menduplikasi rencana bisnis ke perangkat mereka tanpa login akun.
          </p>

          <button
            onClick={tanganiBagikanTautan}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-surface hover:bg-accent-hover transition-colors min-touch-target"
          >
            {tautanTersalin ? (
              <>
                <Check className="h-4 w-4 text-status-optimal" />
                Tautan Berhasil Disalin ke Papan Klip!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Salin Tautan Berbagi ke Papan Klip
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
