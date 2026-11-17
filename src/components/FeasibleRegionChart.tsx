'use client';

import React, { useState, useRef } from 'react';
import { Geometri2D, TitikSudut2D } from '@/types';
import { formatMataUangRupiah, formatAngka } from '@/lib/formatters';
import { unduhSvgSebagaiPNG, unduhSvgSebagaiSVG } from '@/lib/exportUtils';
import { HelpCircle, Info, Crosshair, Sparkles, Download, Image as ImageIcon } from 'lucide-react';

interface FeasibleRegionChartProps {
  geometry: Geometri2D;
  objectiveType: string;
}

export function FeasibleRegionChart({ geometry, objectiveType }: FeasibleRegionChartProps) {
  const produkX = geometry.produkX || geometry.productX!;
  const produkY = geometry.produkY || geometry.productY!;
  const poligonAreaLayak = geometry.poligonAreaLayak || geometry.feasiblePolygon || [];
  const daftarTitikSudut = geometry.daftarTitikSudut || geometry.cornerPoints || [];
  const titikOptimal = geometry.titikOptimal || geometry.optimalPoint || [0, 0];
  const batasMaksimal = geometry.batasMaksimal || geometry.maxBounds || { x: 10, y: 10 };
  const daftarGarisBatasan = geometry.daftarGarisBatasan || geometry.constraintLines || [];

  const referensiSvg = useRef<SVGSVGElement>(null);
  const titikDefault =
    daftarTitikSudut.find((p) => p.apakahOptimal ?? p.isOptimal) || daftarTitikSudut[0] || null;
  const [titikTerpilih, setTitikTerpilih] = useState<TitikSudut2D | null>(titikDefault);
  const [tampilkanPenjelasan, setTampilkanPenjelasan] = useState(false);

  const namaX = produkX.nama || produkX.name || 'Produk X';
  const satuanX = produkX.satuan || produkX.unit || 'unit';
  const namaY = produkY.nama || produkY.name || 'Produk Y';
  const satuanY = produkY.satuan || produkY.unit || 'unit';

  const tanganiUnduhPNG = () => {
    if (referensiSvg.current) {
      unduhSvgSebagaiPNG(referensiSvg.current, `grafik-area-produksi-${namaX}-${namaY}.png`);
    }
  };

  const tanganiUnduhSVG = () => {
    if (referensiSvg.current) {
      unduhSvgSebagaiSVG(referensiSvg.current, `grafik-area-produksi-${namaX}-${namaY}.svg`);
    }
  };

  // Transformasi koordinat SVG
  const lebarSvg = 560;
  const tinggiSvg = 400;
  const bantalanSvg = 55;

  const skalaX = (x: number) =>
    bantalanSvg + (x / (batasMaksimal.x || 1)) * (lebarSvg - 2 * bantalanSvg);
  const skalaY = (y: number) =>
    tinggiSvg - bantalanSvg - (y / (batasMaksimal.y || 1)) * (tinggiSvg - 2 * bantalanSvg);

  // String titik koordinat poligon SVG
  const stringTitikPoligon = poligonAreaLayak
    .map(([x, y]) => `${skalaX(x)},${skalaY(y)}`)
    .join(' ');

  const apakahMaksimalkan =
    objectiveType === 'MAKSIMALKAN_UNTUNG' || objectiveType === 'MAXIMIZE_PROFIT';

  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 shadow-subtle space-y-4">
      {/* Kepala Grafik dengan Judul dan Tombol "Apa artinya?" */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            Area Produksi yang Aman (Feasible Region)
            <span className="text-xs font-normal text-ink-muted">
              ({namaX} vs {namaY})
            </span>
          </h3>
          <p className="text-xs text-ink-muted">
            Area hijau adalah seluruh kombinasi produksi yang aman dijalankan tanpa kehabisan bahan.
          </p>
        </div>

        {/* Tombol Unduh & Bantuan */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={tanganiUnduhPNG}
            className="flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent-light/60 px-2.5 py-1 text-xs font-bold text-accent hover:bg-accent-light transition-colors min-touch-target"
            title="Unduh grafik sebagai berkas gambar PNG resolusi tinggi"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Unduh Grafik (PNG)</span>
          </button>

          <button
            type="button"
            onClick={tanganiUnduhSVG}
            className="flex items-center gap-1 rounded-lg border border-border bg-bg px-2 py-1 text-xs font-semibold text-ink-muted hover:text-ink hover:bg-surface hover:border-accent transition-colors min-touch-target"
            title="Unduh grafik sebagai berkas vektor SVG tajam"
          >
            <Download className="h-3.5 w-3.5" />
            <span>SVG</span>
          </button>

          <button
            type="button"
            onClick={() => setTampilkanPenjelasan(!tampilkanPenjelasan)}
            className="flex items-center gap-1 rounded-lg border border-border bg-bg px-2.5 py-1 text-xs font-medium text-accent hover:bg-surface transition-colors min-touch-target"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Apa artinya?</span>
          </button>
        </div>
      </div>

      {/* Accordion Penjelasan Ramah Non-IT */}
      {tampilkanPenjelasan && (
        <div className="rounded-lg border border-accent-subtle bg-accent-light/60 p-3.5 text-xs text-ink space-y-1.5 animate-in fade-in">
          <div className="font-bold flex items-center gap-1.5 text-accent">
            <Info className="h-4 w-4 shrink-0" />
            Cara Membaca Grafik Area Produksi:
          </div>
          <p className="text-ink-muted leading-relaxed">
            - <strong>Sumbu Bawah (Mendatar):</strong> Jumlah {namaX} yang diproduksi.
            <br />- <strong>Sumbu Kiri (Tegak):</strong> Jumlah {namaY} yang diproduksi.
            <br />- <strong>Garis Berwarna:</strong> Batasan kapasitas sumber daya (persediaan bahan mentah, jam oven, mesin).
            <br />- <strong>Bintang Emas:</strong> Titik kombinasi produksi paling menguntungkan (rekomendasi terbaik)!
          </p>
        </div>
      )}

      {/* Kanvas Grafik SVG Interaktif */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-[var(--bg-canvas)] p-1 sm:p-2 flex justify-center touch-manipulation">
        <svg
          ref={referensiSvg}
          role="img"
          aria-label="Grafik visualisasi area yang memungkinkan"
          viewBox={`0 0 ${lebarSvg} ${tinggiSvg}`}
          className="w-full max-w-[620px] h-auto select-none font-sans"
        >
          {/* Garis Grid Kotak-Kotak */}
          {[0.25, 0.5, 0.75, 1].map((pct) => {
            const nilaiX = batasMaksimal.x * pct;
            const nilaiY = batasMaksimal.y * pct;
            return (
              <React.Fragment key={pct}>
                {/* Garis Grid Vertikal */}
                <line
                  x1={skalaX(nilaiX)}
                  y1={skalaY(0)}
                  x2={skalaX(nilaiX)}
                  y2={skalaY(batasMaksimal.y)}
                  stroke="#E3E1DB"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                {/* Garis Grid Horizontal */}
                <line
                  x1={skalaX(0)}
                  y1={skalaY(nilaiY)}
                  x2={skalaX(batasMaksimal.x)}
                  y2={skalaY(nilaiY)}
                  stroke="#E3E1DB"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                {/* Angka Sumbu */}
                <text
                  x={skalaX(nilaiX)}
                  y={skalaY(0) + 16}
                  fontSize="10"
                  textAnchor="middle"
                  fill="#5B6672"
                  className="tabular-nums"
                >
                  {formatAngka(nilaiX, 0)}
                </text>
                <text
                  x={skalaX(0) - 8}
                  y={skalaY(nilaiY) + 3}
                  fontSize="10"
                  textAnchor="end"
                  fill="#5B6672"
                  className="tabular-nums"
                >
                  {formatAngka(nilaiY, 0)}
                </text>
              </React.Fragment>
            );
          })}

          {/* Area Poligon Hijau yang Memungkinkan (Feasible Region) */}
          {poligonAreaLayak.length > 2 && (
            <polygon
              points={stringTitikPoligon}
              fill="#2F7D57"
              fillOpacity="0.15"
              stroke="#2F7D57"
              strokeWidth="1.5"
            />
          )}

          {/* Garis-Garis Batasan Sumber Daya */}
          {daftarGarisBatasan.map((garis) => {
            let p1: [number, number] = [0, 0];
            let p2: [number, number] = [0, 0];

            const a = garis.koefisienX ?? garis.a ?? 0;
            const b = garis.koefisienY ?? garis.b ?? 0;
            const c = garis.kapasitasC ?? garis.c ?? 0;
            const warna = garis.warna || garis.color || '#1F4E5F';
            const idRes = garis.idSumberDaya || garis.resourceId;

            if (a > 0 && b > 0) {
              p1 = [0, c / b];
              p2 = [c / a, 0];
            } else if (a > 0 && b === 0) {
              p1 = [c / a, 0];
              p2 = [c / a, batasMaksimal.y];
            } else if (a === 0 && b > 0) {
              p1 = [0, c / b];
              p2 = [batasMaksimal.x, c / b];
            }

            return (
              <g key={idRes}>
                <line
                  x1={skalaX(p1[0])}
                  y1={skalaY(p1[1])}
                  x2={skalaX(p2[0])}
                  y2={skalaY(p2[1])}
                  stroke={warna}
                  strokeWidth="2"
                  opacity="0.85"
                />
              </g>
            );
          })}

          {/* Titik Sudut */}
          {daftarTitikSudut.map((pt, i) => {
            const apakahOpt = pt.apakahOptimal ?? pt.isOptimal ?? false;
            const apakahDipilih = titikTerpilih?.x === pt.x && titikTerpilih?.y === pt.y;
            return (
              <g
                key={i}
                className="cursor-pointer"
                onClick={() => setTitikTerpilih(pt)}
                onTouchStart={() => setTitikTerpilih(pt)}
              >
                {/* Area Sentuh 44px Khusus Layar Sentuh Ponsel */}
                <circle
                  cx={skalaX(pt.x)}
                  cy={skalaY(pt.y)}
                  r="22"
                  fill="transparent"
                />
                {/* Cincin Lingkaran Titik yang Dipilih */}
                {apakahDipilih && (
                  <circle
                    cx={skalaX(pt.x)}
                    cy={skalaY(pt.y)}
                    r={apakahOpt ? 12 : 10}
                    fill="none"
                    stroke={apakahOpt ? 'var(--gold-signal)' : 'var(--accent)'}
                    strokeWidth="2"
                    strokeDasharray="2 2"
                  />
                )}
                {/* Titik Penanda Visual */}
                <circle
                  cx={skalaX(pt.x)}
                  cy={skalaY(pt.y)}
                  r={apakahOpt ? 7 : (apakahDipilih ? 6 : 4.5)}
                  fill={apakahOpt ? 'var(--gold-signal)' : 'var(--accent)'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </g>
            );
          })}

          {/* Penanda Titik Bintang Emas Solusi Optimal */}
          <g transform={`translate(${skalaX(titikOptimal[0])}, ${skalaY(titikOptimal[1])})`}>
            <circle r="9" fill="none" stroke="var(--gold-signal)" strokeWidth="2" strokeDasharray="2 2" />
            <circle r="4" fill="var(--gold-signal)" />
          </g>

          {/* Sumbu Koordinat */}
          <line
            x1={skalaX(0)}
            y1={skalaY(0)}
            x2={skalaX(batasMaksimal.x)}
            y2={skalaY(0)}
            stroke="#16202A"
            strokeWidth="1.5"
          />
          <line
            x1={skalaX(0)}
            y1={skalaY(0)}
            x2={skalaX(0)}
            y2={skalaY(batasMaksimal.y)}
            stroke="#16202A"
            strokeWidth="1.5"
          />

          {/* Label Nama Sumbu */}
          <text
            x={lebarSvg / 2}
            y={tinggiSvg - 12}
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
            fill="#16202A"
          >
            {namaX} ({satuanX})
          </text>
          <text
            x={15}
            y={tinggiSvg / 2}
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
            fill="#16202A"
            transform={`rotate(-90, 15, ${tinggiSvg / 2})`}
          >
            {namaY} ({satuanY})
          </text>
        </svg>
      </div>

      {/* Tombol Pilihan Titik Sudut (Ramah Ponsel 44px) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-ink">
            Pilih Titik Sudut:
          </span>
          <span className="text-[11px] text-ink-muted">
            Tekan titik untuk membandingkan kombinasi produksi
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {daftarTitikSudut.map((pt, i) => {
            const apakahOpt = pt.apakahOptimal ?? pt.isOptimal ?? false;
            const apakahDipilih = titikTerpilih?.x === pt.x && titikTerpilih?.y === pt.y;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setTitikTerpilih(pt)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors min-touch-target ${
                  apakahDipilih
                    ? 'border-accent bg-accent text-surface shadow-subtle'
                    : apakahOpt
                    ? 'border-[var(--gold-signal)] bg-accent-light/50 text-ink hover:border-accent'
                    : 'border-border bg-bg text-ink-muted hover:text-ink hover:border-accent/40'
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                    apakahOpt ? 'bg-[var(--gold-signal)]' : 'bg-accent'
                  }`}
                />
                <span>
                  {apakahOpt ? '⭐ Titik Rekomendasi' : `Titik Alternatif ${String.fromCharCode(65 + i)}`}
                </span>
                <span className="tabular-nums font-mono opacity-80 text-[11px]">
                  ({formatAngka(pt.x)}, {formatAngka(pt.y)})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Kartu Rincian Titik yang Sedang Dipilih */}
      {titikTerpilih && (
        <div className="rounded-xl border-2 border-accent bg-accent-light/50 p-4 space-y-2 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-accent flex items-center gap-1.5">
              <Crosshair className="h-4 w-4" />
              {(titikTerpilih.apakahOptimal ?? titikTerpilih.isOptimal)
                ? '⭐ Titik Rekomendasi Terbaik (Paling Menguntungkan)'
                : 'Titik Sudut Alternatif'}
            </span>
            <span className="text-sm font-extrabold text-ink tabular-nums">
              {apakahMaksimalkan ? 'Total Untung' : 'Total Biaya'}:{' '}
              {formatMataUangRupiah(titikTerpilih.nilai ?? titikTerpilih.value ?? 0)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="rounded-lg bg-surface p-2.5 border border-border">
              <span className="text-ink-muted block text-[11px] truncate">{namaX}:</span>
              <span className="font-bold text-ink tabular-nums text-sm">
                {formatAngka(titikTerpilih.x)} {satuanX}
              </span>
            </div>
            <div className="rounded-lg bg-surface p-2.5 border border-border">
              <span className="text-ink-muted block text-[11px] truncate">{namaY}:</span>
              <span className="font-bold text-ink tabular-nums text-sm">
                {formatAngka(titikTerpilih.y)} {satuanY}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legenda Keterangan Warna */}
      <div className="flex flex-wrap items-center gap-3 text-xs pt-2 border-t border-border">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[var(--gold-signal)]"></span>
          <span className="font-semibold text-ink">Titik Rekomendasi (Optimum)</span>
        </div>
        {daftarGarisBatasan.map((l) => (
          <div key={l.idSumberDaya || l.resourceId} className="flex items-center gap-1.5">
            <span
              className="h-2 w-3.5 rounded"
              style={{ backgroundColor: l.warna || l.color }}
            ></span>
            <span className="text-ink-muted">{l.nama || l.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
