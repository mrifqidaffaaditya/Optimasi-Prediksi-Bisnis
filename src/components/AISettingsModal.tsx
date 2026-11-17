'use client';

import React, { useState, useEffect } from 'react';
import { useBusinessStore } from '@/store/useBusinessStore';
import { Produk, SumberDaya, MatriksPemakaian } from '@/types';
import {
  X,
  Bot,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONTOH_CERITA_USAHA_AI = [
  {
    label: 'Toko Roti & Bakery',
    cerita:
      'Saya punya usaha bakery dengan produk Roti Tawar (untung Rp 6.000) dan Roti Manis (untung Rp 9.000). Persediaan tepung 120 kg, mentega 45 kg, dan jam oven 50 jam. Roti tawar butuh 0.25 kg tepung, 0.05 kg mentega, 0.08 jam oven. Roti manis butuh 0.2 kg tepung, 0.12 kg mentega, 0.1 jam oven.',
  },
  {
    label: 'Katering Harian UMKM',
    cerita:
      'Katering makan siang dengan menu Bento Ayam (untung Rp 14.000) dan Bento Sapi (untung Rp 24.000). Bahan daging ayam ada 30 kg, daging sapi 18 kg, jam kerja masak 40 jam. Bento ayam pakai 0.25 kg ayam dan 0.2 jam masak. Bento sapi pakai 0.2 kg sapi dan 0.25 jam masak.',
  },
  {
    label: 'Konveksi Kaos & Kemeja',
    cerita:
      'Usaha konveksi memproduksi Kaos Polos (untung Rp 18.000) dan Kemeja Katun (untung Rp 38.000). Stok kain katun 200 meter dan waktu mesin jahit 120 jam. 1 kaos butuh 1.2 meter kain dan 0.5 jam jahit. 1 kemeja butuh 1.8 meter kain dan 1.2 jam jahit.',
  },
  {
    label: 'Coffee Shop & Kafe Minuman',
    cerita:
      'Kedai kopi menjual Kopi Susu Aren (untung Rp 8.000) dan Matcha Latte (untung Rp 12.000). Stok susu segar 80 liter, biji kopi 15 kg, bubuk matcha 8 kg. Kopi susu butuh 0.15 liter susu dan 0.02 kg kopi. Matcha butuh 0.18 liter susu dan 0.025 kg bubuk matcha.',
  },
];

export function AISettingsModal({ isOpen, onClose }: AISettingsModalProps) {
  const { imporDataModel, tujuanBisnis } = useBusinessStore();

  const [teksCeritaUsaha, setTeksCeritaUsaha] = useState('');
  const [sedangMenganalisis, setSedangMenganalisis] = useState(false);
  const [pesanGalatAI, setPesanGalatAI] = useState<string | null>(null);

  // Status sistem dari server
  const [statusSistem, setStatusSistem] = useState({
    statusText: 'Sistem AI Aktif & Siap Digunakan',
    isLLM: false,
    modelName: 'Asisten Cerdas',
  });

  // Draf model yang disusun oleh AI (wajib dikonfirmasi oleh pengguna - PRD 7)
  const [drafModel, setDrafModel] = useState<{
    daftarProduk: Produk[];
    daftarSumberDaya: SumberDaya[];
    matriksPemakaian: MatriksPemakaian;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/ai/status')
        .then((res) => res.json())
        .then((data) => {
          if (data?.statusText) {
            setStatusSistem(data);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const tanganiBuatModel = async () => {
    if (!teksCeritaUsaha.trim()) return;
    setSedangMenganalisis(true);
    setPesanGalatAI(null);
    setDrafModel(null);

    try {
      const res = await fetch('/api/ai/text-to-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: teksCeritaUsaha.trim() }),
      });

      const data = await res.json();

      const produkMentah = data.daftarProduk || data.products;
      const sumberDayaMentah = data.daftarSumberDaya || data.resources;
      const pemakaianMentah = data.matriksPemakaian || data.usage;

      if (produkMentah && sumberDayaMentah && pemakaianMentah) {
        setDrafModel({
          daftarProduk: produkMentah,
          daftarSumberDaya: sumberDayaMentah,
          matriksPemakaian: pemakaianMentah,
        });
      } else {
        setPesanGalatAI(data.error || 'Gagal menyusun model optimasi dari cerita usaha.');
      }
    } catch {
      setPesanGalatAI('Gagal memproses draf model. Silakan periksa koneksi atau coba lagi.');
    } finally {
      setSedangMenganalisis(false);
    }
  };

  const tanganiTerapkanDraf = () => {
    if (!drafModel) return;
    imporDataModel(
      tujuanBisnis,
      drafModel.daftarProduk,
      drafModel.daftarSumberDaya,
      drafModel.matriksPemakaian
    );
    setDrafModel(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-modal space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Kepala Modal */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-surface shrink-0">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">
                Asisten AI Bisnis (Otomatisasi Model)
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-optimal opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-status-optimal"></span>
                </span>
                <span className="text-[11px] font-semibold text-status-optimal">
                  {statusSistem.statusText}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-ink-muted hover:bg-bg hover:text-ink min-touch-target"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Antarmuka Teks-ke-Model */}
        <div className="space-y-4">
          <div>
            <span className="text-xs font-bold text-accent">
              Rancang Model Rencana dari Cerita Usaha
            </span>
            <p className="mt-1 text-xs text-ink-muted">
              Tuliskan produk apa yang Anda jual, keuntungan yang diharapkan, dan batasan bahan baku atau jam kerja. AI akan menyusun seluruh produk, kapasitas, dan kebutuhan bahan secara otomatis untuk Anda.
            </p>
          </div>

          {/* Contoh Cepat */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-ink-muted flex items-center gap-1">
              <Lightbulb className="h-3 w-3 text-status-warn" />
              Contoh cepat (klik untuk mengisi formulir):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CONTOH_CERITA_USAHA_AI.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTeksCeritaUsaha(item.cerita)}
                  className="rounded-lg border border-border bg-bg/60 px-2.5 py-1 text-[11px] text-ink hover:border-accent hover:bg-surface transition-colors min-touch-target"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Area Teks Cerita */}
          <div className="relative">
            <textarea
              rows={4}
              value={teksCeritaUsaha}
              onChange={(e) => setTeksCeritaUsaha(e.target.value)}
              placeholder="Contoh: Saya punya usaha katering harian dengan menu Bento Ayam (untung Rp 14.000) dan Bento Sapi (untung Rp 24.000). Persediaan daging ayam 30 kg, daging sapi 18 kg, dan waktu memasak dapur 40 jam..."
              className="w-full rounded-xl border border-border bg-surface p-3 text-xs text-ink focus:border-accent focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={tanganiBuatModel}
              disabled={sedangMenganalisis || !teksCeritaUsaha.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-surface hover:bg-accent-hover disabled:opacity-50 transition-colors min-touch-target"
            >
              {sedangMenganalisis ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Menganalisis &amp; Merancang Rencana...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Buat Draf Model Bisnis
                </>
              )}
            </button>
          </div>

          {pesanGalatAI && (
            <div className="rounded-lg border border-status-infeasible-border bg-status-infeasible-light p-3 text-xs text-status-infeasible flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{pesanGalatAI}</span>
            </div>
          )}

          {/* Kartu Konfirmasi Draf Model (PRD 7) */}
          {drafModel && (
            <div className="rounded-xl border-2 border-accent bg-accent-light/40 p-4 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-accent flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Draf Rencana Usaha Berhasil Disusun
                </span>
                <span className="text-[11px] text-ink-muted">
                  Periksa draf sebelum diterapkan
                </span>
              </div>

              <div className="text-xs text-ink space-y-1.5 bg-surface/80 p-3 rounded-lg border border-border">
                <div>
                  <strong className="text-accent">Produk:</strong>{' '}
                  {drafModel.daftarProduk
                    .map(
                      (p) =>
                        `${p.nama || p.name} (untung Rp ${(
                          p.keuntungan ?? p.profit ?? 0
                        ).toLocaleString('id-ID')}/${p.satuan || p.unit})`
                    )
                    .join(', ')}
                </div>
                <div>
                  <strong className="text-accent">Batasan Sumber Daya:</strong>{' '}
                  {drafModel.daftarSumberDaya
                    .map(
                      (r) =>
                        `${r.nama || r.name} (${r.kapasitas ?? r.capacity} ${r.satuan || r.unit})`
                    )
                    .join(', ')}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-accent-subtle">
                <button
                  onClick={() => setDrafModel(null)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink min-touch-target"
                >
                  Batal
                </button>
                <button
                  onClick={tanganiTerapkanDraf}
                  className="flex items-center gap-1.5 rounded-lg bg-status-optimal px-4 py-2 text-xs font-bold text-surface hover:opacity-90 transition-opacity min-touch-target"
                >
                  Terapkan ke Ruang Kerja Saya
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
