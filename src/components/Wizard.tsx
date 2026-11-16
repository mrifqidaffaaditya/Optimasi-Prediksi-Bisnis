'use client';

import React from 'react';
import { useBusinessStore } from '@/store/useBusinessStore';
import { formatRupiah, formatNumber } from '@/lib/formatters';
import {
  TrendingUp,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  HelpCircle,
} from 'lucide-react';

export function Wizard() {
  const {
    objective,
    setObjective,
    products,
    addProduct,
    updateProduct,
    removeProduct,
    resources,
    addResource,
    updateResource,
    removeResource,
    usage,
    updateUsage,
    wizardStep,
    setWizardStep,
    setActiveTab,
    solution,
  } = useBusinessStore();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {/* Step Indicator Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-surface">
              {wizardStep}
            </span>
            <span className="text-sm font-semibold text-ink">
              {wizardStep === 1 && 'Langkah 1: Tentukan Tujuan Bisnis'}
              {wizardStep === 2 && 'Langkah 2: Daftarkan Produk atau Pilihan'}
              {wizardStep === 3 && 'Langkah 3: Atur Sumber Daya & Pemakaian'}
              {wizardStep === 4 && 'Langkah 4: Periksa & Hitung Rekomendasi'}
            </span>
          </div>

          <div className="text-xs text-ink-muted">
            Langkah {wizardStep} dari 4
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((step) => (
            <button
              key={step}
              onClick={() => setWizardStep(step as any)}
              className={`h-1.5 rounded-full transition-colors ${
                step <= wizardStep ? 'bg-accent' : 'bg-border'
              }`}
              title={`Pindah ke Langkah ${step}`}
            />
          ))}
        </div>
      </div>

      {/* STEP 1: TUJUAN BISNIS */}
      {wizardStep === 1 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-bold text-ink">Apa tujuan utama bisnis Anda?</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Pilih apakah Anda ingin memaksimalkan total keuntungan dari produk yang dijual, atau meminimalkan total pengeluaran biaya operasional.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Option 1: Maksimalkan Untung */}
            <div
              onClick={() => setObjective('MAXIMIZE_PROFIT')}
              className={`cursor-pointer rounded-xl border-2 p-5 transition-colors ${
                objective === 'MAXIMIZE_PROFIT'
                  ? 'border-accent bg-accent-light/40 shadow-subtle'
                  : 'border-border bg-surface hover:border-accent/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-surface">
                  <TrendingUp className="h-5 w-5" />
                </div>
                {objective === 'MAXIMIZE_PROFIT' && (
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                )}
              </div>
              <h3 className="mt-4 text-base font-bold text-ink">
                Maksimalkan Untung (Default)
              </h3>
              <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                Mencari kombinasi penjualan yang menghasilkan laba bersih paling besar dengan memanfaatkan batas bahan dan jam kerja yang ada.
              </p>
            </div>

            {/* Option 2: Minimalkan Biaya */}
            <div
              onClick={() => setObjective('MINIMIZE_COST')}
              className={`cursor-pointer rounded-xl border-2 p-5 transition-colors ${
                objective === 'MINIMIZE_COST'
                  ? 'border-accent bg-accent-light/40 shadow-subtle'
                  : 'border-border bg-surface hover:border-accent/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-surface">
                  <DollarSign className="h-5 w-5" />
                </div>
                {objective === 'MINIMIZE_COST' && (
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                )}
              </div>
              <h3 className="mt-4 text-base font-bold text-ink">
                Minimalkan Biaya Operasional
              </h3>
              <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                Mencari cara memenuhi target pesanan minimum dengan total pengeluaran biaya bahan dan tenaga kerja serendah mungkin.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4 text-xs text-ink-muted flex items-start gap-2.5">
            <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            <div>
              <strong>Catatan:</strong> Model umum usaha manufaktur, kuliner (F&B), dan perdagangan biasanya menggunakan <strong>Maksimalkan Untung</strong>.
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PRODUK / PILIHAN */}
      {wizardStep === 2 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-ink">Produk atau Pilihan yang Dihasilkan</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Tentukan barang yang Anda buat dan berapa {objective === 'MAXIMIZE_PROFIT' ? 'keuntungan bersih' : 'biaya'} per unitnya.
              </p>
            </div>
            <button
              onClick={() => addProduct()}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-surface hover:bg-accent-hover transition-colors min-touch-target self-start"
            >
              <Plus className="h-4 w-4" />
              Tambah Produk
            </button>
          </div>

          <div className="space-y-4">
            {products.map((prod, index) => (
              <div
                key={prod.id}
                className="rounded-xl border border-border bg-surface p-4 shadow-subtle transition-colors"
              >
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="text-xs font-bold text-accent">
                    Produk #{index + 1}
                  </span>
                  {products.length > 1 && (
                    <button
                      onClick={() => removeProduct(prod.id)}
                      className="text-xs text-status-infeasible hover:underline flex items-center gap-1 min-touch-target"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Hapus
                    </button>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Nama Produk */}
                  <div>
                    <label className="block text-xs font-medium text-ink-muted mb-1">
                      Nama Produk
                    </label>
                    <input
                      type="text"
                      value={prod.name}
                      onChange={(e) => updateProduct(prod.id, { name: e.target.value })}
                      placeholder="Contoh: Roti Tawar"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none min-touch-target"
                    />
                  </div>

                  {/* Untung / Biaya per Unit */}
                  <div>
                    <label className="block text-xs font-medium text-ink-muted mb-1">
                      {objective === 'MAXIMIZE_PROFIT' ? 'Untung per Unit (Rp)' : 'Biaya per Unit (Rp)'}
                    </label>
                    <input
                      type="number"
                      value={prod.profit}
                      onChange={(e) =>
                        updateProduct(prod.id, { profit: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink tabular-nums focus:border-accent focus:outline-none min-touch-target"
                    />
                    <span className="text-[11px] text-ink-muted mt-1 block">
                      {formatRupiah(prod.profit)}
                    </span>
                  </div>

                  {/* Satuan */}
                  <div>
                    <label className="block text-xs font-medium text-ink-muted mb-1">
                      Satuan Penjualan
                    </label>
                    <input
                      type="text"
                      value={prod.unit}
                      onChange={(e) => updateProduct(prod.id, { unit: e.target.value })}
                      placeholder="bungkus, porsi, box, unit"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none min-touch-target"
                    />
                  </div>
                </div>

                {/* Switch: Hanya Jumlah Utuh */}
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-ink">
                      Hanya jumlah utuh (tidak boleh pecahan)
                    </span>
                    <span className="text-[11px] text-ink-muted hidden sm:inline">
                      (misal: tidak bisa menjual 0,5 bungkus roti)
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer min-touch-target">
                    <input
                      type="checkbox"
                      checked={prod.integerOnly}
                      onChange={(e) =>
                        updateProduct(prod.id, { integerOnly: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:bg-accent"></div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: SUMBER DAYA & PEMAKAIAN */}
      {wizardStep === 3 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-ink">Batasan Sumber Daya & Kebutuhan Bahan</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Berapa persediaan bahan, tenaga kerja, atau kapasitas mesin yang Anda miliki saat ini?
              </p>
            </div>
            <button
              onClick={() => addResource()}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-surface hover:bg-accent-hover transition-colors min-touch-target self-start"
            >
              <Plus className="h-4 w-4" />
              Tambah Sumber Daya
            </button>
          </div>

          <div className="space-y-6">
            {resources.map((res, index) => (
              <div
                key={res.id}
                className="rounded-xl border border-border bg-surface p-5 shadow-subtle space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="text-xs font-bold text-accent">
                    Sumber Daya #{index + 1}
                  </span>
                  {resources.length > 1 && (
                    <button
                      onClick={() => removeResource(res.id)}
                      className="text-xs text-status-infeasible hover:underline flex items-center gap-1 min-touch-target"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Hapus
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Nama Sumber Daya */}
                  <div>
                    <label className="block text-xs font-medium text-ink-muted mb-1">
                      Nama Sumber Daya / Bahan
                    </label>
                    <input
                      type="text"
                      value={res.name}
                      onChange={(e) => updateResource(res.id, { name: e.target.value })}
                      placeholder="Contoh: Tepung Terigu, Jam Oven"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none min-touch-target"
                    />
                  </div>

                  {/* Kapasitas Tersedia */}
                  <div>
                    <label className="block text-xs font-medium text-ink-muted mb-1">
                      Kapasitas yang Tersedia
                    </label>
                    <input
                      type="number"
                      value={res.capacity}
                      onChange={(e) =>
                        updateResource(res.id, {
                          capacity: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink tabular-nums focus:border-accent focus:outline-none min-touch-target"
                    />
                  </div>

                  {/* Satuan Sumber Daya */}
                  <div>
                    <label className="block text-xs font-medium text-ink-muted mb-1">
                      Satuan Kapasitas
                    </label>
                    <input
                      type="text"
                      value={res.unit}
                      onChange={(e) => updateResource(res.id, { unit: e.target.value })}
                      placeholder="kg, jam kerja, liter, meter"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none min-touch-target"
                    />
                  </div>
                </div>

                {/* Jenis Batasan */}
                <div className="pt-2">
                  <label className="block text-xs font-medium text-ink-muted mb-2">
                    Ketentuan Batasan:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => updateResource(res.id, { type: 'LEQ' })}
                      className={`text-left rounded-lg border p-2.5 text-xs transition-colors min-touch-target ${
                        res.type === 'LEQ'
                          ? 'border-accent bg-accent-light text-accent font-semibold'
                          : 'border-border bg-surface text-ink-muted hover:border-accent/40'
                      }`}
                    >
                      <div className="font-bold">Tidak boleh lebih dari (Maks)</div>
                      <div className="text-[11px] opacity-80">
                        Total pemakaian ≤ {res.capacity} {res.unit}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateResource(res.id, { type: 'GEQ' })}
                      className={`text-left rounded-lg border p-2.5 text-xs transition-colors min-touch-target ${
                        res.type === 'GEQ'
                          ? 'border-accent bg-accent-light text-accent font-semibold'
                          : 'border-border bg-surface text-ink-muted hover:border-accent/40'
                      }`}
                    >
                      <div className="font-bold">Paling sedikit (Minimal)</div>
                      <div className="text-[11px] opacity-80">
                        Total pemakaian ≥ {res.capacity} {res.unit}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateResource(res.id, { type: 'EQ' })}
                      className={`text-left rounded-lg border p-2.5 text-xs transition-colors min-touch-target ${
                        res.type === 'EQ'
                          ? 'border-accent bg-accent-light text-accent font-semibold'
                          : 'border-border bg-surface text-ink-muted hover:border-accent/40'
                      }`}
                    >
                      <div className="font-bold">Harus tepat sama</div>
                      <div className="text-[11px] opacity-80">
                        Total pemakaian = {res.capacity} {res.unit}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Pemakaian per Produk ditulis sebagai kalimat manusia (PRD 5.1) */}
                <div className="pt-3 border-t border-border">
                  <label className="block text-xs font-semibold text-ink mb-2">
                    Kebutuhan untuk tiap 1 unit produk:
                  </label>
                  <div className="space-y-2">
                    {products.map((prod) => {
                      const currentVal = usage[prod.id]?.[res.id] ?? 0;
                      return (
                        <div
                          key={prod.id}
                          className="flex flex-wrap items-center gap-2 rounded-lg bg-bg p-2.5 text-xs text-ink"
                        >
                          <span className="text-ink-muted">Setiap 1</span>
                          <strong className="text-accent">{prod.name}</strong>
                          <span className="text-ink-muted">memerlukan</span>
                          <input
                            type="number"
                            step="0.01"
                            value={currentVal}
                            onChange={(e) =>
                              updateUsage(prod.id, res.id, parseFloat(e.target.value) || 0)
                            }
                            className="w-24 rounded border border-border bg-surface px-2 py-1 text-xs text-ink tabular-nums font-semibold focus:border-accent focus:outline-none min-touch-target"
                          />
                          <span className="font-medium text-ink-muted">
                            {res.unit} {res.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: PERIKSA & HITUNG */}
      {wizardStep === 4 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-bold text-ink">Periksa Data Sebelum Menghitung</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Pastikan seluruh produk, batasan kapasitas, dan kebutuhan bahan sudah sesuai dengan kondisi bisnis riil Anda.
            </p>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="text-xs font-bold text-accent">
                Daftar Produk ({products.length})
              </h3>
              <ul className="mt-3 divide-y divide-border text-xs">
                {products.map((p) => (
                  <li key={p.id} className="py-2 flex items-center justify-between">
                    <span className="font-medium text-ink">{p.name}</span>
                    <span className="tabular-nums font-semibold text-accent">
                      {formatRupiah(p.profit)} / {p.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="text-xs font-bold text-accent">
                Batasan Sumber Daya ({resources.length})
              </h3>
              <ul className="mt-3 divide-y divide-border text-xs">
                {resources.map((r) => (
                  <li key={r.id} className="py-2 flex items-center justify-between">
                    <span className="font-medium text-ink">{r.name}</span>
                    <span className="tabular-nums font-semibold text-ink-muted">
                      {formatNumber(r.capacity)} {r.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action to Compute */}
          <div className="rounded-xl border-2 border-accent bg-accent-light/50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-surface mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-ink">
              Data Siap Dihitung!
            </h3>
            <p className="mt-1 text-xs text-ink-muted max-w-md mx-auto">
              Mesin optimasi akan mencari kombinasi produksi yang paling menghasilkan keuntungan maksimal seketika di perangkat Anda.
            </p>
            <button
              onClick={() => setActiveTab('results')}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-surface shadow-subtle hover:bg-accent-hover transition-colors min-touch-target"
            >
              Hitung & Buka Hasil Rekomendasi
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons (Bottom) */}
      <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
        {wizardStep > 1 ? (
          <button
            onClick={() => setWizardStep((wizardStep - 1) as any)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-ink hover:bg-bg transition-colors min-touch-target"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>
        ) : (
          <div></div>
        )}

        {wizardStep < 4 ? (
          <button
            onClick={() => setWizardStep((wizardStep + 1) as any)}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-xs font-semibold text-surface hover:bg-accent-hover transition-colors min-touch-target"
          >
            Lanjut ke Langkah {wizardStep + 1}
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('results')}
            className="flex items-center gap-1.5 rounded-lg bg-status-optimal px-5 py-2.5 text-xs font-semibold text-surface hover:opacity-90 transition-opacity min-touch-target"
          >
            Buka Hasil Rekomendasi
            <Sparkles className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
