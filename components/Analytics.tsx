
import React, { useMemo } from 'react';
import { Budget, Company, Specialty } from '../types';
import { Crown, Sparkles, TrendingUp, DollarSign, PieChart, BarChart, Hammer, Activity, Calendar } from 'lucide-react';
import { COUNTRY_CONFIGS } from '../constants';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  Legend,
  AreaChart,
  Area
} from 'recharts';

interface AnalyticsProps {
  budgets: Budget[];
  company: Company;
  onUpgrade: () => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ budgets, company, onUpgrade }) => {
  const isPremium = company.plan === 'Premium';
  const config = COUNTRY_CONFIGS[company.country];
  const t = config.translations;

  const stats = useMemo(() => {
    const getBudgetValue = (b: Budget) => {
      const subtotal = b.items.reduce((acc, item) => acc + (item.quantity * item.pricePerUnit), 0);
      const isVatEnabled = b.isVatEnabled !== false;
      return subtotal * (1 + (isVatEnabled ? b.taxRate : 0) / 100);
    };

    const getBudgetCosts = (b: Budget) => {
      return (b.expenses || []).reduce((acc, exp) => acc + (exp.quantity * exp.pricePerUnit), 0);
    };

    // 1. Data por Status
    const statusData = [
      { name: t.draft, value: budgets.filter(b => b.status === 'Draft').length, color: '#f59e0b' },
      { name: t.approved, value: budgets.filter(b => b.status === 'Approved').length, color: '#10b981' },
      { name: t.rejected, value: budgets.filter(b => b.status === 'Rejected').length, color: '#ef4444' },
    ].filter(d => d.value > 0);

    // 2. Receita por Especialidade
    const specialtyStats: Record<string, { revenue: number }> = {};
    budgets.forEach(b => {
      if (b.status === 'Approved') {
        b.items.forEach(item => {
          const catName = t.specialtyNames[item.category] || item.category;
          if (!specialtyStats[catName]) specialtyStats[catName] = { revenue: 0 };
          specialtyStats[catName].revenue += (item.quantity * item.pricePerUnit);
        });
      }
    });

    const specialtyBarData = Object.entries(specialtyStats).map(([name, data]) => ({
      name,
      receita: parseFloat(data.revenue.toFixed(2)),
    })).sort((a, b) => b.receita - a.receita);

    // 3. Evolução Mensal (Receita vs Despesas)
    const monthlyStats: Record<string, { revenue: number, costs: number }> = {};
    budgets.filter(b => b.status === 'Approved').forEach(b => {
      const date = new Date(b.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!monthlyStats[monthYear]) monthlyStats[monthYear] = { revenue: 0, costs: 0 };
      monthlyStats[monthYear].revenue += getBudgetValue(b);
      monthlyStats[monthYear].costs += getBudgetCosts(b);
    });

    const trendData = Object.entries(monthlyStats).map(([name, data]) => ({
      name,
      receita: parseFloat(data.revenue.toFixed(2)),
      custos: parseFloat(data.costs.toFixed(2))
    })).sort((a, b) => {
      const [m1, y1] = a.name.split('/').map(Number);
      const [m2, y2] = b.name.split('/').map(Number);
      return y1 - y2 || m1 - m2;
    });

    // 4. Totais Financeiros Globais
    const totalApprovedRevenue = budgets.filter(b => b.status === 'Approved').reduce((acc, b) => acc + getBudgetValue(b), 0);
    const totalApprovedCosts = budgets.filter(b => b.status === 'Approved').reduce((acc, b) => acc + getBudgetCosts(b), 0);
    const netProfit = totalApprovedRevenue - totalApprovedCosts;
    
    const conversionRate = budgets.length > 0 
      ? (budgets.filter(b => b.status === 'Approved').length / budgets.length) * 100 
      : 0;

    return { 
      statusData, 
      specialtyBarData, 
      trendData,
      totalApprovedRevenue, 
      totalApprovedCosts, 
      netProfit, 
      conversionRate 
    };
  }, [budgets, t]);

  const formatCurrency = (val: number) => val.toLocaleString(config.locale, { style: 'currency', currency: config.currency });

  if (!isPremium) {
    return (
      <div className="relative min-h-[600px] flex flex-col items-center justify-center p-12 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 -z-10"></div>
        <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-purple-700 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl animate-bounce">
          <Crown size={48} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{t.analytics.title}</h2>
        <p className="max-w-xl text-center text-slate-600 text-lg font-medium leading-relaxed mb-10">
          {t.analytics.subtitle}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-4xl">
          {[
            { icon: PieChart, title: t.analytics.benefit1Title, desc: t.analytics.benefit1Desc },
            { icon: BarChart, title: t.analytics.benefit2Title, desc: t.analytics.benefit2Desc },
            { icon: TrendingUp, title: t.analytics.benefit3Title, desc: t.analytics.benefit3Desc }
          ].map((item, i) => (
            <div key={i} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <item.icon size={24} />
              </div>
              <h4 className="font-bold text-slate-800 mb-1">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>

        <button 
          onClick={onUpgrade} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 flex items-center gap-3 active:scale-95"
        >
          <Sparkles size={24} /> {t.analytics.upgradeBtn}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Cards Financeiros Consolidados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <TrendingUp size={14} className="text-indigo-600" /> {t.analytics.revenueApproved}
          </p>
          <h3 className="text-2xl font-black text-slate-900">{formatCurrency(stats.totalApprovedRevenue)}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Hammer size={14} className="text-red-600" /> {t.analytics.totalCosts}
          </p>
          <h3 className="text-2xl font-black text-red-600">{formatCurrency(stats.totalApprovedCosts)}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Activity size={14} className="text-emerald-600" /> {t.analytics.netProfit}
          </p>
          <h3 className="text-2xl font-black text-emerald-600">{formatCurrency(stats.netProfit)}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-blue-600" /> {t.analytics.conversionRate}
          </p>
          <h3 className="text-2xl font-black text-blue-600">{stats.conversionRate.toFixed(1)}%</h3>
        </div>
      </div>

      {/* NOVO: Gráfico de Evolução Financeira Mensal (Receita vs Despesas) */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
             <Calendar className="text-indigo-600" size={18} /> Evolução Financeira Mensal
           </h3>
           <div className="flex gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase">{t.projectDashboard.revenue}</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-500"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase">{t.projectDashboard.expenses}</span>
              </div>
           </div>
        </div>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="receita" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              <Area type="monotone" dataKey="custos" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribuição por Estado */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[450px] flex flex-col">
          <h3 className="text-sm font-black text-slate-900 mb-8 border-b border-slate-50 pb-4 flex items-center gap-3 uppercase tracking-widest">
            <PieChart className="text-indigo-600" size={18} /> {t.analytics.distributionStatus}
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={stats.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Receita por Especialidade */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[450px] flex flex-col">
          <h3 className="text-sm font-black text-slate-900 mb-8 border-b border-slate-50 pb-4 flex items-center gap-3 uppercase tracking-widest">
            <BarChart className="text-indigo-600" size={18} /> {t.analytics.revenueBySpecialty}
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={stats.specialtyBarData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="receita" fill="#6366f1" radius={[0, 10, 10, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="p-8 bg-indigo-900 rounded-[2.5rem] text-white flex items-center gap-6 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
          <Activity size={32} className="text-indigo-300" />
        </div>
        <div>
          <h4 className="text-lg font-black uppercase tracking-widest mb-1">Dica de Performance ÁTRIO</h4>
          <p className="text-sm text-indigo-100 font-medium leading-relaxed">
            A sua empresa tem um lucro líquido de <span className="text-emerald-400 font-black">{formatCurrency(stats.netProfit)}</span> sobre uma receita de <span className="text-indigo-300 font-black">{formatCurrency(stats.totalApprovedRevenue)}</span>. 
            Isto representa uma margem operacional de <span className="text-emerald-400 font-black">{(stats.totalApprovedRevenue > 0 ? (stats.netProfit/stats.totalApprovedRevenue)*100 : 0).toFixed(1)}%</span>. Parabéns pelo controlo rigoroso!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
