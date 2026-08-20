"use client";
import { API_BASE_URL } from "@/config/api";
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Receipt, 
  Trash2, 
  Loader2, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  Sparkles,
  Layers,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession, signIn } from 'next-auth/react';
import { CurrencySelect } from '@/components/CurrencySelect';

interface HistoryRecord {
  id: string;
  type: 'PAYSLIP' | 'INVOICE';
  entityName: string;
  totalAmount: number;
  createdAt: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PAYSLIP' | 'INVOICE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState<string>('$');

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn();
      return;
    }

    if (status === 'authenticated' && session?.user) {
      const token = (session.user as any).token;
      fetch(`${API_BASE_URL}/api/history`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setHistory(data);
          } else {
            setHistory([]);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('History fetch error:', err);
          setLoading(false);
        });
    }
  }, [status, session]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record from your history?')) return;
    
    setDeletingId(id);
    try {
      const token = (session?.user as any)?.token;
      const res = await fetch(`${API_BASE_URL}/api/history/${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (res.ok) {
        setHistory(prev => prev.filter(record => record.id !== id));
      } else {
        alert('Failed to delete record');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting');
    } finally {
      setDeletingId(null);
    }
  };

  // Metrics calculations
  const totalCount = history.length;
  const payslipCount = useMemo(() => history.filter(h => h.type === 'PAYSLIP').length, [history]);
  const invoiceCount = useMemo(() => history.filter(h => h.type === 'INVOICE').length, [history]);
  const totalValue = useMemo(() => {
    return history.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
  }, [history]);

  // Filtered documents
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchesTab = activeTab === 'ALL' || item.type === activeTab;
      const matchesSearch = item.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [history, activeTab, searchQuery]);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (val: number) => {
    return currencySymbol + ' ' + Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500">Loading your document workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        
        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                Workspace History
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Document Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track, inspect, and manage all your generated payslips and invoices.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <CurrencySelect value={currencySymbol} onChange={setCurrencySymbol} className="mr-2" />
            <Link href="/payslip/single">
              <Button size="sm" className="font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs">
                <Plus className="w-4 h-4 mr-1.5" />
                New Payslip
              </Button>
            </Link>
            <Link href="/invoice/single">
              <Button size="sm" className="font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs">
                <Plus className="w-4 h-4 mr-1.5" />
                New Invoice
              </Button>
            </Link>
          </div>
        </div>

        {/* ── METRICS OVERVIEW CARDS ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Card 1: Total Documents */}
          <div className="relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-blue-500/40 transition-all group overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-500" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Documents</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalCount}
            </div>
            <div className="text-xs text-slate-400 mt-1">Logged in your history</div>
          </div>

          {/* Card 2: Cumulative Total Value */}
          <div className="relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-emerald-500/40 transition-all group overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Volume</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {formatCurrency(totalValue)}
            </div>
            <div className="text-xs text-slate-400 mt-1">Across all records</div>
          </div>

          {/* Card 3: Payslips Count */}
          <div className="relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-blue-500/40 transition-all group overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payslips</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {payslipCount}
            </div>
            <div className="text-xs text-slate-400 mt-1">Salary slips issued</div>
          </div>

          {/* Card 4: Invoices Count */}
          <div className="relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-fuchsia-500/40 transition-all group overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoices</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-500 text-white flex items-center justify-center shadow-md shadow-fuchsia-500/20 group-hover:scale-105 transition-transform">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {invoiceCount}
            </div>
            <div className="text-xs text-slate-400 mt-1">Bills & tax invoices</div>
          </div>
        </div>

        {/* ── MAIN DOCUMENTS TABLE CARD ──────────────────────────────────────── */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          
          {/* Filter & Search Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Filter Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 w-full sm:w-auto">
              {(['ALL', 'PAYSLIP', 'INVOICE'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {tab === 'ALL' ? `All (${totalCount})` : tab === 'PAYSLIP' ? `Payslips (${payslipCount})` : `Invoices (${invoiceCount})`}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by client or name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Table / Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-xs font-medium text-slate-400">Loading document entries...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center p-16 sm:p-20">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto mb-4 text-2xl">
                📄
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                No documents found
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                {searchQuery
                  ? 'No documents matched your search query. Try clearing the filter.'
                  : 'You have not generated any documents yet. Get started by creating your first payslip or invoice.'}
              </p>
              {!searchQuery && (
                <div className="flex items-center justify-center gap-3">
                  <Link href="/payslip/single">
                    <Button size="sm" className="font-bold bg-blue-600 text-white rounded-xl">
                      Generate Payslip
                    </Button>
                  </Link>
                  <Link href="/invoice/single">
                    <Button size="sm" variant="outline" className="font-bold rounded-xl">
                      Create Invoice
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Document</th>
                    <th className="py-3.5 px-4">Recipient / Entity</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Date Issued</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                  {filteredHistory.map((item) => (
                    <tr 
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Document Type */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            item.type === 'PAYSLIP' 
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400' 
                              : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                          }`}>
                            {item.type === 'PAYSLIP' ? <FileText className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {item.type === 'PAYSLIP' ? 'Salary Payslip' : 'Tax Invoice'}
                            </span>
                            <span className={`inline-block text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                              item.type === 'PAYSLIP'
                                ? 'bg-blue-100/70 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                : 'bg-indigo-100/70 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                            }`}>
                              {item.type}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Recipient / Entity */}
                      <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {item.entityName}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(Number(item.totalAmount))}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {formatDate(item.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deletingId === item.id}
                          onClick={() => handleDelete(item.id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                          title="Delete record"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
