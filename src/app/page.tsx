'use client';

import React, { useEffect, useState } from 'react';
import { useBusinessStore } from '@/store/useBusinessStore';
import { Navbar } from '@/components/Navbar';
import { Wizard } from '@/components/Wizard';
import { TableView } from '@/components/TableView';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { ScenariosModal } from '@/components/ScenariosModal';
import { ImportExportModal } from '@/components/ImportExportModal';
import { AISettingsModal } from '@/components/AISettingsModal';
import {
  Compass,
  Table as TableIcon,
  Sparkles,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export default function Home() {
  const {
    activeTab,
    setActiveTab,
    loadFromShareableHash,
    solution,
  } = useBusinessStore();

  const [showImportExport, setShowImportExport] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);
  const [showAI, setShowAI] = useState(false);

  // Check URL hash for shared model state on load (PRD 5.4)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const match = window.location.hash.match(/#model=([^&]+)/);
      if (match && match[1]) {
        const loaded = loadFromShareableHash(match[1]);
        if (loaded) {
          setActiveTab('results');
        }
      }
    }
  }, [loadFromShareableHash, setActiveTab]);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink pb-20 md:pb-6">
      {/* Top Navbar */}
      <Navbar
        onOpenImportExport={() => setShowImportExport(true)}
        onOpenScenarios={() => setShowScenarios(true)}
        onOpenAI={() => setShowAI(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-4">
        {activeTab === 'wizard' && <Wizard />}
        {activeTab === 'table' && <TableView />}
        {activeTab === 'results' && (
          <ResultsDashboard onOpenExport={() => setShowImportExport(true)} />
        )}
      </main>

      {/* Mobile Sticky Bottom Tab Bar (PRD 5.5 & 8: Aksesibilitas ponsel 360px) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md md:hidden">
        <div className="grid grid-cols-3 h-16">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`flex flex-col items-center justify-center gap-1 min-touch-target ${
              activeTab === 'wizard' ? 'text-accent font-bold' : 'text-ink-muted'
            }`}
          >
            <Compass className="h-5 w-5" />
            <span className="text-[10px]">Panduan</span>
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`flex flex-col items-center justify-center gap-1 min-touch-target ${
              activeTab === 'table' ? 'text-accent font-bold' : 'text-ink-muted'
            }`}
          >
            <TableIcon className="h-5 w-5" />
            <span className="text-[10px]">Tabel</span>
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`flex flex-col items-center justify-center gap-1 relative min-touch-target ${
              activeTab === 'results' ? 'text-status-optimal font-bold' : 'text-ink-muted'
            }`}
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-[10px]">Hasil</span>
            {solution.status === 'OPTIMAL' && (
              <span className="absolute top-2.5 right-6 h-2 w-2 rounded-full bg-status-optimal" />
            )}
          </button>
        </div>
      </div>

      {/* Modals */}
      <ImportExportModal
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
      />
      <ScenariosModal
        isOpen={showScenarios}
        onClose={() => setShowScenarios(false)}
      />
      <AISettingsModal
        isOpen={showAI}
        onClose={() => setShowAI(false)}
      />

      {/* Subtle Footer with Privacy Note */}
      <footer className="w-full border-t border-border bg-surface py-4 text-center text-xs text-ink-muted">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-status-optimal" />
          <span>Privasi Terjaga: 100% perhitungan optimasi berjalan langsung di peramban Anda.</span>
        </div>
      </footer>
    </div>
  );
}
