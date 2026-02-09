
import React, { useMemo } from 'react';
import { Budget, Specialty, Company } from '../types.ts';
import { 
  FileText, 
  Plus, 
  Wallet, 
  TrendingUp, 
  Hourglass, 
  BadgeEuro, 
  ArrowUpRight,
  Briefcase,
  Zap,
  Target,
  ArrowRight,
  Sparkles,
  Hammer,
  Eye
} from 'lucide-react';
import { COUNTRY_CONFIGS, SPECIALTY_COLORS } from '../constants.tsx';

interface DashboardProps {
  budgets: Budget[];
  onViewBudget: (budget: Budget, tab?: 'summary' | 'info' | 'payments' | 'expenses') => void;
  onNewBudget: () => void;
  company: Company;
}

const Dashboard: React.FC<DashboardProps> = ({ budgets, onViewBudget, onNewBudget, company }) => {
  const config = COUNTRY_CONFIGS[company.country];
  const t = config.translations;

  const stats = useMemo(() => {
    const formatCurrency = (val: number) => val.toLocaleString(config.locale, { style: 'currency', currency: config.currency });
    const getBudgetValue = (b: Budget) => {
      const subtotal = b.items.reduce((acc, item) => acc + (item.quantity * item.pricePerUnit), 0);
      const isVatEnabled = b.isVatEnabled !== false;
      return subtotal * (1 + (isVatEnabled ? b.taxRate : 0) / 100);
    };
    const totalPaid = budgets.reduce((sum, b) => sum + (b.payments?.reduce((pSum, p) => pSum + p.amount, 0) || 0), 0);
    const approvedBudgets = budgets.filter(b => b.status === 'Approved');
    const totalApproved = approvedBudgets.reduce((sum, b) => sum + getBudgetValue(b), 0);
    const pendingBudgets = budgets.filter(b => b.status === 'Draft');
    const totalPending = pendingBudgets.reduce((sum, b) => sum + getBudgetValue(b), 0);
    return { totalPaid, totalApproved, totalPending, formatCurrency, getBudgetValue };
  }, [budgets, config]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Wallet, label: t.dashboard.totalPaid, val: stats.totalPaid, color: 'indigo', gradient: 'from-indigo-600 to-indigo-700', bg: 'bg-indigo-50' },
          { icon: TrendingUp, label: t.dashboard.approvedVal, val: stats.totalApproved, color: 'emerald', gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50' },
          { icon: Hourglass, label: t.dashboard.pendingVal, val: stats.totalPending, color: 'amber', gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50' },
          { icon: BadgeEuro, label: t.balance, val: stats.totalApproved - stats.totalPaid, color: 'slate', gradient: 'from-slate-700 to-slate-800', bg: 'bg-slate-100' }
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`absolute -right-4 -top-4 w-28 h-28 ${card.bg} rounded-full group-hover:scale-125 transition-transform opacity-60`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 bg-gradient-to-tr ${card.gradient} text-white rounded-2xl shadow-lg ring-4 ring-white`}>
                  <card.icon size={28} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{card.label}</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.formatCurrency(card.val)}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-8 py-7 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner"><FileText size={22} /></div>
                <div>
                  <h3 className="font-black text-xl text-slate-900 tracking-tight">{t.dashboard.recentActivity}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gira os seus projetos ativos</p>
                </div>
              </div>
              <button 
                onClick={onNewBudget} 
                className="bg-slate-900 hover:bg-indigo-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-slate-100 active:scale-95"
              >
                <Plus size={16} /> {t.sidebar.newBudget}
              </button>
            </div>
            
            <div className="overflow-x-auto">
              {budgets.length === 0 ? (
                <div className="py-24 text-center space-y-6">
                  <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-200 ring-8 ring-indigo-50/50">
                    <Zap size={48} />
                  </div>
                  <div className="max-w-xs mx-auto">
                    <p className="font-black text-slate-900 text-lg leading-tight mb-2">{t.dashboard.noBudgets}</p>
                    <p className="text-sm text-slate-400 font-medium">{t.dashboard.createFirst}</p>
                  </div>
                  <button onClick={onNewBudget} className="bg-indigo-50 text-indigo-700 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-2 mx-auto">
                    {t.sidebar.newBudget} <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
                      <th className="px-8 py-5">{t.dashboard.tableRef}</th>
                      <th className="px-8 py-5">{t.total}</th>
                      <th className="px-8 py-5">{t.status}</th>
                      <th className="px-8 py-5 text-right">Ações Rápidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {budgets.slice().reverse().map(budget => (
                      <tr key={budget.id} className="hover:bg-slate-50 transition-all duration-300 group">
                        <td className="px-8 py-6">
                          <div className="font-black text-indigo-600 text-[10px] tracking-widest mb-1">{budget.number}</div>
                          <div className="font-bold text-slate-900 text-sm truncate max-w-[150px]">{budget.client.name}</div>
                        </td>
                        <td className="px-8 py-6 font-black text-slate-700">{stats.formatCurrency(stats.getBudgetValue(budget))}</td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${
                            budget.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            budget.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {t[budget.status.toLowerCase()] || budget.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button 
                                onClick={() => onViewBudget(budget, 'info')}
                                className="w-10 h-10 bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm"
                                title="Ver/Editar Orçamento"
                             >
                               <Eye size={16} />
                             </button>
                             {budget.status === 'Approved' && (
                               <>
                                 <button 
                                    onClick={() => onViewBudget(budget, 'payments')}
                                    className="w-10 h-10 bg-indigo-50 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm"
                                    title="Pagamentos"
                                 >
                                   <Wallet size={16} />
                                 </button>
                                 <button 
                                    onClick={() => onViewBudget(budget, 'expenses')}
                                    className="w-10 h-10 bg-emerald-50 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm"
                                    title="Custos da Obra"
                                 >
                                   <Hammer size={16} />
                                 </button>
                               </>
                             )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 flex flex-col h-fit">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shadow-inner"><Briefcase size={24} /></div>
              <div>
                <h3 className="font-black text-lg text-slate-900 tracking-tight">{t.dashboard.activeSpecialties}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.dashboard.specialtiesSub}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {company.specialties.map(s => (
                <div key={s} className={`group flex items-center gap-4 p-4 rounded-2xl border ${SPECIALTY_COLORS[s]} transition-all hover:scale-[1.02] cursor-default shadow-sm hover:shadow-md`}>
                  <div className="w-2.5 h-2.5 rounded-full bg-current group-hover:scale-150 transition-transform"></div>
                  <span className="text-xs font-black uppercase tracking-wide">{t.specialtyNames[s] || s}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 space-y-5">
               <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-xl group-hover:rotate-12 transition-transform">
                 <Target size={28} className="text-indigo-200" />
               </div>
               <div>
                 <h4 className="text-xl font-black mb-2 flex items-center gap-2">
                   {t.analytics.title} <Sparkles size={18} className="text-amber-400" />
                 </h4>
                 <p className="text-xs text-indigo-100/80 leading-relaxed font-medium">
                   {t.analytics.subtitle}
                 </p>
               </div>
               <button 
                onClick={() => {}} 
                className="w-full bg-white text-indigo-950 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
               >
                 {t.sidebar.analytics} <ArrowRight size={14} />
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
