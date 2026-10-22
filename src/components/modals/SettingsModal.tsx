import React, { useRef, useState } from 'react';
import { X, RefreshCw, Trash2, Download, Upload, Check, DollarSign, Database, ShieldCheck } from 'lucide-react';
import { CurrencySymbol, useFinance } from '../../context/FinanceContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    currency,
    setCurrency,
    resetToDemoData,
    clearAllData,
    transactions,
    budgets,
    goals,
    importTransactions,
  } = useFinance();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportJson = () => {
    const backup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      currency,
      transactions,
      budgets,
      goals,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneymind_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.transactions && Array.isArray(data.transactions)) {
          importTransactions(data.transactions);
          setImportSuccess(`Successfully imported ${data.transactions.length} records!`);
          setTimeout(() => setImportSuccess(null), 3000);
        }
      } catch {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  const currencies: { symbol: CurrencySymbol; label: string }[] = [
    { symbol: '$', label: 'USD ($) - US Dollar' },
    { symbol: '€', label: 'EUR (€) - Euro' },
    { symbol: '£', label: 'GBP (£) - British Pound' },
    { symbol: '¥', label: 'JPY (¥) - Japanese Yen' },
    { symbol: 'C$', label: 'CAD (C$) - Canadian Dollar' },
    { symbol: 'A$', label: 'AUD (A$) - Australian Dollar' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-800 text-slate-200 rounded-xl border border-slate-700">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Preferences & Data Management</h3>
              <p className="text-xs text-slate-400">Control currency, data backups, and local storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {importSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{importSuccess}</span>
            </div>
          )}

          {/* Currency Preference */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-2 uppercase tracking-wider">
              Primary Currency
            </label>
            <div className="grid grid-cols-2 gap-2">
              {currencies.map((c) => (
                <button
                  key={c.symbol}
                  onClick={() => setCurrency(c.symbol)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2 ${
                    currency === c.symbol
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center font-mono font-bold text-slate-200 text-xs">
                    {c.symbol}
                  </span>
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Backup & Portability
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportJson}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-2.5 hover:bg-slate-800/50 transition-colors"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Export JSON Backup</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-2.5 hover:bg-slate-800/50 transition-colors"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Restore from JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
            </div>
          </div>

          {/* Storage & Privacy Note */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-slate-200 block">
                Local-First & Client Confidentiality
              </span>
              <p className="text-[11px] leading-relaxed">
                Your financial records are stored securely in your browser's persistent storage. Gemini AI spending analyses are processed via secure server-side proxy without leaking API keys.
              </p>
            </div>
          </div>

          {/* Reset / Danger Zone */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <label className="block text-xs font-semibold text-rose-400 uppercase tracking-wider">
              Data Reset & Demo Environment
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              {resetConfirm ? (
                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={() => {
                      resetToDemoData();
                      setResetConfirm(false);
                      onClose();
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                  >
                    Confirm Reset to Demo
                  </button>
                  <button
                    onClick={() => setResetConfirm(false)}
                    className="py-2 px-3 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setResetConfirm(true)}
                  className="flex-1 p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset to Demo Records
                </button>
              )}

              {clearConfirm ? (
                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={() => {
                      clearAllData();
                      setClearConfirm(false);
                      onClose();
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs"
                  >
                    Confirm Wipe Everything
                  </button>
                  <button
                    onClick={() => setClearConfirm(false)}
                    className="py-2 px-3 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setClearConfirm(true)}
                  className="flex-1 p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Wipe All Records
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
