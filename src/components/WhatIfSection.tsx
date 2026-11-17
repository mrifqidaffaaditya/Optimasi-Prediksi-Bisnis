'use client';

import React from 'react';
import { useBusinessStore } from '@/store/useBusinessStore';
import { formatMataUangRupiah, formatAngka } from '@/lib/formatters';
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
    daftarSumberDaya,
    penyesuaianSimulasi,
    aturKapasitasSimulasi,
    geserKapasitasPersen,
    aturUlangSimulasi,
    tingkatKetahanan,
    aturTingkatKetahanan,
    solusiBisnis,
  } = useBusinessStore();

  const apakahAdaPenyesuaian =
    Object.keys(penyesuaianSimulasi).length > 0 || tingkatKetahanan !== 'none';

  const sumberDayaHasil = solusiBisnis.daftarSumberDaya || solusiBisnis.resources || [];

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-subtle space-y-6">
      {/* Kepala Bagian Simulasi */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-accent" />
            <h3 className="text-base font-bold text-ink">
              Simulasi Interaktif &quot;Bagaimana Jika&quot; (Seketika &lt;100ms)
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-ink-muted">
            Geser kapasitas atau gunakan tombol cepat untuk melihat perubahan keuntungan sebelum mengambil keputusan operasional nyata.
          </p>
        </div>

        {apakahAdaPenyesuaian && (
          <button
            onClick={aturUlangSimulasi}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-semibold text-status-infeasible hover:bg-surface transition-colors min-touch-target self-start"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Kembalikan ke Kapasitas Asli
          </button>
        )}
      </div>

      {/* Uji Ketahanan Pasokan (Stress Test PRD 5.2) */}
      <div className="rounded-xl border border-border bg-bg/60 p-4 space-y-3 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <span className="text-xs font-bold text-ink flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-accent" />
            Uji Ketahanan Usaha (Stress Test Pasokan)
          </span>
          <span className="text-[11px] text-ink-muted">
            Simulasi jika pasokan bahan berkurang tiba-tiba (kendala rantai pasok atau mesin)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Tingkat Normal */}
          <button
            onClick={() => aturTingkatKetahanan('none')}
            className={`rounded-xl border px-2.5 py-2 text-xs font-medium transition-colors min-touch-target text-center ${
              tingkatKetahanan === 'none'
                ? 'border-accent bg-accent text-surface font-bold shadow-subtle'
                : 'border-border bg-surface text-ink-muted hover:border-accent/40'
            }`}
          >
            <div>Normal</div>
            <div className="text-[10px] opacity-80">(100% kapasitas)</div>
          </button>

          {/* Tingkat Ringan (-5%) */}
          <button
            onClick={() => aturTingkatKetahanan('light')}
            className={`rounded-xl border px-2.5 py-2 text-xs font-medium transition-colors min-touch-target text-center ${
              tingkatKetahanan === 'light'
                ? 'border-status-warn bg-status-warn text-surface font-bold shadow-subtle'
                : 'border-border bg-surface text-ink-muted hover:border-status-warn/40'
            }`}
          >
            <div>Ringan</div>
            <div className="text-[10px] opacity-80">(-5% kapasitas)</div>
          </button>

          {/* Tingkat Sedang (-10%) */}
          <button
            onClick={() => aturTingkatKetahanan('medium')}
            className={`rounded-xl border px-2.5 py-2 text-xs font-medium transition-colors min-touch-target text-center ${
              tingkatKetahanan === 'medium'
                ? 'border-status-warn bg-status-warn text-surface font-bold shadow-subtle'
                : 'border-border bg-surface text-ink-muted hover:border-status-warn/40'
            }`}
          >
            <div>Sedang</div>
            <div className="text-[10px] opacity-80">(-10% kapasitas)</div>
          </button>

          {/* Tingkat Berat (-20%) */}
          <button
            onClick={() => aturTingkatKetahanan('heavy')}
            className={`rounded-xl border px-2.5 py-2 text-xs font-medium transition-colors min-touch-target text-center ${
              tingkatKetahanan === 'heavy'
                ? 'border-status-infeasible bg-status-infeasible text-surface font-bold shadow-subtle'
                : 'border-border bg-surface text-ink-muted hover:border-status-infeasible/40'
            }`}
          >
            <div>Berat</div>
            <div className="text-[10px] opacity-80">(-20% kapasitas)</div>
          </button>
        </div>
      </div>

      {/* Penggeser (Slider) Realtime Tiap Sumber Daya */}
      <div className="space-y-4">
        {daftarSumberDaya.map((res) => {
          const kapasitasAsli = res.kapasitas ?? res.capacity ?? 0;
          const kapasitasSekarang =
            penyesuaianSimulasi[res.id] !== undefined
              ? penyesuaianSimulasi[res.id]
              : kapasitasAsli;
          const selisih = kapasitasSekarang - kapasitasAsli;

          const hasilRes = sumberDayaHasil.find((r) => r.id === res.id);
          const nilaiTambah = hasilRes?.nilaiTambahPerUnit ?? hasilRes?.shadowPrice ?? 0;
          const namaRes = res.nama || res.name;
          const satuanRes = res.satuan || res.unit;

          return (
            <div
              key={res.id}
              className="rounded-xl border border-border bg-surface p-4 space-y-3 transition-colors hover:border-accent/30 overflow-hidden"
            >
              <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-bold text-ink text-sm">{namaRes}</span>
                  {nilaiTambah > 0 && (
                    <span className="inline-block mt-0.5 sm:mt-0 sm:ml-2 rounded bg-status-optimal-light text-status-optimal px-2 py-0.5 text-[11px] font-semibold">
                      Nilai Tambah: +{formatMataUangRupiah(nilaiTambah)} per {satuanRes}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="tabular-nums font-bold text-accent text-sm">
                    {formatAngka(kapasitasSekarang)} {satuanRes}
                  </span>
                  {selisih !== 0 && (
                    <span
                      className={`text-xs font-semibold tabular-nums ${
                        selisih > 0 ? 'text-status-optimal' : 'text-status-infeasible'
                      }`}
                    >
                      ({selisih > 0 ? `+${formatAngka(selisih)}` : formatAngka(selisih)})
                    </span>
                  )}
                </div>
              </div>

              {/* Batang Penggeser Kapasitas */}
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max={Math.round(kapasitasAsli * 2.5) || 100}
                  step="1"
                  value={kapasitasSekarang}
                  onChange={(e) =>
                    aturKapasitasSimulasi(res.id, parseFloat(e.target.value) || 0)
                  }
                  className="w-full accent-accent h-2 bg-bg rounded-lg cursor-pointer min-touch-target"
                />
              </div>

              {/* Tombol Cepat Geser */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[11px] text-ink-muted mr-1">Tombol cepat:</span>
                <button
                  onClick={() => geserKapasitasPersen(res.id, -10)}
                  className="rounded border border-border bg-bg px-2 py-1 font-medium hover:bg-surface transition-colors min-touch-target"
                >
                  -10%
                </button>
                <button
                  onClick={() => geserKapasitasPersen(res.id, 5)}
                  className="rounded border border-border bg-bg px-2 py-1 font-medium hover:bg-surface transition-colors min-touch-target"
                >
                  +5%
                </button>
                <button
                  onClick={() => geserKapasitasPersen(res.id, 10)}
                  className="rounded border border-border bg-bg px-2 py-1 font-medium hover:bg-surface transition-colors min-touch-target"
                >
                  +10%
                </button>
                <button
                  onClick={() => aturKapasitasSimulasi(res.id, kapasitasAsli)}
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
