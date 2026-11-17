'use client';

import React, { useState } from 'react';
import { useBusinessStore } from '@/store/useBusinessStore';
import { formatMataUangRupiah, formatAngka } from '@/lib/formatters';
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
    daftarProduk,
    tambahProduk,
    perbaruiProduk,
    hapusProduk,
    daftarSumberDaya,
    tambahSumberDaya,
    perbaruiSumberDaya,
    hapusSumberDaya,
    matriksPemakaian,
    perbaruiPemakaian,
    tujuanBisnis,
    kepadatanTabel,
    aturKepadatanTabel,
    aturTabAktif,
  } = useBusinessStore();

  const [subTabAktif, setSubTabAktif] = useState<'produk' | 'sumberDaya' | 'pemakaian'>('produk');

  const kelasTinggiBaris =
    kepadatanTabel === 'comfortable' ? 'h-11 py-2 text-sm' : 'h-8 py-1 text-xs';

  const apakahMaksimalkan =
    tujuanBisnis === 'MAKSIMALKAN_UNTUNG' || tujuanBisnis === 'MAXIMIZE_PROFIT';

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-6 space-y-6 overflow-hidden">
      {/* Bilah Kontrol & Navigasi Sub-Tabel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-border pb-4">
        {/* Tombol Tab Pilihan Tabel */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-bg p-1 self-start">
          <button
            onClick={() => setSubTabAktif('produk')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors min-touch-target ${
              subTabAktif === 'produk'
                ? 'bg-surface text-accent shadow-subtle'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            1. Tabel Produk ({daftarProduk.length})
          </button>
          <button
            onClick={() => setSubTabAktif('sumberDaya')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors min-touch-target ${
              subTabAktif === 'sumberDaya'
                ? 'bg-surface text-accent shadow-subtle'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            2. Tabel Sumber Daya ({daftarSumberDaya.length})
          </button>
          <button
            onClick={() => setSubTabAktif('pemakaian')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors min-touch-target ${
              subTabAktif === 'pemakaian'
                ? 'bg-surface text-accent shadow-subtle'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            3. Matriks Kebutuhan Bahan
          </button>
        </div>

        {/* Pemilih Kepadatan & Tombol Hitung */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-0.5 text-xs">
            <button
              onClick={() => aturKepadatanTabel('comfortable')}
              className={`rounded px-2.5 py-1 font-medium transition-colors min-touch-target ${
                kepadatanTabel === 'comfortable'
                  ? 'bg-accent text-surface'
                  : 'text-ink-muted hover:text-ink'
              }`}
              title="Kepadatan baris nyaman 40px"
            >
              Nyaman (40px)
            </button>
            <button
              onClick={() => aturKepadatanTabel('compact')}
              className={`rounded px-2.5 py-1 font-medium transition-colors min-touch-target ${
                kepadatanTabel === 'compact'
                  ? 'bg-accent text-surface'
                  : 'text-ink-muted hover:text-ink'
              }`}
              title="Kepadatan baris ringkas 32px"
            >
              Ringkas (32px)
            </button>
          </div>

          <button
            onClick={() => aturTabAktif('results')}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-surface hover:bg-accent-hover transition-colors min-touch-target"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Hitung Rekomendasi
          </button>
        </div>
      </div>

      {/* 1. TABEL PRODUK */}
      {subTabAktif === 'produk' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink">Daftar Produk & Keuntungan</h2>
              <p className="text-xs text-ink-muted">
                Klik sel angka atau teks untuk mengubah langsung. Tekan Tab untuk berpindah antar kolom.
              </p>
            </div>
            <button
              onClick={() => tambahProduk()}
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
                    {apakahMaksimalkan ? 'Untung Bersih / Unit (Rp)' : 'Biaya / Unit (Rp)'}
                  </th>
                  <th className="py-2.5 px-4">Satuan Penjualan</th>
                  <th className="py-2.5 px-4 text-center">Jumlah Utuh Saja</th>
                  <th className="py-2.5 px-4 w-16 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink">
                {daftarProduk.map((p, idx) => {
                  const nama = p.nama || p.name || '';
                  const untung = p.keuntungan ?? p.profit ?? 0;
                  const satuan = p.satuan || p.unit || '';
                  const hanyaUtuh = p.hanyaJumlahUtuh ?? p.integerOnly ?? true;

                  return (
                    <tr key={p.id} className="hover:bg-bg/60 transition-colors">
                      <td className={`px-4 text-center text-xs text-ink-muted ${kelasTinggiBaris}`}>
                        {idx + 1}
                      </td>
                      <td className={`px-4 sticky left-0 bg-surface z-10 font-semibold ${kelasTinggiBaris}`}>
                        <input
                          type="text"
                          value={nama}
                          onChange={(e) => perbaruiProduk(p.id, { nama: e.target.value })}
                          className="w-full bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none px-1"
                        />
                      </td>
                      <td className={`px-4 text-right tabular-nums ${kelasTinggiBaris}`}>
                        <input
                          type="number"
                          value={untung}
                          onChange={(e) =>
                            perbaruiProduk(p.id, {
                              keuntungan: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full text-right bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none px-1 tabular-nums font-semibold text-accent"
                        />
                      </td>
                      <td className={`px-4 ${kelasTinggiBaris}`}>
                        <input
                          type="text"
                          value={satuan}
                          onChange={(e) => perbaruiProduk(p.id, { satuan: e.target.value })}
                          className="w-full bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none px-1 text-ink-muted"
                        />
                      </td>
                      <td className={`px-4 text-center ${kelasTinggiBaris}`}>
                        <input
                          type="checkbox"
                          checked={hanyaUtuh}
                          onChange={(e) =>
                            perbaruiProduk(p.id, { hanyaJumlahUtuh: e.target.checked })
                          }
                          className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                        />
                      </td>
                      <td className={`px-4 text-center ${kelasTinggiBaris}`}>
                        {daftarProduk.length > 1 && (
                          <button
                            onClick={() => hapusProduk(p.id)}
                            className="text-status-infeasible hover:opacity-80 p-1 rounded min-touch-target"
                            title="Hapus produk ini"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. TABEL SUMBER DAYA */}
      {subTabAktif === 'sumberDaya' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink">Daftar Sumber Daya & Kapasitas Tersedia</h2>
              <p className="text-xs text-ink-muted">
                Atur ketersediaan bahan baku, jam operasional mesin, dan jenis batasannya.
              </p>
            </div>
            <button
              onClick={() => tambahSumberDaya()}
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
                {daftarSumberDaya.map((r, idx) => {
                  const nama = r.nama || r.name || '';
                  const cap = r.kapasitas ?? r.capacity ?? 0;
                  const satuan = r.satuan || r.unit || '';
                  const jenis = r.jenisBatasan || r.type || 'TIDAK_LEBIH_DARI';
                  const nilaiSelect =
                    jenis === 'PALING_SEDIKIT' || jenis === 'GEQ'
                      ? 'PALING_SEDIKIT'
                      : jenis === 'HARUS_TEPAT' || jenis === 'EQ'
                      ? 'HARUS_TEPAT'
                      : 'TIDAK_LEBIH_DARI';

                  return (
                    <tr key={r.id} className="hover:bg-bg/60 transition-colors">
                      <td className={`px-4 text-center text-xs text-ink-muted ${kelasTinggiBaris}`}>
                        {idx + 1}
                      </td>
                      <td className={`px-4 sticky left-0 bg-surface z-10 font-semibold ${kelasTinggiBaris}`}>
                        <input
                          type="text"
                          value={nama}
                          onChange={(e) => perbaruiSumberDaya(r.id, { nama: e.target.value })}
                          className="w-full bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none px-1"
                        />
                      </td>
                      <td className={`px-4 text-right tabular-nums ${kelasTinggiBaris}`}>
                        <input
                          type="number"
                          value={cap}
                          onChange={(e) =>
                            perbaruiSumberDaya(r.id, {
                              kapasitas: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full text-right bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none px-1 tabular-nums font-bold text-ink"
                        />
                      </td>
                      <td className={`px-4 ${kelasTinggiBaris}`}>
                        <input
                          type="text"
                          value={satuan}
                          onChange={(e) => perbaruiSumberDaya(r.id, { satuan: e.target.value })}
                          className="w-full bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none px-1 text-ink-muted"
                        />
                      </td>
                      <td className={`px-4 ${kelasTinggiBaris}`}>
                        <select
                          value={nilaiSelect}
                          onChange={(e) =>
                            perbaruiSumberDaya(r.id, {
                              jenisBatasan: e.target.value as any,
                            })
                          }
                          className="rounded border border-border bg-surface px-2 py-1 text-xs text-ink focus:border-accent focus:outline-none"
                        >
                          <option value="TIDAK_LEBIH_DARI">Tidak boleh lebih dari (Maks)</option>
                          <option value="PALING_SEDIKIT">Paling sedikit (Minimal)</option>
                          <option value="HARUS_TEPAT">Harus tepat sama</option>
                        </select>
                      </td>
                      <td className={`px-4 text-center ${kelasTinggiBaris}`}>
                        {daftarSumberDaya.length > 1 && (
                          <button
                            onClick={() => hapusSumberDaya(r.id)}
                            className="text-status-infeasible hover:opacity-80 p-1 rounded min-touch-target"
                            title="Hapus sumber daya ini"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. MATRIKS KEBUTUHAN BAHAN */}
      {subTabAktif === 'pemakaian' && (
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
                  {daftarSumberDaya.map((res) => (
                    <th key={res.id} className="py-2.5 px-4 text-right">
                      {res.nama || res.name}
                      <span className="block text-[10px] font-normal text-ink-muted">
                        ({res.satuan || res.unit})
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink">
                {daftarProduk.map((prod) => (
                  <tr key={prod.id} className="hover:bg-bg/60 transition-colors">
                    <td className={`px-4 sticky left-0 bg-surface z-10 font-bold text-ink ${kelasTinggiBaris}`}>
                      {prod.nama || prod.name}
                    </td>
                    {daftarSumberDaya.map((res) => {
                      const nilaiKebutuhan = matriksPemakaian[prod.id]?.[res.id] ?? 0;
                      return (
                        <td key={res.id} className={`px-4 text-right tabular-nums ${kelasTinggiBaris}`}>
                          <input
                            type="number"
                            step="0.01"
                            value={nilaiKebutuhan}
                            onChange={(e) =>
                              perbaruiPemakaian(
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
