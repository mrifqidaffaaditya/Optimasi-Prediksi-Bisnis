'use client';

import React, { useState } from 'react';
import { Geometry2D, CornerPoint2D } from '@/types';
import { formatRupiah, formatNumber } from '@/lib/formatters';
import { HelpCircle, Info, Crosshair } from 'lucide-react';

interface FeasibleRegionChartProps {
  geometry: Geometry2D;
  objectiveType: string;
}

export function FeasibleRegionChart({ geometry, objectiveType }: FeasibleRegionChartProps) {
  const [selectedPoint, setSelectedPoint] = useState<CornerPoint2D | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const { productX, productY, feasiblePolygon, cornerPoints, optimalPoint, maxBounds, constraintLines } = geometry;

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
    <div className="rounded-xl border border-border bg-surface p-5 shadow-subtle space-y-4">
      {/* Header with Title and "Apa artinya?" button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            Area Produksi yang Memungkinkan (Feasible Region)
            <span className="text-xs font-normal text-ink-muted">
              ({productX.name} vs {productY.name})
            </span>
          </h3>
          <p className="text-xs text-ink-muted">
            Area berwarna hijau lembut adalah seluruh kombinasi produksi yang aman dijalankan.
          </p>
        </div>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center gap-1 rounded-lg border border-border bg-bg px-2.5 py-1 text-xs font-medium text-accent hover:bg-surface transition-colors min-touch-target"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Apa artinya?
        </button>
      </div>

      {/* Explainer Accordion/Modal */}
      {showExplanation && (
        <div className="rounded-lg border border-accent-subtle bg-accent-light/60 p-3.5 text-xs text-ink space-y-1.5 animate-in fade-in">
          <div className="font-bold flex items-center gap-1.5 text-accent">
            <Info className="h-4 w-4" />
            Cara Membaca Grafik Area Produksi:
          </div>
          <p className="text-ink-muted leading-relaxed">
            - <strong>Sumbu Horizontal (Bawah):</strong> Jumlah {productX.name} yang diproduksi.
            <br />- <strong>Sumbu Vertikal (Kiri):</strong> Jumlah {productY.name} yang diproduksi.
            <br />- <strong>Garis Berwarna:</strong> Batasan kapasitas sumber daya (bahan baku, jam oven, dll). Produksi tidak boleh melewati garis ini.
            <br />- <strong>Titik Emas / Bintang:</strong> Kombinasi terbaik yang memberikan keuntungan paling maksimal!
          </p>
        </div>
      )}

      {/* Interactive SVG Chart */}
      <div className="relative overflow-hidden rounded-lg border border-border bg-[var(--bg-canvas)] p-2 flex justify-center">
        <svg
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
            // Find points where line intersects boundary of graph
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

          {/* Corner Points */}
          {cornerPoints.map((pt, i) => {
            const isOpt = pt.isOptimal;
            return (
              <g
                key={i}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => setSelectedPoint(pt)}
              >
                <circle
                  cx={scaleX(pt.x)}
                  cy={scaleY(pt.y)}
                  r={isOpt ? 6 : 4}
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
          {/* X Axis */}
          <line
            x1={scaleX(0)}
            y1={scaleY(0)}
            x2={scaleX(maxBounds.x)}
            y2={scaleY(0)}
            stroke="#16202A"
            strokeWidth="1.5"
          />
          {/* Y Axis */}
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

      {/* Legend & Selected Corner Point Details */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs pt-2 border-t border-border">
        {/* Constraints Legend */}
        <div className="flex flex-wrap items-center gap-3">
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

        {/* Selected Point Inspection */}
        {selectedPoint ? (
          <div className="rounded bg-accent-light px-2.5 py-1 text-accent font-semibold flex items-center gap-1">
            <Crosshair className="h-3.5 w-3.5" />
            Titik terpilih: ({formatNumber(selectedPoint.x)} {productX.unit}, {formatNumber(selectedPoint.y)} {productY.unit}) = {formatRupiah(selectedPoint.value)}
          </div>
        ) : (
          <span className="text-ink-muted italic">
            Klik titik sudut mana pun untuk melihat nilai keuntungannya
          </span>
        )}
      </div>
    </div>
  );
}
