
import React, { useMemo } from 'react';
import { Budget, Company } from '../types';
import { COUNTRY_CONFIGS } from '../constants';
import { 
  DollarSign, 
  TrendingUp, 
  Wallet, 
  Hammer, 
  PieChart, 
  Activity, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface ProjectDashboardProps {
  budget: Budget;
  company: Company;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ budget, company }) => {
  const config = COUNTRY_CONFIGS[company.country];
  const t = config.translations;

  const stats = useMemo(() => {
    const subtotal = budget.items.reduce((acc, item) => acc + (item.quantity * item.pricePerUnit), 0);
    const isVatEnabled = budget.isVatEnabled !== false;
    const revenue = subtotal * (1 + (isVatEnabled ? budget.taxRate : 0) / 100);
    const costs = (budget.expenses || []).reduce((acc, exp) => acc + (exp.quantity * exp.pricePerUnit), 0);
    const paid = (budget.payments || []).reduce((acc, p) => acc + p.amount, 0);
    const profit = revenue - costs;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const balance = revenue - paid;
    const paymentPercent = revenue > 0 ? (paid / revenue) * 100 : 0;

    const chartData = [
      { name: t.projectDashboard.revenue, value: revenue, color: '#6366f1' },
      { name: t.projectDashboard.expenses, value: costs, color: '#ef4444' },
      { name: t.projectDashboard.profit, value: profit, color: '#10b981' }
    ];

    return { revenue, costs, paid, profit, margin, balance, paymentPercent, chartData };
  }, [budget, t]);

  const formatCurrency = (val: number) => 
    val.toLocaleString(config.locale, { style: 'currency', currency: config.currency });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: TrendingUp, label: t.projectDashboard.revenue, val: stats.revenue, color: 'indigo' },
          { icon: Hammer, label: t.projectDashboard.expenses, val: stats.costs, color: 'red' },
          { icon: Activity, label: t.projectDashboard.profit, val: stats.profit, color: 'emerald', extra: `${stats.margin.toFixed(1)}% ${t.projectDashboard.margin}` },
          { icon: Wallet, label: t.projectDashboard.collected, val: stats.paid, color: 'amber', extra: `${formatCurrency(stats.balance)} ${t.projectDashboard.toCollect}` }
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 bg-${card.color}-50 text-${card.color}-600 rounded-xl`}>
                <card.icon size={20} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-1">{formatCurrency(card.val)}</h3>
            {card.extra && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{card.extra}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Comparação */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-[400px] flex flex-col">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
            <PieChart size={16} className="text-indigo-600" /> {t.projectDashboard.comparison}
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis hide />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Estado de Pagamento */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between">
           <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
             <CheckCircle2 size={16} className="text-indigo-600" /> {t.projectDashboard.paymentStatus}
           </h3>
           
           <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path className="text-indigo-600" strokeDasharray={`${stats.paymentPercent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-3xl font-black text-slate-900">{stats.paymentPercent.toFixed(0)}%</span>
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Recebido</span>
                </div>
              </div>

              <div className="w-full space-y-3">
                 <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{t.projectDashboard.collected}</span>
                    <span className="text-xs font-black text-indigo-600">{formatCurrency(stats.paid)}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                    <span className="text-[10px] font-bold text-red-500 uppercase">{t.projectDashboard.toCollect}</span>
                    <span className="text-xs font-black text-red-600">{formatCurrency(stats.balance)}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-center gap-6 relative overflow-hidden group shadow-xl">
        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
          <Activity size={24} className="text-indigo-300" />
        </div>
        <div>
          <p className="text-xs font-bold leading-relaxed">
            A sua margem atual neste projeto é de <span className="text-indigo-300 font-black">{stats.margin.toFixed(1)}%</span>. 
            Mantenha os custos abaixo de <span className="text-emerald-400 font-black">{formatCurrency(stats.revenue * 0.7)}</span> para manter a rentabilidade sugerida de 30%.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
