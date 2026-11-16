'use client';

import React, { useState } from 'react';
import { useBusinessStore } from '@/store/useBusinessStore';
import { BUSINESS_TEMPLATES } from '@/lib/templates';
import {
  Sparkles,
  Table as TableIcon,
  Compass,
  FileSpreadsheet,
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
    activeTab,
    setActiveTab,
    loadTemplate,
    scenarios,
    solution,
  } = useBusinessStore();

  const [showTemplatesDropdown, setShowTemplatesDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 gap-2 sm:gap-4">
        {/* Brand / Title (Compact & Elegant) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-surface shadow-subtle shrink-0">
            <Compass className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-bold tracking-tight text-ink whitespace-nowrap">
                Optimasi Bisnis
              </span>
              <span className="hidden lg:inline-block rounded bg-accent-light px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                v1.1 Client-Side
              </span>
            </div>
            <p className="hidden xl:block text-[11px] text-ink-muted truncate max-w-[200px]">
              Alokasi Produksi & Kapasitas
            </p>
          </div>
        </div>

        {/* Center Segmented Control Tabs (Desktop & Tablet) */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl border border-border bg-bg p-1 shrink-0">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors min-touch-target ${
              activeTab === 'wizard'
                ? 'bg-surface text-accent shadow-subtle'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Panduan</span>
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors min-touch-target ${
              activeTab === 'table'
                ? 'bg-surface text-accent shadow-subtle'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span>Tabel</span>
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors min-touch-target ${
              activeTab === 'results'
                ? 'bg-surface text-accent shadow-subtle'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-status-optimal" />
            <span>Hasil Rekomendasi</span>
            {solution.status === 'OPTIMAL' && (
              <span className="h-1.5 w-1.5 rounded-full bg-status-optimal" />
            )}
          </button>
        </nav>

        {/* Right Action Utilities (Balanced & Compact) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Templates Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTemplatesDropdown(!showTemplatesDropdown)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 sm:px-3 py-1.5 text-xs font-medium text-ink hover:bg-bg transition-colors min-touch-target"
              title="Pilih contoh kasus bisnis 1-klik"
            >
              <Layers className="h-3.5 w-3.5 text-accent" />
              <span className="hidden sm:inline">Contoh</span>
              <ChevronDown className="h-3 w-3 text-ink-muted" />
            </button>

            {showTemplatesDropdown && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-surface p-1 shadow-modal z-50 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setShowTemplatesDropdown(false)}
              >
                <div className="px-3 py-2 text-xs font-bold text-ink-muted border-b border-border">
                  Pilih Contoh Kasus
                </div>
                {BUSINESS_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      loadTemplate(tmpl.id);
                      setShowTemplatesDropdown(false);
                    }}
                    className="w-full text-left rounded-lg px-3 py-2 text-xs hover:bg-bg transition-colors"
                  >
                    <div className="font-semibold text-ink">{tmpl.name}</div>
                    <div className="text-[11px] text-ink-muted truncate">
                      {tmpl.description}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Skenario Button */}
          <button
            onClick={onOpenScenarios}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 sm:px-3 py-1.5 text-xs font-medium text-ink hover:bg-bg transition-colors min-touch-target"
            title="Kelola skenario tersimpan"
          >
            <Bookmark className="h-3.5 w-3.5 text-accent" />
            <span className="hidden sm:inline">Skenario</span>
            {scenarios.length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-surface">
                {scenarios.length}
              </span>
            )}
          </button>

          {/* Import / Export */}
          <button
            onClick={onOpenImportExport}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 sm:px-3 py-1.5 text-xs font-medium text-ink hover:bg-bg transition-colors min-touch-target"
            title="Impor atau Ekspor berkas Excel, CSV, PDF, dan tautan"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-accent" />
            <span className="hidden sm:inline">Berkas</span>
          </button>

          {/* AI Status Badge (System-provided, status only as requested!) */}
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
