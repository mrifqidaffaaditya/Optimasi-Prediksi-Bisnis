'use client';

import React, { useState } from 'react';
import { useBusinessStore } from '@/store/useBusinessStore';
import { formatMataUangRupiah, formatAngka } from '@/lib/formatters';
import {
  X,
  Bookmark,
  Plus,
  Trash2,
  FolderOpen,
  ArrowRight,
  TrendingUp,
  Layers,
} from 'lucide-react';

interface ScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScenariosModal({ isOpen, onClose }: ScenariosModalProps) {
  const {
    daftarSkenario,
    simpanSkenarioSaatIni,
    hapusSkenario,
    muatSkenario,
    solusiBisnis,
  } = useBusinessStore();

  const [namaSkenarioBaru, setNamaSkenarioBaru] = useState('');

  if (!isOpen) return null;

  const tanganiSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSkenarioBaru.trim()) return;
    simpanSkenarioSaatIni(namaSkenarioBaru.trim());
    setNamaSkenarioBaru('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl rounded-2xl border border-border bg-surface p-6 shadow-modal space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Kepala Modal */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold text-ink">
              Kelola & Bandingkan Skenario Bisnis
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-ink-muted hover:bg-bg hover:text-ink min-touch-target"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulir Simpan Rencana Saat Ini */}
        <form onSubmit={tanganiSimpan} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={namaSkenarioBaru}
            onChange={(e) => setNamaSkenarioBaru(e.target.value)}
            placeholder="Beri nama skenario (contoh: Tambah Mesin 2, Stok Menjelang Lebaran)"
            className="flex-1 rounded-xl border border-border bg-surface px-4 py-2 text-sm text-ink focus:border-accent focus:outline-none min-touch-target"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-xs font-semibold text-surface hover:bg-accent-hover transition-colors min-touch-target"
          >
            <Plus className="h-4 w-4" />
            Simpan Skenario Saat Ini
          </button>
        </form>

        {/* Tampilan Daftar & Perbandingan Skenario */}
        {daftarSkenario.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-2">
            <Bookmark className="mx-auto h-8 w-8 text-ink-muted/50" />
            <p className="text-sm font-semibold text-ink">Belum Ada Skenario Tersimpan</p>
            <p className="text-xs text-ink-muted max-w-md mx-auto">
              Simpan skenario saat ini untuk membandingkan berbagai strategi bisnis berdampingan (side-by-side).
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-accent">
              Daftar & Perbandingan Skenario ({daftarSkenario.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {daftarSkenario.map((skenario) => {
                const solusi = skenario.solusiBisnis || skenario.solution;
                const totalNilai = solusi?.totalNilai ?? solusi?.objectiveValue ?? 0;
                const produkList = solusi?.daftarProduk || solusi?.products || [];

                return (
                  <div
                    key={skenario.id}
                    className="rounded-xl border border-border bg-bg/50 p-4 space-y-3 relative hover:border-accent/40 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-ink text-sm">
                          {skenario.nama || skenario.name}
                        </h4>
                        <span className="text-[11px] text-ink-muted">
                          {skenario.waktuDibuat || skenario.createdAt}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            muatSkenario(skenario.id);
                            onClose();
                          }}
                          className="rounded bg-accent px-2.5 py-1 text-xs font-semibold text-surface hover:bg-accent-hover transition-colors min-touch-target"
                          title="Terapkan skenario ini ke ruang kerja"
                        >
                          Pakai Ini
                        </button>
                        <button
                          onClick={() => hapusSkenario(skenario.id)}
                          className="rounded p-1 text-status-infeasible hover:bg-surface min-touch-target"
                          title="Hapus skenario ini"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metrik Proyeksi Nilai */}
                    <div className="rounded-lg bg-surface p-3 border border-border flex items-center justify-between">
                      <span className="text-xs text-ink-muted">Proyeksi Untung:</span>
                      <strong className="text-sm font-extrabold text-status-optimal tabular-nums">
                        {formatMataUangRupiah(totalNilai)}
                      </strong>
                    </div>

                    {/* Rincian Alokasi Produk */}
                    <div className="text-xs space-y-1">
                      <span className="font-semibold text-ink-muted text-[11px]">
                        Rencana Produksi:
                      </span>
                      <ul className="divide-y divide-border/60">
                        {produkList.map((p) => {
                          const nama = p.nama || p.name;
                          const jumlah = p.jumlahProduksi ?? p.quantity ?? 0;
                          const satuan = p.satuan || p.unit;
                          return (
                            <li key={p.id} className="py-1 flex justify-between text-[11px]">
                              <span className="text-ink">{nama}</span>
                              <span className="tabular-nums font-semibold text-accent">
                                {formatAngka(jumlah)} {satuan}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
