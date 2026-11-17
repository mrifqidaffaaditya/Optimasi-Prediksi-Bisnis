'use client';

import React from 'react';
import { useBusinessStore } from '@/store/useBusinessStore';
import { formatMataUangRupiah, formatAngka } from '@/lib/formatters';
import { eksporKeExcel, eksporKePDF, eksporKeCSV, unduhSvgSebagaiPNG } from '@/lib/exportUtils';
import { FeasibleRegionChart } from './FeasibleRegionChart';
import { WhatIfSection } from './WhatIfSection';
import { LangkahPerhitunganSimpleks } from './LangkahPerhitunganSimpleks';
import {
  Sparkles,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Layers,
  Wrench,
  Flame,
  Download,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';

interface ResultsDashboardProps {
  onOpenExport?: () => void;
}

export function ResultsDashboard({ onOpenExport }: ResultsDashboardProps) {
  const {
    solusiBisnis,
    tujuanBisnis,
    daftarProduk,
    daftarSumberDaya,
    matriksPemakaian,
    terapkanSaranPerbaikan,
    aturTabAktif,
  } = useBusinessStore();

  const apakahOptimal = solusiBisnis.status === 'OPTIMAL';
  const apakahTidakLayak =
    solusiBisnis.status === 'TIDAK_LAYAK' || solusiBisnis.status === 'INFEASIBLE';
  const apakahMaksimalkan =
    tujuanBisnis === 'MAKSIMALKAN_UNTUNG' || tujuanBisnis === 'MAXIMIZE_PROFIT';

  const totalNilai = solusiBisnis.totalNilai ?? solusiBisnis.objectiveValue ?? 0;
  const kalimatKesimpulan = solusiBisnis.kalimatKesimpulan || solusiBisnis.conclusionSentence || '';
  const produkHasil = solusiBisnis.daftarProduk || solusiBisnis.products || [];
  const sumberDayaHasil = solusiBisnis.daftarSumberDaya || solusiBisnis.resources || [];
  const batasanTabrakan =
    solusiBisnis.daftarBatasanBertabrakan || solusiBisnis.conflictingConstraints || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6 animate-in fade-in">
      {/* 1. KARTU RINGKASAN EKSEKUTIF UTAMA (PRD 5.3) */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-status-optimal text-surface">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold text-accent">
                Hasil Rekomendasi Terpilih
              </span>
              <span className="rounded bg-bg px-2 py-0.5 text-[11px] font-medium text-ink-muted flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Dihitung dalam {solusiBisnis.waktuPerhitunganMs ?? solusiBisnis.calculationTimeMs ?? 0} ms
              </span>
            </div>

            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-ink tabular-nums">
              {formatMataUangRupiah(totalNilai)}
            </h2>
            <span className="text-xs font-medium text-ink-muted">
              {apakahMaksimalkan
                ? 'Total Proyeksi Keuntungan Bersih Maksimal'
                : 'Total Proyeksi Biaya Operasional Minimum'}
            </span>
          </div>

          {/* Tombol Aksi Cepat */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenExport && (
              <button
                onClick={onOpenExport}
                className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-surface shadow-subtle hover:bg-accent-hover transition-colors min-touch-target"
                title="Ekspor laporan ke format Excel, PDF, CSV, atau bagikan tautan"
              >
                <Download className="h-4 w-4" />
                <span>Ekspor Laporan (Excel/PDF/CSV)</span>
              </button>
            )}
            <button
              onClick={() => aturTabAktif('wizard')}
              className="rounded-xl border border-border bg-bg px-3.5 py-2 text-xs font-semibold text-ink hover:bg-surface transition-colors min-touch-target"
            >
              Ubah Parameter Isian
            </button>
          </div>
        </div>

        {/* 1 Kalimat Kesimpulan Ramah Non-IT (PRD 5.3 & 10) */}
        <div className="rounded-xl bg-accent-light/50 border border-accent-subtle p-4">
          <div className="text-xs font-bold text-accent mb-1">
            Kesimpulan Bisnis
          </div>
          <p className="text-sm font-semibold text-ink leading-relaxed">
            {kalimatKesimpulan}
          </p>
        </div>

        {/* PEMBERITAHUAN TARGET TIDAK DAPAT DIPENUHI & TOMBOL PERBAIKAN 1-KLIK (PRD 5.2) */}
        {apakahTidakLayak && (
          <div className="rounded-xl border-2 border-status-infeasible bg-status-infeasible-light p-5 space-y-3">
            <div className="flex items-center gap-2 text-status-infeasible font-bold text-sm">
              <AlertOctagon className="h-5 w-5" />
              Target Belum Bisa Dipenuhi
            </div>
            <p className="text-xs text-ink leading-relaxed">
              Kapasitas yang ada saat ini tidak mencukupi untuk memenuhi ketentuan produksi minimum.
            </p>

            {batasanTabrakan.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-status-infeasible-border">
                <span className="text-xs font-bold text-ink">
                  Saran Solusi Perbaikan Kapasitas (1-Klik Langsung Beres):
                </span>
                {batasanTabrakan.map((c, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg bg-surface p-3 border border-status-infeasible-border text-xs"
                  >
                    <div>
                      <div className="font-semibold text-ink">{c.alasan || c.reason}</div>
                      <div className="text-ink-muted text-[11px]">{c.saranPerbaikan || c.suggestedFix}</div>
                    </div>
                    <button
                      onClick={() =>
                        terapkanSaranPerbaikan(
                          c.idSumberDaya || c.resourceId || '',
                          c.saranKapasitas ?? c.suggestedCapacity ?? 0
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-status-infeasible px-3 py-1.5 font-bold text-surface hover:opacity-90 transition-opacity min-touch-target self-start sm:self-auto"
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      Terapkan Perbaikan
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. KARTU RENCANA PRODUKSI YANG DIREKOMENDASIKAN */}
      {apakahOptimal && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-ink">
              1. Rencana Produksi yang Direkomendasikan
            </h3>
            <span className="text-xs text-ink-muted">
              Alokasi produk paling menguntungkan
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {produkHasil.map((prod) => {
              const nama = prod.nama || prod.name;
              const jumlah = prod.jumlahProduksi ?? prod.quantity ?? 0;
              const satuan = prod.satuan || prod.unit;
              const untung = prod.keuntunganPerUnit ?? prod.profitPerUnit ?? 0;
              const kontribusi = prod.kontribusiKeuntungan ?? prod.contribution ?? 0;
              const porsi = prod.persentaseTotal ?? prod.percentageOfTotal ?? 0;

              return (
                <div
                  key={prod.id}
                  className="rounded-xl border border-border bg-surface p-5 shadow-subtle space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-accent truncate max-w-[180px]">
                      {nama}
                    </span>
                    <span className="rounded bg-accent-light px-2 py-0.5 text-xs font-bold text-accent tabular-nums">
                      {porsi}% dari total
                    </span>
                  </div>

                  <div>
                    <div className="text-2xl font-extrabold text-ink tabular-nums">
                      {formatAngka(jumlah)} {satuan}
                    </div>
                    <div className="text-xs text-ink-muted mt-0.5">
                      Untung: {formatMataUangRupiah(untung)} per {satuan}
                    </div>
                  </div>

                  <div className="border-t border-border pt-2 text-xs flex justify-between items-center text-ink">
                    <span className="text-ink-muted">Kontribusi Total:</span>
                    <strong className="text-status-optimal tabular-nums">
                      {formatMataUangRupiah(kontribusi)}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. BAGIAN GRAFIK (AREA PRODUKSI 2D & KETERPAIKAN SUMBER DAYA) */}
      {apakahOptimal && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grafik Kiri: Area 2D (Jika Model 2 Produk) */}
          {solusiBisnis.geometri2D?.apakah2D || solusiBisnis.geometri2D?.is2D ? (
            <FeasibleRegionChart
              geometry={solusiBisnis.geometri2D}
              objectiveType={tujuanBisnis}
            />
          ) : (
            <div className="rounded-xl border border-border bg-surface p-6 shadow-subtle flex flex-col justify-center items-center text-center space-y-3">
              <Layers className="h-10 w-10 text-accent/60" />
              <h4 className="text-sm font-bold text-ink">
                Model Banyak Pilihan ({produkHasil.length} Produk)
              </h4>
              <p className="text-xs text-ink-muted max-w-sm">
                Grafik visual 2D aktif khusus untuk model 2 produk. Untuk {produkHasil.length} produk, amati tabel kontribusi keuntungan dan diagram kapasitas sumber daya di samping.
              </p>
            </div>
          )}

          {/* Grafik Kanan: Pemakaian Kapasitas Sumber Daya & Penghambat */}
          <div className="rounded-xl border border-border bg-surface p-5 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-ink">
                  2. Pemakaian Kapasitas Sumber Daya
                </h3>
                <p className="text-xs text-ink-muted">
                  Bahan atau jam kerja yang terpakai penuh adalah batas penghambat utama laba usaha.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {sumberDayaHasil.map((res) => {
                const nama = res.nama || res.name;
                const used = res.kapasitasTerpakai ?? res.used ?? 0;
                const cap = res.kapasitasTersedia ?? res.capacity ?? 0;
                const satuan = res.satuan || res.unit;
                const porsiPakai = res.persentasePemakaian ?? res.usagePercent ?? 0;
                const sisa = res.sisaKapasitas ?? res.slack ?? 0;
                const terpakaiPenuh = res.terpakaiPenuh ?? res.binding ?? false;
                const nilaiTambah = res.nilaiTambahPerUnit ?? res.shadowPrice ?? 0;

                return (
                  <div key={res.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink flex items-center gap-1.5">
                        {nama}
                        {terpakaiPenuh && (
                          <span className="rounded bg-status-infeasible text-surface px-1.5 py-0.5 text-[10px] font-bold">
                            Terpakai Penuh
                          </span>
                        )}
                      </span>
                      <span className="tabular-nums font-medium text-ink-muted">
                        {formatAngka(used)} / {formatAngka(cap)} {satuan} ({porsiPakai}%)
                      </span>
                    </div>

                    {/* Progress Bar Visual */}
                    <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                      <div
                        className={`h-full w-full rounded-full origin-left transition-transform ${
                          terpakaiPenuh ? 'bg-status-infeasible' : 'bg-accent'
                        }`}
                        style={{
                          transform: `scaleX(${Math.min(1, porsiPakai / 100)})`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-ink-muted">
                      <span>
                        Sisa kapasitas: <strong>{formatAngka(sisa)} {satuan}</strong>
                      </span>
                      {nilaiTambah > 0 ? (
                        <span className="text-status-optimal font-semibold">
                          +1 {satuan} kapasitas = +{formatMataUangRupiah(nilaiTambah)} untung
                        </span>
                      ) : (
                        <span>Kapasitas masih mencukupi</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. PERINGKAT SUMBER DAYA PALING BERPENGARUH (TORNADO CHART / SHADOW PRICE) */}
      {apakahOptimal && (
        <div className="rounded-xl border border-border bg-surface p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <Flame className="h-4 w-4 text-status-warn" />
                3. Faktor Paling Berpengaruh (Peringkat Nilai Tambah Sumber Daya)
              </h3>
              <p className="text-xs text-ink-muted">
                Sumber daya mana yang paling menguntungkan jika Anda menambah persediaannya?
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[...sumberDayaHasil]
              .sort(
                (a, b) =>
                  (b.nilaiTambahPerUnit ?? b.shadowPrice ?? 0) -
                  (a.nilaiTambahPerUnit ?? a.shadowPrice ?? 0)
              )
              .map((r, peringkat) => {
                const nama = r.nama || r.name;
                const nilaiTambah = r.nilaiTambahPerUnit ?? r.shadowPrice ?? 0;
                const satuan = r.satuan || r.unit;
                const terpakaiPenuh = r.terpakaiPenuh ?? r.binding ?? false;

                return (
                  <div
                    key={r.id}
                    className={`rounded-lg border p-3.5 space-y-1.5 ${
                      peringkat === 0 && nilaiTambah > 0
                        ? 'border-status-optimal-border bg-status-optimal-light/40'
                        : 'border-border bg-bg/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-ink">
                        #{peringkat + 1} {nama}
                      </span>
                      {terpakaiPenuh && (
                        <span className="text-[10px] text-status-infeasible font-bold">
                          Penghambat Utama
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-extrabold text-accent tabular-nums">
                      +{formatMataUangRupiah(nilaiTambah)}
                    </div>
                    <div className="text-[11px] text-ink-muted">
                      tambahan untung per 1 {satuan} kapasitas ekstra
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 5. SIMULASI "BAGAIMANA JIKA" (WHAT-IF) */}
      {apakahOptimal && <WhatIfSection />}

      {/* 6. LANGKAH PERHITUNGAN SIMPLEKS & VERIFIKASI SPL (C++ IMPLEMENTATION) */}
      {solusiBisnis.logPerhitungan && (
        <LangkahPerhitunganSimpleks
          logPerhitungan={solusiBisnis.logPerhitungan}
          totalKeuntungan={totalNilai}
          apakahOptimal={apakahOptimal}
        />
      )}

      {/* 7. PUSAT UNDUH & EKSPOR LAPORAN (PRD 6) */}
      {apakahOptimal && (
        <div className="rounded-2xl border-2 border-accent/30 bg-surface p-5 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
            <div>
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <Download className="h-5 w-5 text-accent" />
                Ekspor &amp; Unduh Dokumen Hasil Analisis
              </h3>
              <p className="text-xs text-ink-muted">
                Unduh hasil optimasi langsung ke perangkat Anda dalam format spreadsheet resmi atau dokumen siap cetak.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Unduh Excel */}
            <button
              onClick={() =>
                eksporKeExcel(
                  tujuanBisnis,
                  daftarProduk,
                  daftarSumberDaya,
                  matriksPemakaian,
                  solusiBisnis
                )
              }
              className="flex items-center gap-3 rounded-xl border border-border bg-bg/60 p-3.5 hover:bg-surface hover:border-accent transition-colors text-left min-touch-target"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-optimal-light text-status-optimal shrink-0">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-ink">Unduh Excel (.xlsx)</div>
                <div className="text-[11px] text-ink-muted truncate">3 lembar kerja lengkap</div>
              </div>
            </button>

            {/* Unduh PDF */}
            <button
              onClick={() => eksporKePDF(tujuanBisnis, solusiBisnis)}
              className="flex items-center gap-3 rounded-xl border border-border bg-bg/60 p-3.5 hover:bg-surface hover:border-accent transition-colors text-left min-touch-target"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-infeasible-light text-status-infeasible shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-ink">Unduh PDF Resmi</div>
                <div className="text-[11px] text-ink-muted truncate">Format A4 siap rapat</div>
              </div>
            </button>

            {/* Unduh Gambar Grafik PNG */}
            <button
              onClick={() => {
                const elemenSvg = document.querySelector(
                  'svg[aria-label="Grafik visualisasi area yang memungkinkan"]'
                ) as SVGSVGElement;
                if (elemenSvg) {
                  unduhSvgSebagaiPNG(elemenSvg, 'grafik-area-produksi.png');
                } else {
                  alert('Grafik visualisasi 2D khusus untuk model 2 produk aktif.');
                }
              }}
              className="flex items-center gap-3 rounded-xl border border-border bg-bg/60 p-3.5 hover:bg-surface hover:border-accent transition-colors text-left min-touch-target"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-light text-accent shrink-0">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-ink">Unduh Gambar Grafik</div>
                <div className="text-[11px] text-ink-muted truncate">Format PNG presentasi</div>
              </div>
            </button>

            {/* Unduh CSV */}
            <button
              onClick={() => eksporKeCSV(solusiBisnis, tujuanBisnis)}
              className="flex items-center gap-3 rounded-xl border border-border bg-bg/60 p-3.5 hover:bg-surface hover:border-accent transition-colors text-left min-touch-target"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg border border-border text-ink-muted shrink-0">
                <Download className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-ink">Unduh CSV Mentah</div>
                <div className="text-[11px] text-ink-muted truncate">Format UTF-8 universal</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
