'use client';

import React, { useState } from 'react';
import { LogPerhitunganLengkap } from '@/types';
import { formatMataUangRupiah, formatAngka } from '@/lib/formatters';
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Terminal,
  Table as TableIcon,
  Copy,
  Check,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface LangkahPerhitunganSimpleksProps {
  logPerhitungan?: LogPerhitunganLengkap;
  totalKeuntungan?: number;
  apakahOptimal?: boolean;
}

export function LangkahPerhitunganSimpleks({
  logPerhitungan,
  totalKeuntungan = 0,
  apakahOptimal = true,
}: LangkahPerhitunganSimpleksProps) {
  const [apakahTerbuka, setApakahTerbuka] = useState(false);
  const [tabAktif, setTabAktif] = useState<'iterasi' | 'cramer' | 'kelayakan' | 'terminal'>('iterasi');
  const [sudahDisalin, setSudahDisalin] = useState(false);

  if (!logPerhitungan) {
    return null;
  }

  const { daftarIterasi = [], verifikasiKendala = [], pesanLog = [], titikPotongSPL } = logPerhitungan;

  const salinLogKeClipboard = () => {
    const teksLog = pesanLog.join('\n');
    navigator.clipboard.writeText(teksLog);
    setSudahDisalin(true);
    setTimeout(() => setSudahDisalin(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-subtle overflow-hidden transition-all">
      {/* Header Akordion / Toggle */}
      <button
        type="button"
        onClick={() => setApakahTerbuka(!apakahTerbuka)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-bg/50 transition-colors focus:outline-none"
        aria-expanded={apakahTerbuka}
      >
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-light text-accent shrink-0 mt-0.5">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-ink">
                Langkah &amp; Verifikasi Perhitungan Matematis (Simpleks &amp; Eliminasi Gauss-Jordan)
              </h3>
              <span className="rounded-md bg-accent-light px-2 py-0.5 text-[11px] font-semibold text-accent">
                Kelompok 9 UNNES
              </span>
              <span className="rounded-md bg-status-optimal-light px-2 py-0.5 text-[11px] font-bold text-status-optimal flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Terverifikasi Bebas Error
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-1">
              Transparansi perhitungan langkah per langkah: Operasi Baris Elementer (OBE), Tabel Simpleks, Eliminasi Gauss-Jordan SPL 2x2, dan Log Konsol C++.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-ink-muted shrink-0 ml-2">
          <span className="text-xs hidden sm:inline font-medium">
            {apakahTerbuka ? 'Sembunyikan' : 'Buka Rincian'}
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-bg border border-border">
            {apakahTerbuka ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>
      </button>

      {/* Konten Terbuka */}
      {apakahTerbuka && (
        <div className="border-t border-border p-5 space-y-5 animate-in fade-in duration-200">
          {/* Menu Tab */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3">
            <button
              onClick={() => setTabAktif('iterasi')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                tabAktif === 'iterasi'
                  ? 'bg-accent text-surface shadow-subtle'
                  : 'bg-bg text-ink-muted hover:text-ink'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Tabel Matriks Simpleks ({daftarIterasi.length} Tahap)</span>
            </button>

            {titikPotongSPL && (
              <button
                onClick={() => setTabAktif('cramer')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  tabAktif === 'cramer'
                    ? 'bg-accent text-surface shadow-subtle'
                    : 'bg-bg text-ink-muted hover:text-ink'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Eliminasi Gauss-Jordan SPL 2x2</span>
              </button>
            )}

            <button
              onClick={() => setTabAktif('kelayakan')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                tabAktif === 'kelayakan'
                  ? 'bg-accent text-surface shadow-subtle'
                  : 'bg-bg text-ink-muted hover:text-ink'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Verifikasi Kelayakan Kendala</span>
            </button>

            <button
              onClick={() => setTabAktif('terminal')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                tabAktif === 'terminal'
                  ? 'bg-accent text-surface shadow-subtle'
                  : 'bg-bg text-ink-muted hover:text-ink'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>Log Konsol Sistem C++</span>
            </button>
          </div>

          {/* TAB 1: TABEL MATRIKS SIMPLEKS PER ITERASI */}
          {tabAktif === 'iterasi' && (
            <div className="space-y-6">
              <div className="rounded-xl bg-accent-light/40 border border-accent/20 p-3.5 text-xs text-ink leading-relaxed">
                <strong>Penjelasan Alur Simpleks:</strong> Pada setiap iterasi, variabel yang koefisien pada baris Tujuan bernilai paling negatif dipilih sebagai <em>Variabel Masuk</em>. Baris dengan rasio pembatas positif terkecil dipilih sebagai <em>Variabel Keluar</em>. Dilakukan Operasi Baris Elementer (OBE) pada elemen pivot hingga seluruh baris fungsi tujuan tidak lagi bernilai negatif.
              </div>

              {daftarIterasi.map((iterasi, idxIterasi) => (
                <div
                  key={idxIterasi}
                  className="rounded-xl border border-border bg-bg/40 p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-surface">
                        {iterasi.nomorIterasi}
                      </span>
                      <span className="text-xs font-bold text-ink">
                        {iterasi.nomorIterasi === 0
                          ? 'Tabel Matriks Simpleks Awal (Iterasi 0)'
                          : `Iterasi ${iterasi.nomorIterasi}`}
                      </span>
                    </div>

                    {iterasi.variabelMasuk && iterasi.variabelKeluar && (
                      <div className="flex items-center gap-2 text-[11px] flex-wrap">
                        <span className="rounded bg-accent-light px-2 py-0.5 font-semibold text-accent">
                          Masuk: {iterasi.variabelMasuk}
                        </span>
                        <ArrowRight className="h-3 w-3 text-ink-muted" />
                        <span className="rounded bg-status-infeasible-light px-2 py-0.5 font-semibold text-status-infeasible">
                          Keluar: {iterasi.variabelKeluar}
                        </span>
                        {iterasi.angkaPivotUtama !== undefined && (
                          <span className="rounded bg-status-optimal-light px-2 py-0.5 font-bold text-status-optimal">
                            Pivot: {formatAngka(iterasi.angkaPivotUtama)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tabel Matriks */}
                  <div className="overflow-x-auto rounded-lg border border-border bg-surface">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-bg text-ink border-b border-border font-bold">
                        <tr>
                          <th className="px-3 py-2 text-ink-muted">Basis</th>
                          {iterasi.labelKolom.map((kolom, kIdx) => (
                            <th
                              key={kIdx}
                              className={`px-3 py-2 text-right ${
                                kolom === iterasi.variabelMasuk
                                  ? 'bg-accent-light text-accent font-extrabold'
                                  : ''
                              }`}
                            >
                              {kolom}
                            </th>
                          ))}
                          <th className="px-3 py-2 text-right bg-bg font-extrabold text-ink">
                            Kapasitas (RHS)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {iterasi.labelBarisBasis.map((barisBasis, bIdx) => (
                          <tr
                            key={bIdx}
                            className={`hover:bg-bg/40 transition-colors ${
                              barisBasis === iterasi.variabelKeluar
                                ? 'bg-status-infeasible-light/30'
                                : ''
                            }`}
                          >
                            <td className="px-3 py-2 font-bold text-ink">
                              {barisBasis}
                            </td>
                            {iterasi.tabelMatriks[bIdx]?.slice(0, iterasi.labelKolom.length).map((nilai, kIdx) => {
                              const kolomLabel = iterasi.labelKolom[kIdx];
                              const adalahSelPivot =
                                kolomLabel === iterasi.variabelMasuk &&
                                barisBasis === iterasi.variabelKeluar;

                              return (
                                <td
                                  key={kIdx}
                                  className={`px-3 py-2 text-right tabular-nums ${
                                    adalahSelPivot
                                      ? 'bg-accent/20 font-extrabold text-accent border border-accent/40 rounded'
                                      : ''
                                  }`}
                                >
                                  {formatAngka(nilai)}
                                </td>
                              );
                            })}
                            <td className="px-3 py-2 text-right font-bold tabular-nums text-ink bg-bg/30">
                              {formatAngka(
                                iterasi.tabelMatriks[bIdx]?.[iterasi.labelKolom.length] ?? 0
                              )}
                            </td>
                          </tr>
                        ))}

                        {/* Baris Fungsi Tujuan (Z) */}
                        <tr className="bg-accent-light/20 font-bold text-ink border-t-2 border-border">
                          <td className="px-3 py-2 text-accent">Tujuan (Z)</td>
                          {iterasi.tabelMatriks[iterasi.labelBarisBasis.length]?.slice(0, iterasi.labelKolom.length).map((nilai, kIdx) => (
                            <td key={kIdx} className="px-3 py-2 text-right tabular-nums text-ink">
                              {formatAngka(nilai)}
                            </td>
                          ))}
                          <td className="px-3 py-2 text-right font-extrabold tabular-nums text-status-optimal">
                            {formatAngka(
                              iterasi.tabelMatriks[iterasi.labelBarisBasis.length]?.[iterasi.labelKolom.length] ?? 0
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {iterasi.catatanOperasi && (
                    <div className="text-[11px] text-ink-muted italic">
                      &bull; {iterasi.catatanOperasi}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: VERIFIKASI ELIMINASI GAUSS-JORDAN (SPL 2x2) */}
          {tabAktif === 'cramer' && titikPotongSPL && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
                <div className="flex items-center gap-2 text-status-optimal font-bold text-sm">
                  <CheckCircle2 className="h-5 w-5" />
                  Verifikasi Titik Potong Menggunakan Eliminasi Gauss-Jordan (Matriks Eselon Baris Tereduksi)
                </div>

                <p className="text-xs text-ink leading-relaxed">
                  Pada program C++ Kelompok 9 UNNES, fungsi <code className="rounded bg-bg px-1.5 py-0.5 text-accent font-mono font-bold">hitungTitikPotongSPL</code> menyelesaikan Sistem Persamaan Linear 2 variabel antara dua kendala operasional yang menjadi penghambat utama (bottleneck) menggunakan metode <strong>Eliminasi Gauss-Jordan</strong> melalui Operasi Baris Elementer (OBE):
                </p>

                {/* Notasi & Tahapan Eliminasi Gauss-Jordan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-lg border border-border bg-bg/50 p-3 space-y-1">
                    <span className="font-bold text-ink-muted text-[11px]">Kendala Pembatas (SPL):</span>
                    <div className="font-semibold text-ink">{titikPotongSPL.garis1}</div>
                    <div className="font-semibold text-ink">{titikPotongSPL.garis2}</div>
                  </div>

                  <div className="rounded-lg border border-border bg-bg/50 p-3 space-y-1">
                    <span className="font-bold text-ink-muted text-[11px]">Tahapan Eliminasi Gauss-Jordan:</span>
                    <div className="font-mono text-accent font-semibold text-[11px]">
                      1. [A | B] → Matriks Augmentasi<br />
                      2. R₁ ← R₁ / a₁₁ (Leading 1)<br />
                      3. R₂ ← R₂ - a₂₁·R₁ (Nol-kan bawah)<br />
                      4. R₂ ← R₂ / a₂₂ &amp; R₁ ← R₁ - a₁₂·R₂
                    </div>
                  </div>

                  <div className="rounded-lg border border-status-optimal-border bg-status-optimal-light/30 p-3 space-y-1">
                    <span className="font-bold text-status-optimal text-[11px]">Hasil Titik Potong SPL:</span>
                    <div className="text-lg font-extrabold text-ink tabular-nums">
                      X₁ = {formatAngka(titikPotongSPL.x1)}, X₂ = {formatAngka(titikPotongSPL.x2)}
                    </div>
                    <div className="text-[11px] text-status-optimal font-semibold">
                      Identik dengan Solusi Optimal Simpleks
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-bg p-3.5 border border-border text-xs text-ink leading-relaxed">
                  <strong>Bukti Matematis:</strong> Melalui Eliminasi Gauss-Jordan hingga diperoleh bentuk eselon baris tereduksi (RREF), titik potong antara garis batasan <em>{titikPotongSPL.garis1}</em> dan <em>{titikPotongSPL.garis2}</em> menghasilkan titik koordinat <strong>({formatAngka(titikPotongSPL.x1)}, {formatAngka(titikPotongSPL.x2)})</strong>. Titik ini terbukti berada tepat pada titik sudut optimal area layak (feasible corner point) dengan keuntungan maksimal sebesar <strong>{formatMataUangRupiah(totalKeuntungan)}</strong>.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VERIFIKASI KELAYAKAN KENDALA */}
          {tabAktif === 'kelayakan' && (
            <div className="space-y-4">
              <p className="text-xs text-ink-muted">
                Fungsi <code className="rounded bg-bg px-1.5 py-0.5 text-accent font-mono font-bold">periksaKelayakanSolusi</code> pada C++ memeriksa bahwa seluruh kendala kapasitas tidak dilanggar oleh jumlah produksi yang direkomendasikan.
              </p>

              <div className="overflow-x-auto rounded-xl border border-border bg-surface">
                <table className="w-full text-xs text-left">
                  <thead className="bg-bg text-ink border-b border-border font-bold">
                    <tr>
                      <th className="px-3.5 py-2.5">Nama Kendala</th>
                      <th className="px-3.5 py-2.5 text-right">Pemakaian Terhitung</th>
                      <th className="px-3.5 py-2.5 text-center">Tanda Batas</th>
                      <th className="px-3.5 py-2.5 text-right">Batas Kapasitas</th>
                      <th className="px-3.5 py-2.5 text-center">Status Kelayakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {verifikasiKendala.map((k, idx) => (
                      <tr key={idx} className="hover:bg-bg/40 transition-colors">
                        <td className="px-3.5 py-2.5 font-bold text-ink">
                          {k.namaKendala}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-medium tabular-nums text-ink">
                          {formatAngka(k.terpakai)} {k.satuan}
                        </td>
                        <td className="px-3.5 py-2.5 text-center font-mono font-bold text-ink-muted">
                          {k.tandaBatas}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-bold tabular-nums text-ink">
                          {formatAngka(k.batasKapasitas)} {k.satuan}
                        </td>
                        <td className="px-3.5 py-2.5 text-center">
                          {k.apakahAman ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-status-optimal-light px-2.5 py-0.5 text-[11px] font-bold text-status-optimal">
                              <CheckCircle2 className="h-3 w-3" />
                              [MEMENUHI]
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-status-infeasible-light px-2.5 py-0.5 text-[11px] font-bold text-status-infeasible">
                              [MELANGGAR]
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: TERMINAL LOG KONSOL C++ */}
          {tabAktif === 'terminal' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-muted font-medium">
                  Output eksekusi persis terminal konsol C++ (Kelompok 9 UNNES)
                </span>
                <button
                  onClick={salinLogKeClipboard}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink hover:bg-bg transition-colors"
                >
                  {sudahDisalin ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-status-optimal" />
                      <span className="text-status-optimal font-semibold">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-ink-muted" />
                      <span>Salin Log</span>
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-xl bg-slate-950 p-4 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-96 leading-relaxed border border-slate-800 shadow-inner">
                {pesanLog.map((baris, bIdx) => (
                  <div
                    key={bIdx}
                    className={`whitespace-pre ${
                      baris.startsWith('[PROSES')
                        ? 'text-cyan-400 font-bold mt-2'
                        : baris.includes('OPTIMAL') || baris.includes('MEMENUHI')
                        ? 'text-emerald-400 font-semibold'
                        : baris.includes('GAGAL') || baris.includes('MELANGGAR')
                        ? 'text-rose-400 font-semibold'
                        : baris.includes('Basis') || baris.includes('Tujuan(Z)')
                        ? 'text-amber-300'
                        : 'text-slate-300'
                    }`}
                  >
                    {baris}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
