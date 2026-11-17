'use client';

import React from 'react';
import { useBusinessStore } from '@/store/useBusinessStore';
import { formatMataUangRupiah, formatAngka } from '@/lib/formatters';
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
} from 'lucide-react';

export function Wizard() {
  const {
    tujuanBisnis,
    aturTujuanBisnis,
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
    langkahPanduan,
    aturLangkahPanduan,
    aturTabAktif,
  } = useBusinessStore();

  const apakahMaksimalkan =
    tujuanBisnis === 'MAKSIMALKAN_UNTUNG' || tujuanBisnis === 'MAXIMIZE_PROFIT';

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-6 space-y-6 overflow-hidden">
      {/* Indikator Langkah (Progress Bar) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-surface shrink-0">
              {langkahPanduan}
            </span>
            <span className="text-sm font-semibold text-ink truncate">
              {langkahPanduan === 1 && 'Langkah 1: Tentukan Tujuan Bisnis'}
              {langkahPanduan === 2 && 'Langkah 2: Daftarkan Produk & Layanan'}
              {langkahPanduan === 3 && 'Langkah 3: Atur Sumber Daya & Kebutuhan Bahan'}
              {langkahPanduan === 4 && 'Langkah 4: Periksa & Hitung Rekomendasi'}
            </span>
          </div>

          <div className="text-xs text-ink-muted whitespace-nowrap shrink-0">
            Langkah {langkahPanduan} dari 4
          </div>
        </div>

        {/* Bilah Kemajuan */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((langkah) => (
            <button
              key={langkah}
              onClick={() => aturLangkahPanduan(langkah as 1 | 2 | 3 | 4)}
              className={`h-1.5 rounded-full transition-colors ${
                langkah <= langkahPanduan ? 'bg-accent' : 'bg-border'
              }`}
              title={`Pindah ke Langkah ${langkah}`}
            />
          ))}
        </div>
      </div>

      {/* LANGKAH 1: TUJUAN BISNIS */}
      {langkahPanduan === 1 && (
        <div className="space-y-5 animate-in fade-in">
          <div>
            <h2 className="text-xl font-bold text-ink">Apa tujuan utama bisnis Anda?</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Pilih apakah Anda ingin memaksimalkan total laba bersih dari penjualan, atau meminimalkan total pengeluaran biaya operasional usaha.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Pilihan 1: Maksimalkan Untung */}
            <div
              onClick={() => aturTujuanBisnis('MAKSIMALKAN_UNTUNG')}
              className={`cursor-pointer rounded-xl border-2 p-5 transition-colors overflow-hidden ${
                apakahMaksimalkan
                  ? 'border-accent bg-accent-light/40 shadow-subtle'
                  : 'border-border bg-surface hover:border-accent/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-surface shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                {apakahMaksimalkan && (
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                )}
              </div>
              <h3 className="mt-4 text-base font-bold text-ink">
                Maksimalkan Untung (Paling Umum)
              </h3>
              <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                Mencari kombinasi penjualan yang menghasilkan laba bersih paling besar dengan memanfaatkan batas bahan baku dan jam kerja yang ada.
              </p>
            </div>

            {/* Pilihan 2: Minimalkan Biaya */}
            <div
              onClick={() => aturTujuanBisnis('MINIMALKAN_BIAYA')}
              className={`cursor-pointer rounded-xl border-2 p-5 transition-colors overflow-hidden ${
                !apakahMaksimalkan
                  ? 'border-accent bg-accent-light/40 shadow-subtle'
                  : 'border-border bg-surface hover:border-accent/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-surface shrink-0">
                  <DollarSign className="h-5 w-5" />
                </div>
                {!apakahMaksimalkan && (
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
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

          <div className="rounded-xl border border-border bg-surface p-4 text-xs text-ink-muted flex items-start gap-2.5">
            <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            <div>
              <strong>Catatan Praktis:</strong> Sebagian besar usaha dagang, toko, UMKM kuliner, dan manufaktur memilih <strong>Maksimalkan Untung</strong> untuk meraup laba tertinggi.
            </div>
          </div>
        </div>
      )}

      {/* LANGKAH 2: DAFTARKAN PRODUK */}
      {langkahPanduan === 2 && (
        <div className="space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-ink">Produk atau Pilihan yang Dihasilkan</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Tentukan barang yang Anda buat dan berapa {apakahMaksimalkan ? 'keuntungan bersih' : 'biaya'} per unitnya.
              </p>
            </div>
            <button
              onClick={() => tambahProduk()}
              className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-surface hover:bg-accent-hover transition-colors min-touch-target self-start shrink-0"
            >
              <Plus className="h-4 w-4" />
              Tambah Produk Baru
            </button>
          </div>

          <div className="space-y-4">
            {daftarProduk.map((produk, indeks) => {
              const namaProduk = produk.nama || produk.name || '';
              const untungProduk = produk.keuntungan ?? produk.profit ?? 0;
              const satuanProduk = produk.satuan || produk.unit || 'unit';
              const hanyaUtuh = produk.hanyaJumlahUtuh ?? produk.integerOnly ?? true;

              return (
                <div
                  key={produk.id}
                  className="rounded-xl border border-border bg-surface p-4 sm:p-5 shadow-subtle transition-colors overflow-hidden"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="text-xs font-bold text-accent">
                      Produk #{indeks + 1}
                    </span>
                    {daftarProduk.length > 1 && (
                      <button
                        onClick={() => hapusProduk(produk.id)}
                        className="text-xs text-status-infeasible hover:underline flex items-center gap-1 min-touch-target"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus Produk Ini
                      </button>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Nama Produk */}
                    <div className="min-w-0">
                      <label className="block text-xs font-medium text-ink-muted mb-1">
                        Nama Produk
                      </label>
                      <input
                        type="text"
                        value={namaProduk}
                        onChange={(e) => perbaruiProduk(produk.id, { nama: e.target.value })}
                        placeholder="Contoh: Roti Tawar, Bento Ayam"
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none min-touch-target"
                      />
                    </div>

                    {/* Untung / Biaya per Unit */}
                    <div className="min-w-0">
                      <label className="block text-xs font-medium text-ink-muted mb-1">
                        {apakahMaksimalkan ? 'Untung Bersih per Unit (Rp)' : 'Biaya per Unit (Rp)'}
                      </label>
                      <input
                        type="number"
                        value={untungProduk}
                        onChange={(e) =>
                          perbaruiProduk(produk.id, {
                            keuntungan: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink tabular-nums focus:border-accent focus:outline-none min-touch-target font-semibold text-accent"
                      />
                      <span className="text-[11px] text-ink-muted mt-1 block tabular-nums">
                        {formatMataUangRupiah(untungProduk)}
                      </span>
                    </div>

                    {/* Satuan */}
                    <div className="min-w-0">
                      <label className="block text-xs font-medium text-ink-muted mb-1">
                        Satuan Penjualan
                      </label>
                      <input
                        type="text"
                        value={satuanProduk}
                        onChange={(e) => perbaruiProduk(produk.id, { satuan: e.target.value })}
                        placeholder="bungkus, porsi, karton, potong"
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none min-touch-target"
                      />
                    </div>
                  </div>

                  {/* Saklar: Hanya Jumlah Utuh */}
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold text-ink block">
                        Hanya hasilkan jumlah utuh (bilangan bulat)
                      </span>
                      <span className="text-[11px] text-ink-muted block mt-0.5">
                        Centang ini agar rekomendasi berupa angka bulat (contoh: 15 bungkus, bukan 15,3 bungkus).
                      </span>
                    </div>
                    <label className="inline-flex items-center cursor-pointer shrink-0 min-touch-target select-none">
                      <input
                        type="checkbox"
                        checked={hanyaUtuh}
                        onChange={(e) =>
                          perbaruiProduk(produk.id, { hanyaJumlahUtuh: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:bg-accent peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-transform shadow-inner shrink-0"></div>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LANGKAH 3: SUMBER DAYA & KEBUTUHAN BAHAN */}
      {langkahPanduan === 3 && (
        <div className="space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-ink">Batasan Sumber Daya & Kebutuhan Bahan</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Berapa persediaan bahan, tenaga kerja, atau kapasitas mesin yang Anda miliki saat ini?
              </p>
            </div>
            <button
              onClick={() => tambahSumberDaya()}
              className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-surface hover:bg-accent-hover transition-colors min-touch-target self-start shrink-0"
            >
              <Plus className="h-4 w-4" />
              Tambah Sumber Daya
            </button>
          </div>

          <div className="space-y-5">
            {daftarSumberDaya.map((sumberDaya, indeks) => {
              const namaSumberDaya = sumberDaya.nama || sumberDaya.name || '';
              const kapasitasTersedia = sumberDaya.kapasitas ?? sumberDaya.capacity ?? 0;
              const satuanSumberDaya = sumberDaya.satuan || sumberDaya.unit || 'unit';
              const jenisBatasan = sumberDaya.jenisBatasan || sumberDaya.type || 'TIDAK_LEBIH_DARI';
              const apakahLEQ =
                jenisBatasan === 'TIDAK_LEBIH_DARI' || jenisBatasan === 'LEQ';
              const apakahGEQ =
                jenisBatasan === 'PALING_SEDIKIT' || jenisBatasan === 'GEQ';
              const apakahEQ =
                jenisBatasan === 'HARUS_TEPAT' || jenisBatasan === 'EQ';

              return (
                <div
                  key={sumberDaya.id}
                  className="rounded-xl border border-border bg-surface p-4 sm:p-5 shadow-subtle space-y-4 overflow-hidden"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="text-xs font-bold text-accent">
                      Sumber Daya #{indeks + 1}
                    </span>
                    {daftarSumberDaya.length > 1 && (
                      <button
                        onClick={() => hapusSumberDaya(sumberDaya.id)}
                        className="text-xs text-status-infeasible hover:underline flex items-center gap-1 min-touch-target"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Nama Sumber Daya */}
                    <div className="min-w-0">
                      <label className="block text-xs font-medium text-ink-muted mb-1">
                        Nama Sumber Daya / Bahan
                      </label>
                      <input
                        type="text"
                        value={namaSumberDaya}
                        onChange={(e) =>
                          perbaruiSumberDaya(sumberDaya.id, { nama: e.target.value })
                        }
                        placeholder="Contoh: Tepung Terigu, Jam Oven"
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none min-touch-target"
                      />
                    </div>

                    {/* Kapasitas Tersedia */}
                    <div className="min-w-0">
                      <label className="block text-xs font-medium text-ink-muted mb-1">
                        Kapasitas yang Tersedia
                      </label>
                      <input
                        type="number"
                        value={kapasitasTersedia}
                        onChange={(e) =>
                          perbaruiSumberDaya(sumberDaya.id, {
                            kapasitas: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink tabular-nums focus:border-accent focus:outline-none min-touch-target font-bold"
                      />
                    </div>

                    {/* Satuan Sumber Daya */}
                    <div className="min-w-0">
                      <label className="block text-xs font-medium text-ink-muted mb-1">
                        Satuan Kapasitas
                      </label>
                      <input
                        type="text"
                        value={satuanSumberDaya}
                        onChange={(e) =>
                          perbaruiSumberDaya(sumberDaya.id, { satuan: e.target.value })
                        }
                        placeholder="kg, jam kerja, liter, meter"
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none min-touch-target"
                      />
                    </div>
                  </div>

                  {/* Ketentuan Batasan Kapasitas (Radio Group) */}
                  <div className="pt-2">
                    <label className="block text-xs font-medium text-ink-muted mb-2">
                      Ketentuan Batasan Kapasitas:
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      {/* Pilihan 1: Maksimal (<=) */}
                      <button
                        type="button"
                        onClick={() =>
                          perbaruiSumberDaya(sumberDaya.id, { jenisBatasan: 'TIDAK_LEBIH_DARI' })
                        }
                        className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-colors min-touch-target overflow-hidden ${
                          apakahLEQ
                            ? 'border-accent bg-accent-light/80 text-accent font-semibold shadow-subtle'
                            : 'border-border bg-surface text-ink-muted hover:border-accent/40'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                            apakahLEQ ? 'border-accent bg-accent' : 'border-border'
                          }`}
                        >
                          {apakahLEQ && (
                            <span className="h-1.5 w-1.5 rounded-full bg-surface" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold leading-tight">Maksimal (≤)</div>
                          <div className="text-[11px] opacity-80 mt-0.5 break-words">
                            Tidak boleh melebihi {formatAngka(kapasitasTersedia)} {satuanSumberDaya}
                          </div>
                        </div>
                      </button>

                      {/* Pilihan 2: Minimal (>=) */}
                      <button
                        type="button"
                        onClick={() =>
                          perbaruiSumberDaya(sumberDaya.id, { jenisBatasan: 'PALING_SEDIKIT' })
                        }
                        className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-colors min-touch-target overflow-hidden ${
                          apakahGEQ
                            ? 'border-accent bg-accent-light/80 text-accent font-semibold shadow-subtle'
                            : 'border-border bg-surface text-ink-muted hover:border-accent/40'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                            apakahGEQ ? 'border-accent bg-accent' : 'border-border'
                          }`}
                        >
                          {apakahGEQ && (
                            <span className="h-1.5 w-1.5 rounded-full bg-surface" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold leading-tight">Minimal (≥)</div>
                          <div className="text-[11px] opacity-80 mt-0.5 break-words">
                            Paling sedikit {formatAngka(kapasitasTersedia)} {satuanSumberDaya}
                          </div>
                        </div>
                      </button>

                      {/* Pilihan 3: Harus Tepat (=) */}
                      <button
                        type="button"
                        onClick={() =>
                          perbaruiSumberDaya(sumberDaya.id, { jenisBatasan: 'HARUS_TEPAT' })
                        }
                        className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-colors min-touch-target overflow-hidden ${
                          apakahEQ
                            ? 'border-accent bg-accent-light/80 text-accent font-semibold shadow-subtle'
                            : 'border-border bg-surface text-ink-muted hover:border-accent/40'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                            apakahEQ ? 'border-accent bg-accent' : 'border-border'
                          }`}
                        >
                          {apakahEQ && (
                            <span className="h-1.5 w-1.5 rounded-full bg-surface" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold leading-tight">Harus Tepat (=)</div>
                          <div className="text-[11px] opacity-80 mt-0.5 break-words">
                            Harus tepat {formatAngka(kapasitasTersedia)} {satuanSumberDaya}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Kalimat Kebutuhan Pemakaian (Formula Bahasa Manusia) */}
                  <div className="pt-3 border-t border-border">
                    <label className="block text-xs font-semibold text-ink mb-2">
                      Kebutuhan untuk tiap 1 unit produk:
                    </label>
                    <div className="space-y-2">
                      {daftarProduk.map((prod) => {
                        const pemakaianUnit = matriksPemakaian[prod.id]?.[sumberDaya.id] ?? 0;
                        return (
                          <div
                            key={prod.id}
                            className="flex flex-wrap items-center gap-2 rounded-xl bg-bg p-3 text-xs text-ink max-w-full overflow-hidden"
                          >
                            <span className="text-ink-muted whitespace-nowrap">Setiap pembuatan 1</span>
                            <strong className="text-accent whitespace-nowrap">
                              {prod.nama || prod.name}
                            </strong>
                            <span className="text-ink-muted whitespace-nowrap">memerlukan</span>
                            <input
                              type="number"
                              step="0.01"
                              value={pemakaianUnit}
                              onChange={(e) =>
                                perbaruiPemakaian(
                                  prod.id,
                                  sumberDaya.id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-24 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-ink tabular-nums font-semibold focus:border-accent focus:outline-none min-touch-target shrink-0"
                            />
                            <span className="font-medium text-ink-muted truncate max-w-[200px]">
                              {satuanSumberDaya} {namaSumberDaya}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LANGKAH 4: PERIKSA & HITUNG REKOMENDASI */}
      {langkahPanduan === 4 && (
        <div className="space-y-5 animate-in fade-in">
          <div>
            <h2 className="text-xl font-bold text-ink">Periksa Data Sebelum Menghitung</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Pastikan seluruh produk, batasan kapasitas, dan kebutuhan bahan sudah sesuai dengan kondisi bisnis riil Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Ringkasan Produk */}
            <div className="rounded-xl border border-border bg-surface p-4 overflow-hidden">
              <h3 className="text-xs font-bold text-accent">
                Daftar Produk ({daftarProduk.length})
              </h3>
              <ul className="mt-3 divide-y divide-border text-xs">
                {daftarProduk.map((p) => {
                  const nama = p.nama || p.name;
                  const untung = p.keuntungan ?? p.profit ?? 0;
                  const satuan = p.satuan || p.unit;
                  return (
                    <li key={p.id} className="py-2 flex items-center justify-between gap-2">
                      <span className="font-medium text-ink truncate">{nama}</span>
                      <span className="tabular-nums font-semibold text-accent shrink-0">
                        {formatMataUangRupiah(untung)} / {satuan}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Ringkasan Sumber Daya */}
            <div className="rounded-xl border border-border bg-surface p-4 overflow-hidden">
              <h3 className="text-xs font-bold text-accent">
                Batasan Sumber Daya ({daftarSumberDaya.length})
              </h3>
              <ul className="mt-3 divide-y divide-border text-xs">
                {daftarSumberDaya.map((r) => {
                  const nama = r.nama || r.name;
                  const cap = r.kapasitas ?? r.capacity ?? 0;
                  const satuan = r.satuan || r.unit;
                  return (
                    <li key={r.id} className="py-2 flex items-center justify-between gap-2">
                      <span className="font-medium text-ink truncate">{nama}</span>
                      <span className="tabular-nums font-semibold text-ink-muted shrink-0">
                        {formatAngka(cap)} {satuan}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Tombol Hitung Siap Pakai */}
          <div className="rounded-xl border-2 border-accent bg-accent-light/50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-surface mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-ink">
              Data Siap Dihitung!
            </h3>
            <p className="mt-1 text-xs text-ink-muted max-w-md mx-auto">
              Sistem akan menghitung kombinasi produksi yang paling menghasilkan keuntungan maksimal seketika (&lt;100ms) di perangkat Anda.
            </p>
            <button
              onClick={() => aturTabAktif('results')}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-surface shadow-subtle hover:bg-accent-hover transition-colors min-touch-target"
            >
              Hitung &amp; Buka Hasil Rekomendasi
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tombol Navigasi Bawah */}
      <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
        {langkahPanduan > 1 ? (
          <button
            onClick={() => aturLangkahPanduan((langkahPanduan - 1) as 1 | 2 | 3 | 4)}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-ink hover:bg-bg transition-colors min-touch-target"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>
        ) : (
          <div />
        )}

        {langkahPanduan < 4 ? (
          <button
            onClick={() => aturLangkahPanduan((langkahPanduan + 1) as 1 | 2 | 3 | 4)}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-xs font-semibold text-surface hover:bg-accent-hover transition-colors min-touch-target"
          >
            Lanjut ke Langkah {langkahPanduan + 1}
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => aturTabAktif('results')}
            className="flex items-center gap-1.5 rounded-xl bg-status-optimal px-5 py-2.5 text-xs font-semibold text-surface hover:opacity-90 transition-opacity min-touch-target"
          >
            Buka Hasil Rekomendasi
            <Sparkles className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
