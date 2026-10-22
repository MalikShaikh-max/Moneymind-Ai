import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  TrendingDown,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Send,
  RefreshCw,
  Clock,
  ArrowUpRight,
  Sliders,
  DollarSign,
  PieChart,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const AIAnalystView: React.FC = () => {
  const {
    latestAIAnalysis,
    isAnalyzing,
    analysisError,
    runSpendingAnalysis,
    chatMessages,
    isChatLoading,
    sendAdvisorMessage,
    clearChat,
    formatMoney,
    metrics,
  } = useFinance();

  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    const msg = chatInput;
    setChatInput('');
    sendAdvisorMessage(msg);
  };

  const quickPrompts = [
    'Where is my biggest unnecessary money leak right now?',
    'Can I afford a $1,500 vacation next month without going into debt?',
    'How does my grocery and dining spending compare to healthy budgets?',
    'Give me 3 realistic cuts to boost my savings rate by 8%',
  ];

  return (
    <div className="space-y-6 pb-16 lg:pb-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BrainCircuit className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Gemini Financial Intelligence
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
            AI Spending Audit & Advisory
          </h1>
          <p className="text-xs text-slate-400">
            Real algorithmic evaluation of cash flows, hidden leaks, and strategic wealth building
          </p>
        </div>

        <div className="flex items-center gap-3">
          {latestAIAnalysis && (
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
              Audited {new Date(latestAIAnalysis.analyzedAt).toLocaleDateString()}
            </span>
          )}
          <button
            onClick={() => runSpendingAnalysis()}
            disabled={isAnalyzing}
            className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing Transactions...' : 'Run New Spending Audit'}</span>
          </button>
        </div>
      </div>

      {analysisError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">AI Analysis Encountered an Error</p>
            <p className="text-rose-300/80">{analysisError}</p>
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {latestAIAnalysis ? (
        <div className="space-y-6">
          {/* Top Score & Summary Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Meter Card */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between items-center text-center relative overflow-hidden">
              <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold uppercase tracking-wider">Health Score</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    latestAIAnalysis.financialHealthScore >= 75
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : latestAIAnalysis.financialHealthScore >= 60
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {latestAIAnalysis.healthGrade}
                </span>
              </div>

              {/* Circular Gauge */}
              <div className="relative my-4 flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="#1e293b"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke={
                      latestAIAnalysis.financialHealthScore >= 75
                        ? '#10b981'
                        : latestAIAnalysis.financialHealthScore >= 60
                        ? '#f59e0b'
                        : '#f43f5e'
                    }
                    strokeWidth="12"
                    strokeDasharray={427}
                    strokeDashoffset={427 - (latestAIAnalysis.financialHealthScore / 100) * 427}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-extrabold font-mono text-slate-100">
                    {latestAIAnalysis.financialHealthScore}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mt-0.5">
                    out of 100
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-400 space-y-1 w-full pt-2 border-t border-slate-800">
                <div className="flex justify-between">
                  <span>Emergency Cushion:</span>
                  <span className="font-mono font-bold text-slate-200">
                    ~{latestAIAnalysis.emergencyBufferMonths} months
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Savings Velocity:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {metrics.savingsRate}% monthly
                  </span>
                </div>
              </div>
            </div>

            {/* AI Summary and Highlights */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Executive Audit Summary
                </div>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                  {latestAIAnalysis.summary}
                </p>
              </div>

              {/* Positive Highlights Chips */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Positive Highlights Identified
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {latestAIAnalysis.positiveHighlights.map((hl, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2 text-xs text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 50/30/20 Rule Breakdown Bar */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <PieChart className="w-3.5 h-3.5 text-cyan-400" />
                    50/30/20 Rule Allocation
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Target: 50% Needs / 30% Wants / 20% Savings
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-800 flex overflow-hidden">
                  <div
                    style={{ width: `${latestAIAnalysis.budgetRuleBreakdown.needsPct}%` }}
                    className="bg-blue-500 h-full"
                    title={`Needs: ${latestAIAnalysis.budgetRuleBreakdown.needsPct}%`}
                  ></div>
                  <div
                    style={{ width: `${latestAIAnalysis.budgetRuleBreakdown.wantsPct}%` }}
                    className="bg-amber-500 h-full"
                    title={`Wants: ${latestAIAnalysis.budgetRuleBreakdown.wantsPct}%`}
                  ></div>
                  <div
                    style={{ width: `${latestAIAnalysis.budgetRuleBreakdown.savingsPct}%` }}
                    className="bg-emerald-500 h-full"
                    title={`Savings: ${latestAIAnalysis.budgetRuleBreakdown.savingsPct}%`}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                  <span className="text-blue-400">
                    Needs: {latestAIAnalysis.budgetRuleBreakdown.needsPct}%
                  </span>
                  <span className="text-amber-400">
                    Wants: {latestAIAnalysis.budgetRuleBreakdown.wantsPct}%
                  </span>
                  <span className="text-emerald-400">
                    Savings: {latestAIAnalysis.budgetRuleBreakdown.savingsPct}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  {latestAIAnalysis.budgetRuleBreakdown.assessment}
                </p>
              </div>
            </div>
          </div>

          {/* Spending Leaks & Unnecessary Expenses Panel */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                  Detected Spending Leaks & Recurring Drains
                </h3>
                <p className="text-xs text-slate-400">
                  Recurring micro-expenses and lifestyle inflation caught in your transaction history
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestAIAnalysis.spendingLeaks.map((leak, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-rose-500/20 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 font-semibold text-[10px]">
                        {leak.category}
                      </span>
                      <span className="font-mono font-bold text-rose-400">
                        -{formatMoney(leak.estimatedMonthlyLoss)}/mo
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-200 mb-1">{leak.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{leak.detectedLeak}</p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-800/80 text-xs">
                    <div className="text-[10px] uppercase font-bold text-emerald-400 mb-0.5 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Actionable Remedy
                    </div>
                    <p className="text-slate-300 text-[11px] leading-snug">{leak.actionableFix}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic High-Impact Savings Opportunities */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-emerald-400" />
                Strategic Savings Opportunities
              </h3>
              <p className="text-xs text-slate-400">
                Data-driven optimizations to unlock surplus capital for your financial goals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {latestAIAnalysis.savingsOpportunities.map((opp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-500/20 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          opp.priority === 'HIGH'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : opp.priority === 'MEDIUM'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {opp.priority} PRIORITY
                      </span>
                      <span className="text-xs font-mono font-extrabold text-emerald-400">
                        +{formatMoney(opp.potentialAnnualSavings)}/yr
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-200 mb-1">{opp.strategy}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{opp.description}</p>
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
                    Est. +{formatMoney(opp.potentialAnnualSavings / 12)} added to monthly cash flow
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Not yet analyzed call to action */
        <div className="glass-panel p-8 sm:p-12 rounded-3xl text-center space-y-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
            Generate Your First Financial Intelligence Audit
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            MoneyMind AI will inspect your transactions, measure cash burn rate, detect subscription traps, and produce a personalized 50/30/20 health assessment.
          </p>
          <button
            onClick={() => runSpendingAnalysis()}
            disabled={isAnalyzing}
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing Transactions...' : 'Start Audit with Gemini'}</span>
          </button>
        </div>
      )}

      {/* Interactive AI Financial Copilot Chat Section */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-bold shadow-sm">
              <BrainCircuit className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                Interactive Wealth Advisor
              </h3>
              <p className="text-[11px] text-slate-400">
                Ask specific questions about your purchasing power, bills, and budget adjustments
              </p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Clear
          </button>
        </div>

        {/* Message Feed */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[420px] overflow-y-auto bg-slate-950/30">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs font-bold border border-emerald-500/30">
                  AI
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-slate-950 font-medium shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`text-[9px] mt-1 font-mono ${
                    msg.role === 'user' ? 'text-slate-800' : 'text-slate-500'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isChatLoading && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs font-bold animate-pulse">
                AI
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Evaluating financial impact on your cash flow...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 font-mono">
            Suggested:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => sendAdvisorMessage(p)}
              disabled={isChatLoading}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-300 text-[11px] whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask your financial copilot anything (e.g., 'Can I afford to buy a $900 bike this week?')..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isChatLoading}
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || isChatLoading}
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
      </div>
    </div>
  );
};
