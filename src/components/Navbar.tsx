'use client';

import React, { useState } from 'react';
import { useBusinessStore } from '@/store/useBusinessStore';
import { BUSINESS_TEMPLATES } from '@/lib/templates';
import {
  Sparkles,
  Table as TableIcon,
  Compass,
  FileSpreadsheet,
  Share2,
  Bookmark,
  RotateCcw,
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
    resetAll,
    scenarios,
    aiSettings,
    objective,
    solution,
  } = useBusinessStore();

  const [showTemplatesDropdown, setShowTemplatesDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-surface shadow-subtle">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-ink sm:text-lg">
                Optimasi & Prediksi Bisnis
              </h1>
              <span className="hidden rounded bg-accent-light px-2 py-0.5 text-xs font-medium text-accent sm:inline-block">
                v1.1 Client-Side
              </span>
            </div>
            <p className="hidden text-xs text-ink-muted sm:block">
              Perencanaan Alokasi Sumber Daya & Rekomendasi Produksi
            </p>
          </div>
        </div>

        {/* View Switcher Tabs (Desktop & Tablet) */}
        <nav className="hidden md:flex items-center gap-1 rounded-lg border border-border bg-bg p-1">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors min-touch-target ${
              activeTab === 'wizard'
                ? 'bg-surface text-accent shadow-subtle'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Compass className="h-4 w-4" />
            Panduan 4 Langkah
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors min-touch-target ${
              activeTab === 'table'
                ? 'bg-surface text-accent shadow-subtle'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <TableIcon className="h-4 w-4" />
            Tampilan Tabel
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors min-touch-target ${
              activeTab === 'results'
                ? 'bg-surface text-accent shadow-subtle'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Sparkles className="h-4 w-4 text-status-optimal" />
            Hasil Rekomendasi
            {solution.status === 'OPTIMAL' && (
              <span className="h-2 w-2 rounded-full bg-status-optimal"></span>
            )}
          </button>
        </nav>

        {/* Actions & Utilities */}
        <div className="flex items-center gap-2">
          {/* Template Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTemplatesDropdown(!showTemplatesDropdown)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-ink hover:bg-bg transition-colors min-touch-target"
              title="Pilih contoh kasus 1-klik"
            >
              <Layers className="h-4 w-4 text-accent" />
              <span className="hidden sm:inline">Pakai Contoh</span>
              <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
            </button>

            {showTemplatesDropdown && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-lg border border-border bg-surface p-1 shadow-modal z-50 animate-in fade-in zoom-in-95"
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
                    className="w-full text-left rounded-md px-3 py-2 text-xs hover:bg-bg transition-colors"
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

          {/* Import / Export */}
          <button
            onClick={onOpenImportExport}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-ink hover:bg-bg transition-colors min-touch-target"
            title="Impor atau Ekspor berkas Excel, CSV, PDF, dan tautan"
          >
            <FileSpreadsheet className="h-4 w-4 text-accent" />
            <span className="hidden sm:inline">Berkas & Ekspor</span>
          </button>

          {/* Scenarios Button */}
          <button
            onClick={onOpenScenarios}
            className="relative flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-ink hover:bg-bg transition-colors min-touch-target"
            title="Kelola skenario tersimpan"
          >
            <Bookmark className="h-4 w-4 text-accent" />
            <span className="hidden sm:inline">Skenario</span>
            {scenarios.length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-surface">
                {scenarios.length}
              </span>
            )}
          </button>

          {/* AI Settings Indicator (PRD 7) */}
          <button
            onClick={onOpenAI}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors min-touch-target ${
              aiSettings.isLocal
                ? 'border-border bg-bg text-ink-muted hover:text-ink'
                : 'border-status-optimal-border bg-status-optimal-light text-status-optimal'
            }`}
            title={aiSettings.isLocal ? 'Mode Lokal (Tanpa AI)' : 'AI Terhubung'}
          >
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">
              {aiSettings.isLocal ? 'Mode Lokal' : 'AI Aktif'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
