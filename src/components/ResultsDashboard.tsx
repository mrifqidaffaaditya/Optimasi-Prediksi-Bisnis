'use client';

import React from 'react';
import { useBusinessStore } from '@/store/useBusinessStore';
import { formatRupiah, formatNumber, formatPercent } from '@/lib/formatters';
import { exportToExcel, exportToPDF, exportToCSV, downloadSvgAsPNG } from '@/lib/exportUtils';
import { FeasibleRegionChart } from './FeasibleRegionChart';
import { WhatIfSection } from './WhatIfSection';
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
    solution,
    objective,
    products,
    resources,
    usage,
    applySuggestedFix,
    setActiveTab,
  } = useBusinessStore();

  const isOptimal = solution.status === 'OPTIMAL';
  const isInfeasible = solution.status === 'INFEASIBLE';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6 animate-in fade-in">
      {/* 1. TOP SUMMARY CARD & EXECUTIVE CONCLUSION (PRD 5.3) */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-status-optimal text-surface">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold text-accent">
                Hasil Optimasi Terpilih
              </span>
              <span className="rounded bg-bg px-2 py-0.5 text-[11px] font-medium text-ink-muted flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Dihitung dalam {solution.calculationTimeMs} ms
              </span>
            </div>

            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-ink tabular-nums">
              {formatRupiah(solution.objectiveValue)}
            </h2>
            <span className="text-xs font-medium text-ink-muted">
              {objective === 'MAXIMIZE_PROFIT'
                ? 'Total Proyeksi Keuntungan Maksimal'
                : 'Total Proyeksi Biaya Operasional Minimum'}
            </span>
          </div>

          {/* Action Buttons: Prominent Ekspor & Ubah Parameter */}
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
              onClick={() => setActiveTab('wizard')}
              className="rounded-xl border border-border bg-bg px-3.5 py-2 text-xs font-semibold text-ink hover:bg-surface transition-colors min-touch-target"
            >
              Ubah Parameter Isian
            </button>
          </div>
        </div>

        {/* 1-Sentence Human Business Conclusion (PRD 5.3 & 10) */}
        <div className="rounded-xl bg-accent-light/50 border border-accent-subtle p-4">
          <div className="text-xs font-bold text-accent mb-1">
            Kesimpulan Bisnis
          </div>
          <p className="text-sm font-semibold text-ink leading-relaxed">
            {solution.conclusionSentence}
          </p>
        </div>

        {/* INFEASIBLE ALERT & 1-CLICK FIX (PRD 5.2) */}
        {isInfeasible && (
          <div className="rounded-xl border-2 border-status-infeasible bg-status-infeasible-light p-5 space-y-3">
            <div className="flex items-center gap-2 text-status-infeasible font-bold text-sm">
              <AlertOctagon className="h-5 w-5" />
              Target Tidak Bisa Dipenuhi
            </div>
            <p className="text-xs text-ink leading-relaxed">
              Kapasitas yang ada saat ini tidak mencukupi untuk memenuhi ketentuan produksi minimum.
            </p>

            {solution.conflictingConstraints && solution.conflictingConstraints.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-status-infeasible-border">
                <span className="text-xs font-bold text-ink">
                  Saran Perbaikan Kapasitas (1-Klik):
                </span>
                {solution.conflictingConstraints.map((c, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg bg-surface p-3 border border-status-infeasible-border text-xs"
                  >
                    <div>
                      <div className="font-semibold text-ink">{c.reason}</div>
                      <div className="text-ink-muted text-[11px]">{c.suggestedFix}</div>
                    </div>
                    <button
                      onClick={() => applySuggestedFix(c.resourceId, c.suggestedCapacity)}
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

      {/* 2. RECOMMENDED PRODUCTION PLAN CARDS & METRICS */}
      {isOptimal && (
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
            {solution.products.map((prod) => (
              <div
                key={prod.id}
                className="rounded-xl border border-border bg-surface p-5 shadow-subtle space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent truncate max-w-[180px]">
                    {prod.name}
                  </span>
                  <span className="rounded bg-accent-light px-2 py-0.5 text-xs font-bold text-accent tabular-nums">
                    {prod.percentageOfTotal}% dari total
                  </span>
                </div>

                <div>
                  <div className="text-2xl font-extrabold text-ink tabular-nums">
                    {formatNumber(prod.quantity)} {prod.unit}
                  </div>
                  <div className="text-xs text-ink-muted mt-0.5">
                    Untung: {formatRupiah(prod.profitPerUnit)} per {prod.unit}
                  </div>
                </div>

                <div className="border-t border-border pt-2 text-xs flex justify-between items-center text-ink">
                  <span className="text-ink-muted">Kontribusi Total:</span>
                  <strong className="text-status-optimal tabular-nums">
                    {formatRupiah(prod.contribution)}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CHARTS SECTION (2D FEASIBLE REGION & RESOURCE UTILIZATION) */}
      {isOptimal && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: 2D Feasible Region (if 2 products) */}
          {solution.geometry2D?.is2D ? (
            <FeasibleRegionChart
              geometry={solution.geometry2D}
              objectiveType={objective}
            />
          ) : (
            <div className="rounded-xl border border-border bg-surface p-6 shadow-subtle flex flex-col justify-center items-center text-center space-y-3">
              <Layers className="h-10 w-10 text-accent/60" />
              <h4 className="text-sm font-bold text-ink">Model Multivariat ({solution.products.length} Produk)</h4>
              <p className="text-xs text-ink-muted max-w-sm">
                Grafik 2D area khusus untuk model 2 produk. Untuk {solution.products.length} produk, perhatikan tabel kontribusi dan diagram pemakaian sumber daya di samping.
              </p>
            </div>
          )}

          {/* Right: Resource Utilization & Bottleneck Chart */}
          <div className="rounded-xl border border-border bg-surface p-5 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-ink">
                  2. Pemakaian Kapasitas Sumber Daya
                </h3>
                <p className="text-xs text-ink-muted">
                  Bahan atau jam kerja yang terpakai penuh adalah batas penghambat utama.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {solution.resources.map((res) => (
                <div key={res.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink flex items-center gap-1.5">
                      {res.name}
                      {res.binding && (
                        <span className="rounded bg-status-infeasible text-surface px-1.5 py-0.5 text-[10px] font-bold">
                          Terpakai Penuh
                        </span>
                      )}
                    </span>
                    <span className="tabular-nums font-medium text-ink-muted">
                      {formatNumber(res.used)} / {formatNumber(res.capacity)} {res.unit} ({res.usagePercent}%)
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                    <div
                      className={`h-full w-full rounded-full origin-left transition-transform ${
                        res.binding ? 'bg-status-infeasible' : 'bg-accent'
                      }`}
                      style={{
                        transform: `scaleX(${Math.min(1, res.usagePercent / 100)})`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-ink-muted">
                    <span>
                      Sisa kapasitas: <strong>{formatNumber(res.slack)} {res.unit}</strong>
                    </span>
                    {res.shadowPrice > 0 ? (
                      <span className="text-status-optimal font-semibold">
                        +1 {res.unit} kapasitas = +{formatRupiah(res.shadowPrice)} untung
                      </span>
                    ) : (
                      <span>Kapasitas masih mencukupi</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. TORNADO CHART: FAKTOR PALING BERPENGARUH (PRD 5.2 & 5.7) */}
      {isOptimal && (
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
            {[...solution.resources]
              .sort((a, b) => b.shadowPrice - a.shadowPrice)
              .map((r, rank) => (
                <div
                  key={r.id}
                  className={`rounded-lg border p-3.5 space-y-1.5 ${
                    rank === 0 && r.shadowPrice > 0
                      ? 'border-status-optimal-border bg-status-optimal-light/40'
                      : 'border-border bg-bg/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-ink">
                      #{rank + 1} {r.name}
                    </span>
                    {r.binding && (
                      <span className="text-[10px] text-status-infeasible font-bold">
                        Penghambat
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-extrabold text-accent tabular-nums">
                    +{formatRupiah(r.shadowPrice)}
                  </div>
                  <div className="text-[11px] text-ink-muted">
                    tambahan untung per 1 {r.unit} kapasitas ekstra
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 5. INTERACTIVE "BAGAIMANA JIKA" WHAT-IF SIMULATION */}
      {isOptimal && <WhatIfSection />}

      {/* 6. DEDICATED QUICK EXPORT SECTION (PRD 6) */}
      {isOptimal && (
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
            {/* Download Excel */}
            <button
              onClick={() => exportToExcel(objective, products, resources, usage, solution)}
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

            {/* Download PDF */}
            <button
              onClick={() => exportToPDF(objective, solution)}
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

            {/* Download Gambar Grafik PNG */}
            <button
              onClick={() => {
                const svgEl = document.querySelector('svg[aria-label="Grafik visualisasi area yang memungkinkan"]') as SVGSVGElement;
                if (svgEl) {
                  downloadSvgAsPNG(svgEl, 'grafik-area-produksi.png');
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

            {/* Download CSV */}
            <button
              onClick={() => exportToCSV(solution, objective)}
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
