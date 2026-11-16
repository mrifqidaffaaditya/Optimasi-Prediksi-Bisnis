'use client';

import React, { useState, useRef } from 'react';
import { Geometry2D, CornerPoint2D } from '@/types';
import { formatRupiah, formatNumber } from '@/lib/formatters';
import { downloadSvgAsPNG, downloadSvgAsSVG } from '@/lib/exportUtils';
import { HelpCircle, Info, Crosshair, Sparkles, Download, Image as ImageIcon } from 'lucide-react';

interface FeasibleRegionChartProps {
  geometry: Geometry2D;
  objectiveType: string;
}

export function FeasibleRegionChart({ geometry, objectiveType }: FeasibleRegionChartProps) {
  const { productX, productY, feasiblePolygon, cornerPoints, optimalPoint, maxBounds, constraintLines } = geometry;

  const svgRef = useRef<SVGSVGElement>(null);
  const defaultPoint = cornerPoints.find((p) => p.isOptimal) || cornerPoints[0] || null;
  const [selectedPoint, setSelectedPoint] = useState<CornerPoint2D | null>(defaultPoint);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleDownloadPNG = () => {
    if (svgRef.current) {
      downloadSvgAsPNG(svgRef.current, `grafik-area-produksi-${productX.name}-${productY.name}.png`);
    }
  };

  const handleDownloadSVG = () => {
    if (svgRef.current) {
      downloadSvgAsSVG(svgRef.current, `grafik-area-produksi-${productX.name}-${productY.name}.svg`);
    }
  };

  // SVG coordinate transformation
  const width = 560;
  const height = 400;
  const padding = 55;

  const scaleX = (x: number) => padding + (x / (maxBounds.x || 1)) * (width - 2 * padding);
  const scaleY = (y: number) => height - padding - (y / (maxBounds.y || 1)) * (height - 2 * padding);

  // SVG polygon path
  const polygonPointsStr = feasiblePolygon
    .map(([x, y]) => `${scaleX(x)},${scaleY(y)}`)
    .join(' ');

  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 shadow-subtle space-y-4">
      {/* Header with Title and "Apa artinya?" button */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            Area Produksi (Feasible Region)
            <span className="text-xs font-normal text-ink-muted">
              ({productX.name} vs {productY.name})
            </span>
          </h3>
          <p className="text-xs text-ink-muted">
            Area hijau adalah seluruh kombinasi produksi yang aman dijalankan.
          </p>
        </div>

        {/* Action Buttons: Download PNG, Download SVG, Apa artinya */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleDownloadPNG}
            className="flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent-light/60 px-2.5 py-1 text-xs font-bold text-accent hover:bg-accent-light transition-colors min-touch-target"
            title="Unduh grafik sebagai berkas gambar PNG resolusi tinggi"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Unduh Grafik (PNG)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSVG}
            className="flex items-center gap-1 rounded-lg border border-border bg-bg px-2 py-1 text-xs font-semibold text-ink-muted hover:text-ink hover:bg-surface hover:border-accent transition-colors min-touch-target"
            title="Unduh grafik sebagai berkas vektor SVG tajam"
          >
            <Download className="h-3.5 w-3.5" />
            <span>SVG</span>
          </button>

          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-1 rounded-lg border border-border bg-bg px-2.5 py-1 text-xs font-medium text-accent hover:bg-surface transition-colors min-touch-target"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Apa artinya?</span>
          </button>
        </div>
      </div>

      {/* Explainer Accordion/Modal */}
      {showExplanation && (
        <div className="rounded-lg border border-accent-subtle bg-accent-light/60 p-3.5 text-xs text-ink space-y-1.5 animate-in fade-in">
          <div className="font-bold flex items-center gap-1.5 text-accent">
            <Info className="h-4 w-4 shrink-0" />
            Cara Membaca Grafik Area Produksi:
          </div>
          <p className="text-ink-muted leading-relaxed">
            - <strong>Sumbu Bawah:</strong> Jumlah {productX.name} yang diproduksi.
            <br />- <strong>Sumbu Kiri:</strong> Jumlah {productY.name} yang diproduksi.
            <br />- <strong>Garis Berwarna:</strong> Batasan kapasitas sumber daya (bahan, jam kerja).
            <br />- <strong>Bintang Emas:</strong> Titik kombinasi paling menguntungkan (optimum)!
          </p>
        </div>
      )}

      {/* Interactive SVG Chart (with Touch Optimization & Hit-Area) */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-[var(--bg-canvas)] p-1 sm:p-2 flex justify-center touch-manipulation">
        <svg
          ref={svgRef}
          role="img"
          aria-label="Grafik visualisasi area yang memungkinkan"
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-[620px] h-auto select-none font-sans"
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((pct) => {
            const xVal = maxBounds.x * pct;
            const yVal = maxBounds.y * pct;
            return (
              <React.Fragment key={pct}>
                {/* Vertical grid */}
                <line
                  x1={scaleX(xVal)}
                  y1={scaleY(0)}
                  x2={scaleX(xVal)}
                  y2={scaleY(maxBounds.y)}
                  stroke="#E3E1DB"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                {/* Horizontal grid */}
                <line
                  x1={scaleX(0)}
                  y1={scaleY(yVal)}
                  x2={scaleX(maxBounds.x)}
                  y2={scaleY(yVal)}
                  stroke="#E3E1DB"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                {/* Axis tick labels */}
                <text
                  x={scaleX(xVal)}
                  y={scaleY(0) + 16}
                  fontSize="10"
                  textAnchor="middle"
                  fill="#5B6672"
                  className="tabular-nums"
                >
                  {formatNumber(xVal, 0)}
                </text>
                <text
                  x={scaleX(0) - 8}
                  y={scaleY(yVal) + 3}
                  fontSize="10"
                  textAnchor="end"
                  fill="#5B6672"
                  className="tabular-nums"
                >
                  {formatNumber(yVal, 0)}
                </text>
              </React.Fragment>
            );
          })}

          {/* Feasible Polygon (Shaded Area) */}
          {feasiblePolygon.length > 2 && (
            <polygon
              points={polygonPointsStr}
              fill="#2F7D57"
              fillOpacity="0.15"
              stroke="#2F7D57"
              strokeWidth="1.5"
            />
          )}

          {/* Constraint Boundary Lines */}
          {constraintLines.map((line) => {
            let p1: [number, number] = [0, 0];
            let p2: [number, number] = [0, 0];

            if (line.a > 0 && line.b > 0) {
              p1 = [0, line.c / line.b];
              p2 = [line.c / line.a, 0];
            } else if (line.a > 0 && line.b === 0) {
              p1 = [line.c / line.a, 0];
              p2 = [line.c / line.a, maxBounds.y];
            } else if (line.a === 0 && line.b > 0) {
              p1 = [0, line.c / line.b];
              p2 = [maxBounds.x, line.c / line.b];
            }

            return (
              <g key={line.resourceId}>
                <line
                  x1={scaleX(p1[0])}
                  y1={scaleY(p1[1])}
                  x2={scaleX(p2[0])}
                  y2={scaleY(p2[1])}
                  stroke={line.color}
                  strokeWidth="2"
                  opacity="0.85"
                />
              </g>
            );
          })}

          {/* Corner Points with 44px Touch Targets */}
          {cornerPoints.map((pt, i) => {
            const isOpt = pt.isOptimal;
            const isSelected = selectedPoint?.x === pt.x && selectedPoint?.y === pt.y;
            return (
              <g
                key={i}
                className="cursor-pointer"
                onClick={() => setSelectedPoint(pt)}
                onTouchStart={() => setSelectedPoint(pt)}
              >
                {/* 44px invisible touch hit target for mobile fingers */}
                <circle
                  cx={scaleX(pt.x)}
                  cy={scaleY(pt.y)}
                  r="22"
                  fill="transparent"
                />
                {/* Selected point pulsing ring */}
                {isSelected && (
                  <circle
                    cx={scaleX(pt.x)}
                    cy={scaleY(pt.y)}
                    r={isOpt ? 12 : 10}
                    fill="none"
                    stroke={isOpt ? 'var(--gold-signal)' : 'var(--accent)'}
                    strokeWidth="2"
                    strokeDasharray="2 2"
                  />
                )}
                {/* Visible point marker */}
                <circle
                  cx={scaleX(pt.x)}
                  cy={scaleY(pt.y)}
                  r={isOpt ? 7 : (isSelected ? 6 : 4.5)}
                  fill={isOpt ? 'var(--gold-signal)' : 'var(--accent)'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </g>
            );
          })}

          {/* Optimal Point Star/Marker */}
          <g transform={`translate(${scaleX(optimalPoint[0])}, ${scaleY(optimalPoint[1])})`}>
            <circle r="9" fill="none" stroke="var(--gold-signal)" strokeWidth="2" strokeDasharray="2 2" />
            <circle r="4" fill="var(--gold-signal)" />
          </g>

          {/* Axes */}
          <line
            x1={scaleX(0)}
            y1={scaleY(0)}
            x2={scaleX(maxBounds.x)}
            y2={scaleY(0)}
            stroke="#16202A"
            strokeWidth="1.5"
          />
          <line
            x1={scaleX(0)}
            y1={scaleY(0)}
            x2={scaleX(0)}
            y2={scaleY(maxBounds.y)}
            stroke="#16202A"
            strokeWidth="1.5"
          />

          {/* Axis Labels */}
          <text
            x={width / 2}
            y={height - 12}
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
            fill="#16202A"
          >
            {productX.name} ({productX.unit})
          </text>
          <text
            x={15}
            y={height / 2}
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
            fill="#16202A"
            transform={`rotate(-90, 15, ${height / 2})`}
          >
            {productY.name} ({productY.unit})
          </text>
        </svg>
      </div>

      {/* Mobile-Friendly Point Selector Chips (Tappable on mobile with 44px min-touch) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-ink">
            Pilih Titik Sudut:
          </span>
          <span className="text-[11px] text-ink-muted">
            Tekan titik untuk melihat perbandingan
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {cornerPoints.map((pt, i) => {
            const isOpt = pt.isOptimal;
            const isSelected = selectedPoint?.x === pt.x && selectedPoint?.y === pt.y;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedPoint(pt)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors min-touch-target ${
                  isSelected
                    ? 'border-accent bg-accent text-surface shadow-subtle'
                    : isOpt
                    ? 'border-[var(--gold-signal)] bg-accent-light/50 text-ink hover:border-accent'
                    : 'border-border bg-bg text-ink-muted hover:text-ink hover:border-accent/40'
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                    isOpt ? 'bg-[var(--gold-signal)]' : 'bg-accent'
                  }`}
                />
                <span>
                  {isOpt ? '⭐ Titik Rekomendasi' : `Titik ${String.fromCharCode(65 + i)}`}
                </span>
                <span className="tabular-nums font-mono opacity-80 text-[11px]">
                  ({formatNumber(pt.x)}, {formatNumber(pt.y)})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Point Inspection Card (Clear, Large, Touch-Friendly) */}
      {selectedPoint && (
        <div className="rounded-xl border-2 border-accent bg-accent-light/50 p-4 space-y-2 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-accent flex items-center gap-1.5">
              <Crosshair className="h-4 w-4" />
              {selectedPoint.isOptimal ? '⭐ Titik Rekomendasi Terbaik (Optimum)' : 'Titik Sudut Alternatif'}
            </span>
            <span className="text-sm font-extrabold text-ink tabular-nums">
              {objectiveType === 'MAXIMIZE_PROFIT' ? 'Total Untung' : 'Total Biaya'}: {formatRupiah(selectedPoint.value)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="rounded-lg bg-surface p-2.5 border border-border">
              <span className="text-ink-muted block text-[11px] truncate">{productX.name}:</span>
              <span className="font-bold text-ink tabular-nums text-sm">
                {formatNumber(selectedPoint.x)} {productX.unit}
              </span>
            </div>
            <div className="rounded-lg bg-surface p-2.5 border border-border">
              <span className="text-ink-muted block text-[11px] truncate">{productY.name}:</span>
              <span className="font-bold text-ink tabular-nums text-sm">
                {formatNumber(selectedPoint.y)} {productY.unit}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs pt-2 border-t border-border">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[var(--gold-signal)]"></span>
          <span className="font-semibold text-ink">Titik Rekomendasi (Optimum)</span>
        </div>
        {constraintLines.map((l) => (
          <div key={l.resourceId} className="flex items-center gap-1.5">
            <span className="h-2 w-3.5 rounded" style={{ backgroundColor: l.color }}></span>
            <span className="text-ink-muted">{l.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
