'use client';

import React, { useState } from 'react';
import { useBusinessStore } from '@/store/useBusinessStore';
import { formatRupiah, formatNumber } from '@/lib/formatters';
import {
  Plus,
  Trash2,
  Table as TableIcon,
  Maximize2,
  Minimize2,
  Layers,
  Sparkles,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';

export function TableView() {
  const {
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
    objective,
    tableDensity,
    setTableDensity,
    setActiveTab,
  } = useBusinessStore();

  const [activeSubTab, setActiveSubTab] = useState<'products' | 'resources' | 'usage'>('products');

  const rowHeightClass = tableDensity === 'comfortable' ? 'h-11 py-2 text-sm' : 'h-8 py-1 text-xs';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Table Navigation & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        {/* Sub Tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-bg p-1 self-start">
          <button
            onClick={() => setActiveSubTab('products')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors min-touch-target ${
              activeSubTab === 'products'
                ? 'bg-surface text-accent shadow-subtle'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            1. Tabel Produk ({products.length})
          </button>
          <button
            onClick={() => setActiveSubTab('resources')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors min-touch-target ${
              activeSubTab === 'resources'
                ? 'bg-surface text-accent shadow-subtle'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            2. Tabel Sumber Daya ({resources.length})
          </button>
          <button
            onClick={() => setActiveSubTab('usage')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors min-touch-target ${
              activeSubTab === 'usage'
                ? 'bg-surface text-accent shadow-subtle'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            3. Matriks Pemakaian Bahan
          </button>
        </div>

        {/* Density Selector & Quick Action */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-0.5 text-xs">
            <button
              onClick={() => setTableDensity('comfortable')}
              className={`rounded px-2.5 py-1 font-medium transition-colors min-touch-target ${
                tableDensity === 'comfortable'
                  ? 'bg-accent text-surface'
                  : 'text-ink-muted hover:text-ink'
              }`}
              title="Kepadatan baris 40px"
            >
              Nyaman (40px)
            </button>
            <button
              onClick={() => setTableDensity('compact')}
              className={`rounded px-2.5 py-1 font-medium transition-colors min-touch-target ${
                tableDensity === 'compact'
                  ? 'bg-accent text-surface'
                  : 'text-ink-muted hover:text-ink'
              }`}
              title="Kepadatan baris 32px"
            >
              Ringkas (32px)
            </button>
          </div>

          <button
            onClick={() => setActiveTab('results')}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-surface hover:bg-accent-hover transition-colors min-touch-target"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Hitung Rekomendasi
          </button>
        </div>
      </div>

      {/* 1. TABEL PRODUK */}
      {activeSubTab === 'products' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink">Daftar Produk & Keuntungan</h2>
              <p className="text-xs text-ink-muted">
                Klik sel angka atau teks untuk mengedit langsung. Tekan Tab untuk berpindah sel.
              </p>
            </div>
            <button
              onClick={() => addProduct()}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-surface hover:bg-accent-hover transition-colors min-touch-target"
            >
              <Plus className="h-4 w-4" />
              Tambah Baris Produk
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-subtle">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-bg text-xs font-bold text-ink">
                  <th className="py-2.5 px-4 w-12 text-center">No</th>
                  <th className="py-2.5 px-4 sticky left-0 bg-bg z-10">Nama Produk</th>
                  <th className="py-2.5 px-4 text-right">
                    {objective === 'MAXIMIZE_PROFIT' ? 'Untung / Unit (Rp)' : 'Biaya / Unit (Rp)'}
                  </th>
                  <th className="py-2.5 px-4">Satuan</th>
                  <th className="py-2.5 px-4 text-center">Jumlah Utuh Saja</th>
                  <th className="py-2.5 px-4 w-16 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink">
                {products.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-bg/60 transition-colors">
                    <td className={`px-4 text-center text-xs text-ink-muted ${rowHeightClass}`}>
                      {idx + 1}
                    </td>
                    <td className={`px-4 sticky left-0 bg-surface z-10 font-semibold ${rowHeightClass}`}>
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => updateProduct(p.id, { name: e.target.value })}
                        className="w-full bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none px-1"
                      />
                    </td>
                    <td className={`px-4 text-right tabular-nums ${rowHeightClass}`}>
                      <input
                        type="number"
                        value={p.profit}
                        onChange={(e) =>
                          updateProduct(p.id, { profit: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full text-right bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none px-1 tabular-nums font-semibold text-accent"
                      />
                    </td>
                    <td className={`px-4 ${rowHeightClass}`}>
                      <input
                        type="text"
                        value={p.unit}
                        onChange={(e) => updateProduct(p.id, { unit: e.target.value })}
                        className="w-full bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none px-1 text-ink-muted"
                      />
                    </td>
                    <td className={`px-4 text-center ${rowHeightClass}`}>
                      <input
                        type="checkbox"
                        checked={p.integerOnly}
                        onChange={(e) =>
                          updateProduct(p.id, { integerOnly: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                      />
                    </td>
                    <td className={`px-4 text-center ${rowHeightClass}`}>
                      {products.length > 1 && (
                        <button
                          onClick={() => removeProduct(p.id)}
                          className="text-status-infeasible hover:opacity-80 p-1 rounded min-touch-target"
                          title="Hapus produk ini"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. TABEL SUMBER DAYA */}
      {activeSubTab === 'resources' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink">Daftar Sumber Daya & Kapasitas Tersedia</h2>
              <p className="text-xs text-ink-muted">
                Atur ketersediaan bahan baku, jam operasional mesin, dan jenis batasannya.
              </p>
            </div>
            <button
              onClick={() => addResource()}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-surface hover:bg-accent-hover transition-colors min-touch-target"
            >
              <Plus className="h-4 w-4" />
              Tambah Sumber Daya
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-subtle">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-border bg-bg text-xs font-bold text-ink">
                  <th className="py-2.5 px-4 w-12 text-center">No</th>
                  <th className="py-2.5 px-4 sticky left-0 bg-bg z-10">Nama Sumber Daya</th>
                  <th className="py-2.5 px-4 text-right">Kapasitas</th>
                  <th className="py-2.5 px-4">Satuan</th>
                  <th className="py-2.5 px-4">Ketentuan Batasan</th>
                  <th className="py-2.5 px-4 w-16 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink">
                {resources.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-bg/60 transition-colors">
                    <td className={`px-4 text-center text-xs text-ink-muted ${rowHeightClass}`}>
                      {idx + 1}
                    </td>
                    <td className={`px-4 sticky left-0 bg-surface z-10 font-semibold ${rowHeightClass}`}>
                      <input
                        type="text"
                        value={r.name}
                        onChange={(e) => updateResource(r.id, { name: e.target.value })}
                        className="w-full bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none px-1"
                      />
                    </td>
                    <td className={`px-4 text-right tabular-nums ${rowHeightClass}`}>
                      <input
                        type="number"
                        value={r.capacity}
                        onChange={(e) =>
                          updateResource(r.id, {
                            capacity: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full text-right bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none px-1 tabular-nums font-bold text-ink"
                      />
                    </td>
                    <td className={`px-4 ${rowHeightClass}`}>
                      <input
                        type="text"
                        value={r.unit}
                        onChange={(e) => updateResource(r.id, { unit: e.target.value })}
                        className="w-full bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none px-1 text-ink-muted"
                      />
                    </td>
                    <td className={`px-4 ${rowHeightClass}`}>
                      <select
                        value={r.type}
                        onChange={(e) => updateResource(r.id, { type: e.target.value as any })}
                        className="rounded border border-border bg-surface px-2 py-1 text-xs text-ink focus:border-accent focus:outline-none"
                      >
                        <option value="LEQ">Tidak boleh lebih dari (Maks)</option>
                        <option value="GEQ">Paling sedikit (Minimal)</option>
                        <option value="EQ">Harus tepat sama</option>
                      </select>
                    </td>
                    <td className={`px-4 text-center ${rowHeightClass}`}>
                      {resources.length > 1 && (
                        <button
                          onClick={() => removeResource(r.id)}
                          className="text-status-infeasible hover:opacity-80 p-1 rounded min-touch-target"
                          title="Hapus sumber daya ini"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. MATRIKS PEMAKAIAN BAHAN */}
      {activeSubTab === 'usage' && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-base font-bold text-ink">Matriks Kebutuhan Bahan per 1 Unit Produk</h2>
            <p className="text-xs text-ink-muted">
              Tiap sel menunjukkan berapa unit sumber daya yang dihabiskan untuk menghasilkan 1 unit produk terkait.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-subtle">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-bg text-xs font-bold text-ink">
                  <th className="py-2.5 px-4 sticky left-0 bg-bg z-10 w-48">
                    Nama Produk
                  </th>
                  {resources.map((res) => (
                    <th key={res.id} className="py-2.5 px-4 text-right">
                      {res.name}
                      <span className="block text-[10px] font-normal text-ink-muted">
                        ({res.unit})
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-bg/60 transition-colors">
                    <td className={`px-4 sticky left-0 bg-surface z-10 font-bold text-ink ${rowHeightClass}`}>
                      {prod.name}
                    </td>
                    {resources.map((res) => {
                      const val = usage[prod.id]?.[res.id] ?? 0;
                      return (
                        <td key={res.id} className={`px-4 text-right tabular-nums ${rowHeightClass}`}>
                          <input
                            type="number"
                            step="0.01"
                            value={val}
                            onChange={(e) =>
                              updateUsage(
                                prod.id,
                                res.id,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-24 text-right bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none px-1 tabular-nums font-semibold text-accent"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
