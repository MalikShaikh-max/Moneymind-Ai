import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, Sparkles, Download, ArrowRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CategoryType, PaymentMethod, TransactionType } from '../../types/finance';
import { EXPENSE_CATEGORIES } from '../../data/categories';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedRow {
  date: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: CategoryType;
  paymentMethod: PaymentMethod;
  recurring: boolean;
  notes?: string;
  isAiSuggested?: boolean;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose }) => {
  const { importTransactions, currency } = useFinance();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isAiCategorizing, setIsAiCategorizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  // Simple CSV parser supporting commas and quotes
  const parseCsvContent = (content: string) => {
    try {
      const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        setError('CSV must contain a header row and at least one data row.');
        return;
      }

      const headers = lines[0].toLowerCase().split(',').map((h) => h.replace(/["']/g, '').trim());

      // Find column indices
      const dateIdx = headers.findIndex((h) => h.includes('date'));
      const titleIdx = headers.findIndex((h) => h.includes('desc') || h.includes('title') || h.includes('payee') || h.includes('merchant') || h.includes('name'));
      const amountIdx = headers.findIndex((h) => h.includes('amount') || h.includes('price') || h.includes('total') || h.includes('cost'));
      const catIdx = headers.findIndex((h) => h.includes('category') || h.includes('type'));
      const typeIdx = headers.findIndex((h) => h === 'type' || h.includes('direction'));

      if (titleIdx === -1 || amountIdx === -1) {
        setError('Could not detect Description and Amount columns. Please check headers.');
        return;
      }

      const rows: ParsedRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        // regex match for CSV values handling quotes
        const match = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        const cols = lines[i].split(',').map((c) => c.replace(/^["']|["']$/g, '').trim());

        const rawTitle = cols[titleIdx] || `Transaction #${i}`;
        const rawAmtStr = cols[amountIdx]?.replace(/[$\s,]/g, '') || '0';
        let rawAmt = parseFloat(rawAmtStr);

        let txType: TransactionType = 'expense';
        if (typeIdx !== -1 && cols[typeIdx]) {
          const tVal = cols[typeIdx].toLowerCase();
          if (tVal.includes('inc') || tVal.includes('credit') || tVal.includes('deposit')) {
            txType = 'income';
          }
        } else if (rawAmt < 0) {
          txType = 'expense';
          rawAmt = Math.abs(rawAmt);
        } else if (rawAmt > 0 && (rawTitle.toLowerCase().includes('payroll') || rawTitle.toLowerCase().includes('salary') || rawTitle.toLowerCase().includes('deposit'))) {
          txType = 'income';
        }

        let cat: CategoryType = 'Other';
        if (catIdx !== -1 && cols[catIdx]) {
          const matched = EXPENSE_CATEGORIES.find((c) => c.toLowerCase() === cols[catIdx].toLowerCase());
          if (matched) cat = matched;
        }

        // Try date parsing or fallback to today
        let rowDate = new Date().toISOString().split('T')[0];
        if (dateIdx !== -1 && cols[dateIdx]) {
          const parsedD = new Date(cols[dateIdx]);
          if (!isNaN(parsedD.getTime())) {
            rowDate = parsedD.toISOString().split('T')[0];
          }
        }

        if (!isNaN(rawAmt) && rawAmt > 0) {
          rows.push({
            date: rowDate,
            title: rawTitle,
            amount: Math.abs(rawAmt),
            type: txType,
            category: cat,
            paymentMethod: 'bank_transfer',
            recurring: false,
            notes: 'Imported via CSV',
          });
        }
      }

      if (rows.length === 0) {
        setError('No valid transactions found in file.');
        return;
      }

      setParsedRows(rows);
      setError(null);
    } catch (e: any) {
      setError(`Failed to parse CSV: ${e.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text);
      parseCsvContent(text);
    };
    reader.readAsText(file);
  };

  const handleAiAutoCategorize = async () => {
    if (parsedRows.length === 0) return;
    setIsAiCategorizing(true);
    setError(null);

    try {
      const itemsToCategorize = parsedRows.slice(0, 40).map((r) => ({
        title: r.title,
        amount: r.amount,
      }));

      const res = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToCategorize }),
      });

      if (!res.ok) {
        throw new Error('AI categorization service was unable to process items.');
      }

      const data = await res.json();
      if (Array.isArray(data.categorized)) {
        const catMap = new Map<string, { category: CategoryType; type: TransactionType }>();
        data.categorized.forEach((c: any) => {
          catMap.set(c.title.toLowerCase(), {
            category: (c.category as CategoryType) || 'Other',
            type: c.type === 'income' ? 'income' : 'expense',
          });
        });

        setParsedRows((prev) =>
          prev.map((row) => {
            const match = catMap.get(row.title.toLowerCase());
            if (match) {
              return {
                ...row,
                category: match.category,
                type: match.type,
                isAiSuggested: true,
              };
            }
            return row;
          })
        );
      }
    } catch (err: any) {
      console.error(err);
      setError('AI categorization timed out or failed. You can still import or categorize manually.');
    } finally {
      setIsAiCategorizing(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;
    const count = importTransactions(parsedRows);
    setSuccessCount(count);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const downloadSampleTemplate = () => {
    const sample = `Date,Description,Amount,Category,Type\n2026-10-18,Whole Foods Market,94.20,Groceries,expense\n2026-10-19,Uber Ride Downtown,28.50,Transportation,expense\n2026-10-20,Consulting Client Payout,1200.00,Freelance,income\n2026-10-21,Blue Bottle Coffee,6.50,Food & Dining,expense\n2026-10-22,Netflix Subscription,19.99,Entertainment,expense`;
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'moneymind_sample_expenses.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Import Transactions CSV</h3>
              <p className="text-xs text-slate-400">
                Upload your bank statement or card export
              </p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successCount !== null ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-100">
                Successfully Imported {successCount} Transactions!
              </h4>
              <p className="text-xs text-slate-400">
                Your dashboard metrics and cash flow have been updated.
              </p>
            </div>
          ) : parsedRows.length === 0 ? (
            <>
              {/* Drag Drop / File Input Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-950/40 hover:bg-slate-950/70 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
              >
                <div className="p-3 rounded-full bg-slate-800 group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-400 transition-colors mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  Click to select CSV file from computer
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports Chase, Bank of America, Apple Card, or standard CSVs
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Sample Template & Paste Option */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={downloadSampleTemplate}
                  className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download sample CSV template
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {/* Stats Bar & AI Categorize Action */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">
                    {parsedRows.length} transactions ready
                  </span>
                  {fileName && (
                    <span className="text-slate-500 font-mono truncate max-w-[140px]">
                      ({fileName})
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAiAutoCategorize}
                  disabled={isAiCategorizing}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAiCategorizing ? 'animate-spin' : ''}`} />
                  {isAiCategorizing ? 'AI Auto-Classifying...' : 'Auto-Categorize with Gemini'}
                </button>
              </div>

              {/* Preview Table */}
              <div className="max-h-[300px] overflow-y-auto border border-slate-800 rounded-xl bg-slate-950/80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {parsedRows.slice(0, 25).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        <td className="py-2 px-3 text-slate-400 text-[11px]">{row.date}</td>
                        <td className="py-2 px-3 text-slate-200 font-sans truncate max-w-[180px]">
                          {row.title}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-medium ${
                              row.isAiSuggested
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {row.isAiSuggested && <Sparkles className="w-2.5 h-2.5 text-cyan-400" />}
                            {row.category}
                          </span>
                        </td>
                        <td
                          className={`py-2 px-3 text-right font-semibold ${
                            row.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
                          }`}
                        >
                          {row.type === 'income' ? '+' : '-'}
                          {currency}
                          {row.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {parsedRows.length > 25 && (
                <p className="text-[11px] text-slate-500 text-center font-mono">
                  Showing first 25 of {parsedRows.length} parsed items
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {successCount === null && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
            <button
              type="button"
              onClick={() => {
                setParsedRows([]);
                setFileName(null);
                setError(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Reset
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={parsedRows.length === 0}
                onClick={handleConfirmImport}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center gap-1.5"
              >
                Import {parsedRows.length} Items
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
