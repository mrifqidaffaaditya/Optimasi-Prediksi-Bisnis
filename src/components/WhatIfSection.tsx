'use client';

import React from 'react';
import { useBusinessStore } from '@/store/useBusinessStore';
import { formatRupiah, formatNumber } from '@/lib/formatters';
import {
  SlidersHorizontal,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export function WhatIfSection() {
  const {
    resources,
    whatIfAdjustments,
    setWhatIfCapacity,
    adjustWhatIfPercent,
    resetWhatIf,
    robustnessLevel,
    setRobustnessLevel,
    solution,
  } = useBusinessStore();

  const isAdjusted = Object.keys(whatIfAdjustments).length > 0 || robustnessLevel !== 'none';

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-subtle space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-accent" />
            <h3 className="text-base font-bold text-ink">
              Simulasi &quot;Bagaimana Jika&quot; (Real-Time)
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-ink-muted">
            Geser kapasitas atau gunakan tombol cepat untuk melihat perubahan keuntungan seketika (&lt;100ms) sebelum mengambil keputusan operasional.
          </p>
        </div>

        {isAdjusted && (
          <button
            onClick={resetWhatIf}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-semibold text-status-infeasible hover:bg-surface transition-colors min-touch-target self-start"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Kembalikan ke Kapasitas Asli
          </button>
        )}
      </div>

      {/* Robustness Stress Test (Uji Ketahanan PRD 5.2) */}
      <div className="rounded-xl border border-border bg-bg/60 p-4 space-y-3 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <span className="text-xs font-bold text-ink flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-accent" />
            Uji Ketahanan Kapasitas (Stress Test)
          </span>
          <span className="text-[11px] text-ink-muted">
            Simulasi jika kapasitas turun tak terduga (pasokan terlambat / kendala mesin)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => setRobustnessLevel('none')}
            className={`rounded-xl border px-2.5 py-2 text-xs font-medium transition-colors min-touch-target text-center ${
              robustnessLevel === 'none'
                ? 'border-accent bg-accent text-surface font-bold shadow-subtle'
                : 'border-border bg-surface text-ink-muted hover:border-accent/40'
            }`}
          >
            <div>Normal</div>
            <div className="text-[10px] opacity-80">(100%)</div>
          </button>
          <button
            onClick={() => setRobustnessLevel('light')}
            className={`rounded-xl border px-2.5 py-2 text-xs font-medium transition-colors min-touch-target text-center ${
              robustnessLevel === 'light'
                ? 'border-status-warn bg-status-warn text-surface font-bold shadow-subtle'
                : 'border-border bg-surface text-ink-muted hover:border-status-warn/40'
            }`}
          >
            <div>Ringan</div>
            <div className="text-[10px] opacity-80">(-5% kapasitas)</div>
          </button>
          <button
            onClick={() => setRobustnessLevel('medium')}
            className={`rounded-xl border px-2.5 py-2 text-xs font-medium transition-colors min-touch-target text-center ${
              robustnessLevel === 'medium'
                ? 'border-status-warn bg-status-warn text-surface font-bold shadow-subtle'
                : 'border-border bg-surface text-ink-muted hover:border-status-warn/40'
            }`}
          >
            <div>Sedang</div>
            <div className="text-[10px] opacity-80">(-10% kapasitas)</div>
          </button>
          <button
            onClick={() => setRobustnessLevel('heavy')}
            className={`rounded-xl border px-2.5 py-2 text-xs font-medium transition-colors min-touch-target text-center ${
              robustnessLevel === 'heavy'
                ? 'border-status-infeasible bg-status-infeasible text-surface font-bold shadow-subtle'
                : 'border-border bg-surface text-ink-muted hover:border-status-infeasible/40'
            }`}
          >
            <div>Berat</div>
            <div className="text-[10px] opacity-80">(-20% kapasitas)</div>
          </button>
        </div>
      </div>

      {/* Realtime Sliders per Resource */}
      <div className="space-y-4">
        {resources.map((res) => {
          const originalCap = res.capacity;
          const currentCap =
            whatIfAdjustments[res.id] !== undefined
              ? whatIfAdjustments[res.id]
              : originalCap;
          const delta = currentCap - originalCap;

          const resResult = solution.resources.find((r) => r.id === res.id);
          const shadowPrice = resResult?.shadowPrice ?? 0;

          return (
            <div
              key={res.id}
              className="rounded-xl border border-border bg-surface p-4 space-y-3 transition-colors hover:border-accent/30 overflow-hidden"
            >
              <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-bold text-ink text-sm">{res.name}</span>
                  {shadowPrice > 0 && (
                    <span className="inline-block mt-0.5 sm:mt-0 sm:ml-2 rounded bg-status-optimal-light text-status-optimal px-2 py-0.5 text-[11px] font-semibold">
                      Nilai Tambah: +{formatRupiah(shadowPrice)} per {res.unit}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="tabular-nums font-bold text-accent text-sm">
                    {formatNumber(currentCap)} {res.unit}
                  </span>
                  {delta !== 0 && (
                    <span
                      className={`text-xs font-semibold tabular-nums ${
                        delta > 0 ? 'text-status-optimal' : 'text-status-infeasible'
                      }`}
                    >
                      ({delta > 0 ? `+${formatNumber(delta)}` : formatNumber(delta)})
                    </span>
                  )}
                </div>
              </div>

              {/* Slider Input */}
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max={Math.round(originalCap * 2.5) || 100}
                  step="1"
                  value={currentCap}
                  onChange={(e) =>
                    setWhatIfCapacity(res.id, parseFloat(e.target.value) || 0)
                  }
                  className="w-full accent-accent h-2 bg-bg rounded-lg cursor-pointer min-touch-target"
                />
              </div>

              {/* Quick Increment Buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[11px] text-ink-muted mr-1">Tombol cepat:</span>
                <button
                  onClick={() => adjustWhatIfPercent(res.id, -10)}
                  className="rounded border border-border bg-bg px-2 py-1 font-medium hover:bg-surface transition-colors min-touch-target"
                >
                  -10%
                </button>
                <button
                  onClick={() => adjustWhatIfPercent(res.id, 5)}
                  className="rounded border border-border bg-bg px-2 py-1 font-medium hover:bg-surface transition-colors min-touch-target"
                >
                  +5%
                </button>
                <button
                  onClick={() => adjustWhatIfPercent(res.id, 10)}
                  className="rounded border border-border bg-bg px-2 py-1 font-medium hover:bg-surface transition-colors min-touch-target"
                >
                  +10%
                </button>
                <button
                  onClick={() => setWhatIfCapacity(res.id, originalCap)}
                  className="rounded border border-border bg-bg px-2 py-1 font-medium text-ink-muted hover:text-ink transition-colors min-touch-target ml-auto"
                >
                  Reset
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
