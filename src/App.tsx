import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { TransactionsView } from './components/views/TransactionsView';
import { AIAnalystView } from './components/views/AIAnalystView';
import { BudgetsView } from './components/views/BudgetsView';
import { CashFlowForecastView } from './components/views/CashFlowForecastView';
import { GoalsView } from './components/views/GoalsView';
import { ReportsView } from './components/views/ReportsView';
import { TransactionModal } from './components/modals/TransactionModal';
import { CsvImportModal } from './components/modals/CsvImportModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { Transaction } from './types/finance';

function MainAppContent() {
  const { runSpendingAnalysis } = useFinance();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Global Modals State
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleEditTransaction = (tx: Transaction) => {
    setTransactionToEdit(tx);
    setIsAddTxModalOpen(true);
  };

  const handleRunAiAudit = async () => {
    setActiveTab('analyst');
    await runSpendingAnalysis();
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Top Navigation */}
      <Navbar
        onOpenAddTransaction={() => {
          setTransactionToEdit(null);
          setIsAddTxModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onRunAiAnalysis={handleRunAiAudit}
      />

      {/* Main Layout Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Sidebar for Desktop & Mobile Dock */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              setActiveTab={setActiveTab}
              onOpenAddTransaction={() => {
                setTransactionToEdit(null);
                setIsAddTxModalOpen(true);
              }}
              onOpenCsvImport={() => setIsCsvModalOpen(true)}
              onEditTransaction={handleEditTransaction}
              onRunAiAnalysis={handleRunAiAudit}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              onOpenAddTransaction={() => {
                setTransactionToEdit(null);
                setIsAddTxModalOpen(true);
              }}
              onOpenCsvImport={() => setIsCsvModalOpen(true)}
              onEditTransaction={handleEditTransaction}
            />
          )}

          {activeTab === 'analyst' && <AIAnalystView />}

          {activeTab === 'budgets' && <BudgetsView />}

          {activeTab === 'forecast' && <CashFlowForecastView />}

          {activeTab === 'goals' && <GoalsView />}

          {activeTab === 'reports' && <ReportsView />}
        </main>
      </div>

      {/* Global Modals */}
      <TransactionModal
        isOpen={isAddTxModalOpen}
        onClose={() => {
          setIsAddTxModalOpen(false);
          setTransactionToEdit(null);
        }}
        transactionToEdit={transactionToEdit}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <MainAppContent />
    </FinanceProvider>
  );
}
