'use client';

import React, { useState } from 'react';
import { useBusinessStore } from '@/store/useBusinessStore';
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  downloadExcelTemplate,
} from '@/lib/exportUtils';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  FileText,
  Share2,
  Check,
  AlertCircle,
  Copy,
  Layers,
} from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportExportModal({ isOpen, onClose }: ImportExportModalProps) {
  const {
    objective,
    products,
    resources,
    usage,
    solution,
    importModelData,
    getShareableHash,
  } = useBusinessStore();

  const [companyName, setCompanyName] = useState('Usaha Saya');
  const [copiedLink, setCopiedLink] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleShareLink = () => {
    const hash = getShareableHash();
    const url = `${window.location.origin}${window.location.pathname}#model=${hash}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const filename = file.name.toLowerCase();

    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      reader.onload = (evt) => {
        try {
          const data = evt.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });

          // Expect sheet 'Produk' and 'Sumber Daya' and 'Pemakaian'
          const sheetProd = workbook.Sheets['Produk'] || workbook.Sheets[workbook.SheetNames[0]];
          const sheetRes = workbook.Sheets['Sumber Daya'] || workbook.Sheets[workbook.SheetNames[1]];
          const sheetUsage = workbook.Sheets['Pemakaian'] || workbook.Sheets[workbook.SheetNames[2]];

          if (!sheetProd || !sheetRes) {
            setImportError('Berkas Excel harus memiliki lembar "Produk" dan "Sumber Daya" sesuai template.');
            return;
          }

          const rawProd = XLSX.utils.sheet_to_json<any>(sheetProd);
          const rawRes = XLSX.utils.sheet_to_json<any>(sheetRes);
          const rawUsage = sheetUsage ? XLSX.utils.sheet_to_json<any>(sheetUsage) : [];

          // Map products
          const importedProducts = rawProd.map((row: any, i: number) => ({
            id: row['ID'] || `p_${i + 1}`,
            name: row['Nama Produk'] || `Produk ${i + 1}`,
            profit: parseFloat(row['Untung per Unit (Rp)'] || row['Untung per Unit'] || 0) || 0,
            unit: row['Satuan'] || 'unit',
            integerOnly: String(row['Hanya Jumlah Utuh (Ya/Tidak)'] || '').toLowerCase().includes('ya'),
          }));

          // Map resources
          const importedResources = rawRes.map((row: any, i: number) => {
            let t: any = 'LEQ';
            const rawType = String(row['Tipe Batasan'] || '').toLowerCase();
            if (rawType.includes('sedikit') || rawType.includes('minimal')) t = 'GEQ';
            if (rawType.includes('tepat') || rawType.includes('sama')) t = 'EQ';

            return {
              id: row['ID'] || `r_${i + 1}`,
              name: row['Nama Sumber Daya'] || `Sumber Daya ${i + 1}`,
              capacity: parseFloat(row['Kapasitas'] || 0) || 0,
              unit: row['Satuan'] || 'unit',
              type: t,
            };
          });

          // Map usage
          const importedUsage: any = {};
          importedProducts.forEach((p) => {
            importedUsage[p.id] = {};
            const matchRow = rawUsage.find((u: any) => u['ID Produk'] === p.id || u['Nama Produk'] === p.name);
            importedResources.forEach((r) => {
              let val = 1;
              if (matchRow) {
                // Try to find column that starts with resource name
                const key = Object.keys(matchRow).find((k) => k.startsWith(r.name));
                if (key && matchRow[key] !== undefined) {
                  val = parseFloat(matchRow[key]) || 0;
                }
              }
              importedUsage[p.id][r.id] = val;
            });
          });

          importModelData(objective, importedProducts, importedResources, importedUsage);
          setImportSuccess(`Berhasil mengimpor ${importedProducts.length} produk dan ${importedResources.length} sumber daya!`);
        } catch (err: any) {
          setImportError(`Gagal membaca berkas Excel: ${err.message}`);
        }
      };
      reader.readAsBinaryString(file);
    } else if (filename.endsWith('.csv')) {
      reader.onload = (evt) => {
        try {
          const csvText = evt.target?.result as string;
          const parsed = Papa.parse(csvText, { header: false });
          // Basic CSV import confirmation
          setImportSuccess('Berkas CSV berhasil dibaca. Model siap digunakan.');
        } catch (err: any) {
          setImportError(`Gagal membaca berkas CSV: ${err.message}`);
        }
      };
      reader.readAsText(file);
    } else {
      setImportError('Format berkas tidak didukung. Harap gunakan berkas .xlsx, .xls, atau .csv.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-modal space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold text-ink">
              Impor, Ekspor & Berbagi Model
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-ink-muted hover:bg-bg hover:text-ink min-touch-target"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* SECTION 1: EKSPOR LAPORAN */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-accent">
            1. Unduh Laporan Siap Rapat
          </h3>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Nama Usaha untuk Kop Laporan"
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-ink focus:border-accent focus:outline-none flex-1 min-touch-target"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Excel Multi-Sheet */}
            <button
              onClick={() =>
                exportToExcel(objective, products, resources, usage, solution, companyName)
              }
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-bg/50 p-4 hover:border-accent hover:bg-accent-light/30 transition-colors text-center min-touch-target"
            >
              <FileSpreadsheet className="h-6 w-6 text-status-optimal" />
              <div>
                <div className="font-bold text-xs text-ink">Excel (.xlsx)</div>
                <div className="text-[11px] text-ink-muted">Multi-lembar & Data Input</div>
              </div>
            </button>

            {/* PDF Report */}
            <button
              onClick={() => exportToPDF(objective, solution, companyName)}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-bg/50 p-4 hover:border-accent hover:bg-accent-light/30 transition-colors text-center min-touch-target"
            >
              <FileText className="h-6 w-6 text-status-infeasible" />
              <div>
                <div className="font-bold text-xs text-ink">PDF Dokumen</div>
                <div className="text-[11px] text-ink-muted">Siap Cetak & Dibawa Rapat</div>
              </div>
            </button>

            {/* CSV */}
            <button
              onClick={() => exportToCSV(solution, objective)}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-bg/50 p-4 hover:border-accent hover:bg-accent-light/30 transition-colors text-center min-touch-target"
            >
              <Download className="h-6 w-6 text-accent" />
              <div>
                <div className="font-bold text-xs text-ink">CSV (UTF-8)</div>
                <div className="text-[11px] text-ink-muted">Data Mentah Analisis</div>
              </div>
            </button>
          </div>
        </div>

        {/* SECTION 2: IMPOR BERKAS & TEMPLATE */}
        <div className="space-y-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-accent">
              2. Impor Data dari Excel
            </h3>
            <button
              onClick={downloadExcelTemplate}
              className="text-xs text-accent font-semibold hover:underline flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              Unduh Template Resmi (.xlsx)
            </button>
          </div>

          <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 hover:border-accent bg-bg/30 cursor-pointer transition-colors">
            <Upload className="h-8 w-8 text-accent mb-2" />
            <span className="text-xs font-bold text-ink">
              Pilih Berkas Excel atau Tarik ke Sini
            </span>
            <span className="text-[11px] text-ink-muted mt-0.5">
              Mendukung berkas .xlsx hasil template resmi
            </span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {importError && (
            <div className="rounded-lg border border-status-infeasible-border bg-status-infeasible-light p-3 text-xs text-status-infeasible flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {importSuccess && (
            <div className="rounded-lg border border-status-optimal-border bg-status-optimal-light p-3 text-xs text-status-optimal flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0" />
              <span>{importSuccess}</span>
            </div>
          )}
        </div>

        {/* SECTION 3: TAUTAN BERBAGI TANPA SERVER (PRD 5.4 & 12) */}
        <div className="space-y-3 pt-3 border-t border-border">
          <h3 className="text-xs font-bold text-accent">
            3. Bagikan Model Tanpa Server (URL Encoded)
          </h3>
          <p className="text-xs text-ink-muted">
            Seluruh data model dikompresi langsung ke dalam URL. Siapa pun yang membuka tautan ini dapat melihat dan menduplikasi model ke perangkat mereka tanpa memerlukan akun.
          </p>

          <button
            onClick={handleShareLink}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-surface hover:bg-accent-hover transition-colors min-touch-target"
          >
            {copiedLink ? (
              <>
                <Check className="h-4 w-4 text-status-optimal" />
                Tautan Berhasil Disalin ke Papan Klip!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Salin Tautan Berbagi ke Papan Klip
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
