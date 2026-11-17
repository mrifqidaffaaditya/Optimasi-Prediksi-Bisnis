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
} from 'lucide-react';

export default function HalamanUtama() {
  const {
    tabAktif,
    aturTabAktif,
    muatDariKodeBerbagi,
    solusiBisnis,
  } = useBusinessStore();

  const [tampilkanImporEkspor, setTampilkanImporEkspor] = useState(false);
  const [tampilkanSkenario, setTampilkanSkenario] = useState(false);
  const [tampilkanAI, setTampilkanAI] = useState(false);

  // Periksa hash URL untuk memuat model bersama saat tautan dibuka (PRD 5.4)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const kecocokan = window.location.hash.match(/#model=([^&]+)/);
      if (kecocokan && kecocokan[1]) {
        const berhasilDimuat = muatDariKodeBerbagi(kecocokan[1]);
        if (berhasilDimuat) {
          aturTabAktif('results');
        }
      }
    }
  }, [muatDariKodeBerbagi, aturTabAktif]);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink pb-20 md:pb-6">
      {/* Bilah Navigasi Atas */}
      <Navbar
        onOpenImportExport={() => setTampilkanImporEkspor(true)}
        onOpenScenarios={() => setTampilkanSkenario(true)}
        onOpenAI={() => setTampilkanAI(true)}
      />

      {/* Area Konten Utama */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-4">
        {tabAktif === 'wizard' && <Wizard />}
        {tabAktif === 'table' && <TableView />}
        {tabAktif === 'results' && (
          <ResultsDashboard onOpenExport={() => setTampilkanImporEkspor(true)} />
        )}
      </main>

      {/* Bilah Tab Navigasi Bawah Khusus Ponsel (PRD 5.5 & 8: Layar 360px) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md md:hidden">
        <div className="grid grid-cols-3 h-16">
          <button
            onClick={() => aturTabAktif('wizard')}
            className={`flex flex-col items-center justify-center gap-1 min-touch-target ${
              tabAktif === 'wizard' ? 'text-accent font-bold' : 'text-ink-muted'
            }`}
          >
            <Compass className="h-5 w-5" />
            <span className="text-[10px]">Panduan</span>
          </button>

          <button
            onClick={() => aturTabAktif('table')}
            className={`flex flex-col items-center justify-center gap-1 min-touch-target ${
              tabAktif === 'table' ? 'text-accent font-bold' : 'text-ink-muted'
            }`}
          >
            <TableIcon className="h-5 w-5" />
            <span className="text-[10px]">Tabel</span>
          </button>

          <button
            onClick={() => aturTabAktif('results')}
            className={`flex flex-col items-center justify-center gap-1 relative min-touch-target ${
              tabAktif === 'results' ? 'text-status-optimal font-bold' : 'text-ink-muted'
            }`}
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-[10px]">Hasil</span>
            {solusiBisnis.status === 'OPTIMAL' && (
              <span className="absolute top-2.5 right-6 h-2 w-2 rounded-full bg-status-optimal" />
            )}
          </button>
        </div>
      </div>

      {/* Modal Dialog Impor, Ekspor, dan Berbagi */}
      <ImportExportModal
        isOpen={tampilkanImporEkspor}
        onClose={() => setTampilkanImporEkspor(false)}
      />

      {/* Modal Dialog Skenario */}
      <ScenariosModal
        isOpen={tampilkanSkenario}
        onClose={() => setTampilkanSkenario(false)}
      />

      {/* Modal Dialog Asisten AI */}
      <AISettingsModal
        isOpen={tampilkanAI}
        onClose={() => setTampilkanAI(false)}
      />
    </div>
  );
}
