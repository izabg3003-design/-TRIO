
import React, { useMemo } from 'react';
import { Budget, Company, ExpenseItem } from '../types';
import { COUNTRY_CONFIGS } from '../constants';
import { 
  Plus, 
  Trash2, 
  Calculator, 
  DollarSign, 
  PieChart, 
  Hammer,
  Save,
  Crown,
  AlertCircle
} from 'lucide-react';

interface ExpenseManagerProps {
  budget: Budget;
  company: Company;
  onUpdateBudget: (budget: Budget) => void;
  onUpgrade: () => void;
}

const ExpenseManager: React.FC<ExpenseManagerProps> = ({ budget, company, onUpdateBudget, onUpgrade }) => {
  const config = COUNTRY_CONFIGS[company.country];
  const t = config.translations;
  const isFree = company.plan === 'Free';
  const expensesCount = (budget.expenses || []).length;
  const isLimitReached = isFree && expensesCount >= 3;

  const formatCurrency = (val: number) => 
    val.toLocaleString(config.locale, { style: 'currency', currency: config.currency });

  const handleAddExpense = () => {
    if (isLimitReached) {
      alert(t.expenses.limitFree + " " + t.upgradeNow);
      onUpgrade();
      return;
    }

    const newItem: ExpenseItem = {
      id: `exp_${Math.random().toString(36).substr(2, 9)}`,
      description: '',
      unit: 'un',
      quantity: 1,
      pricePerUnit: 0
    };
    const updatedBudget: Budget = {
      ...budget,
      expenses: [...(budget.expenses || []), newItem]
    };
    onUpdateBudget(updatedBudget);
  };

  const handleUpdateExpense = (id: string, field: keyof ExpenseItem, value: any) => {
    const updatedExpenses = (budget.expenses || []).map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    onUpdateBudget({ ...budget, expenses: updatedExpenses });
  };

  const handleRemoveExpense = (id: string) => {
    const updatedExpenses = (budget.expenses || []).filter(exp => exp.id !== id);
    onUpdateBudget({ ...budget, expenses: updatedExpenses });
  };

  const totals = useMemo(() => {
    const revenue = budget.items.reduce((acc, item) => acc + (item.quantity * item.pricePerUnit), 0) * (1 + (budget.isVatEnabled ? budget.taxRate : 0) / 100);
    const costs = (budget.expenses || []).reduce((acc, exp) => acc + (exp.quantity * exp.pricePerUnit), 0);
    return { revenue, costs, profit: revenue - costs };
  }, [budget]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Orçamentado</p>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(totals.revenue)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">{t.expenses.totalExpenses}</p>
          <p className="text-2xl font-black text-red-600">{formatCurrency(totals.costs)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t.expenses.profit}</p>
          <p className={`text-2xl font-black ${totals.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(totals.profit)}
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
               <Hammer size={16} className="text-indigo-600" /> Folha de Lançamentos
             </h3>
             {isFree && (
               <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1 ${isLimitReached ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                 Itens: {expensesCount}/3
               </span>
             )}
          </div>
          <button 
            onClick={handleAddExpense}
            className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all flex items-center gap-2 active:scale-95 ${isLimitReached ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            <Plus size={14} /> {t.expenses.addItem}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                <th className="pb-4 pr-4 w-1/3">{t.expenses.itemDescription}</th>
                <th className="pb-4 px-2 text-center w-20">{t.expenses.unit}</th>
                <th className="pb-4 px-2 text-center w-20">{t.expenses.qty}</th>
                <th className="pb-4 px-2 text-right w-32">{t.expenses.price}</th>
                <th className="pb-4 px-2 text-right w-32">{t.expenses.totalItem}</th>
                <th className="pb-4 pl-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(budget.expenses || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-300 italic font-medium text-sm">
                    {t.expenses.noExpenses}
                  </td>
                </tr>
              ) : (
                (budget.expenses || []).map(exp => (
                  <tr key={exp.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pr-4">
                      <input 
                        type="text" 
                        value={exp.description} 
                        onChange={e => handleUpdateExpense(exp.id, 'description', e.target.value)}
                        placeholder="Material..."
                        className="w-full bg-transparent font-bold text-slate-700 focus:text-indigo-600 outline-none"
                      />
                    </td>
                    <td className="py-4 px-2 text-center">
                      <input 
                        type="text" 
                        value={exp.unit} 
                        onChange={e => handleUpdateExpense(exp.id, 'unit', e.target.value)}
                        className="w-full bg-transparent text-center font-bold text-slate-500 outline-none"
                      />
                    </td>
                    <td className="py-4 px-2 text-center">
                      <input 
                        type="number" 
                        value={exp.quantity} 
                        onChange={e => handleUpdateExpense(exp.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent text-center font-black text-slate-700 outline-none"
                      />
                    </td>
                    <td className="py-4 px-2 text-right">
                      <input 
                        type="number" 
                        value={exp.pricePerUnit} 
                        onChange={e => handleUpdateExpense(exp.id, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent text-right font-black text-indigo-600 outline-none"
                      />
                    </td>
                    <td className="py-4 px-2 text-right font-black text-slate-900">
                      {formatCurrency(exp.quantity * exp.pricePerUnit)}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <button onClick={() => handleRemoveExpense(exp.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseManager;
