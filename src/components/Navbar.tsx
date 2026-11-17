'use client';

import React, { useState } from 'react';
import { useBusinessStore } from '@/store/useBusinessStore';
import { TEMPLAT_BISNIS } from '@/lib/templates';
import {
  Sparkles,
  Table as TableIcon,
  Compass,
  FileSpreadsheet,
  Download,
  Bookmark,
  Bot,
  ChevronDown,
  Layers,
} from 'lucide-react';

interface NavbarProps {
  onOpenImportExport: () => void;
  onOpenScenarios: () => void;
  onOpenAI: () => void;
}

export function Navbar({
  onOpenImportExport,
  onOpenScenarios,
  onOpenAI,
}: NavbarProps) {
  const {
    tabAktif,
    aturTabAktif,
    muatTemplat,
    daftarSkenario,
    solusiBisnis,
  } = useBusinessStore();

  const [tampilkanMenuTemplat, setTampilkanMenuTemplat] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 gap-2 sm:gap-4">
        {/* Identitas Aplikasi */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-surface shadow-subtle shrink-0">
            <Compass className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-bold tracking-tight text-ink whitespace-nowrap">
                Optimasi Perencanaan Produksi
              </span>
              <span className="hidden lg:inline-block rounded bg-accent-light px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                Kelompok 9 UNNES
              </span>
            </div>
            <p className="hidden xl:block text-[11px] text-ink-muted truncate max-w-[220px]">
              Matematika Dasar &bull; opb.keidev.my.id
            </p>
          </div>
        </div>

        {/* Tab Navigasi Tengah (Desktop & Tablet) */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl border border-border bg-bg p-1 shrink-0">
          <button
            onClick={() => aturTabAktif('wizard')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors min-touch-target ${
              tabAktif === 'wizard'
                ? 'bg-surface text-accent shadow-subtle'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Panduan</span>
          </button>
          <button
            onClick={() => aturTabAktif('table')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors min-touch-target ${
              tabAktif === 'table'
                ? 'bg-surface text-accent shadow-subtle'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span>Tabel</span>
          </button>
          <button
            onClick={() => aturTabAktif('results')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors min-touch-target ${
              tabAktif === 'results'
                ? 'bg-surface text-accent shadow-subtle'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-status-optimal" />
            <span>Hasil Rekomendasi</span>
            {solusiBisnis.status === 'OPTIMAL' && (
              <span className="h-1.5 w-1.5 rounded-full bg-status-optimal" />
            )}
          </button>
        </nav>

        {/* Utilitas & Aksi Cepat Kanan */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Pilihan Contoh Kasus */}
          <div className="relative">
            <button
              onClick={() => setTampilkanMenuTemplat(!tampilkanMenuTemplat)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 sm:px-3 py-1.5 text-xs font-medium text-ink hover:bg-bg transition-colors min-touch-target"
              title="Pilih contoh kasus bisnis 1-klik"
            >
              <Layers className="h-3.5 w-3.5 text-accent" />
              <span className="hidden sm:inline">Contoh Kasus</span>
              <ChevronDown className="h-3 w-3 text-ink-muted" />
            </button>

            {tampilkanMenuTemplat && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-surface p-1 shadow-modal z-50 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setTampilkanMenuTemplat(false)}
              >
                <div className="px-3 py-2 text-xs font-bold text-ink-muted border-b border-border">
                  Pilih Contoh Kasus
                </div>
                {TEMPLAT_BISNIS.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      muatTemplat(tmpl.id);
                      setTampilkanMenuTemplat(false);
                    }}
                    className="w-full text-left rounded-lg px-3 py-2 text-xs hover:bg-bg transition-colors"
                  >
                    <div className="font-semibold text-ink">{tmpl.nama || tmpl.name}</div>
                    <div className="text-[11px] text-ink-muted truncate">
                      {tmpl.deskripsi || tmpl.description}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tombol Skenario */}
          <button
            onClick={onOpenScenarios}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 sm:px-3 py-1.5 text-xs font-medium text-ink hover:bg-bg transition-colors min-touch-target"
            title="Kelola skenario tersimpan"
          >
            <Bookmark className="h-3.5 w-3.5 text-accent" />
            <span className="hidden sm:inline">Skenario</span>
            {daftarSkenario.length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-surface">
                {daftarSkenario.length}
              </span>
            )}
          </button>

          {/* Tombol Ekspor */}
          <button
            onClick={onOpenImportExport}
            className="flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent-light/50 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-accent hover:bg-accent-light transition-colors min-touch-target"
            title="Ekspor Laporan (Excel, PDF, CSV) & Impor Berkas"
          >
            <Download className="h-3.5 w-3.5 text-accent" />
            <span>Ekspor</span>
          </button>

          {/* Status Asisten AI */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 rounded-lg border border-status-optimal-border bg-status-optimal-light/70 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-status-optimal hover:bg-status-optimal-light transition-colors min-touch-target"
            title="Asisten AI Bisnis Aktif (Klik untuk membuat model dari teks)"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-optimal opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-status-optimal"></span>
            </span>
            <Bot className="h-3.5 w-3.5" />
            <span className="hidden md:inline">AI Aktif</span>
          </button>
        </div>
      </div>
    </header>
  );
}
