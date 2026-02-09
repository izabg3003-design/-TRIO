
import React, { useState } from 'react';
import { Budget, Company, PaymentRecord } from '../types';
import { COUNTRY_CONFIGS } from '../constants';
import { Wallet, Plus, Calendar, DollarSign, FileCheck, History, Eye, TrendingUp, Image as ImageIcon, AlertTriangle, Crown } from 'lucide-react';

interface PaymentManagerProps {
  budget: Budget;
  company: Company;
  onUpdateBudget: (budget: Budget) => void;
  onUpgrade: () => void;
}

const PaymentManager: React.FC<PaymentManagerProps> = ({ budget, company, onUpdateBudget, onUpgrade }) => {
  const config = COUNTRY_CONFIGS[company.country];
  const t = config.translations;
  const isFree = company.plan === 'Free';
  const paymentsCount = (budget.payments || []).length;
  const isLimitReached = isFree && paymentsCount >= 3;

  const [showAddForm, setShowAddForm] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
    proof: ''
  });

  const getTotals = (b: Budget) => {
    const subtotal = b.items.reduce((acc, item) => acc + (item.quantity * item.pricePerUnit), 0);
    const total = subtotal * (1 + b.taxRate / 100);
    const paid = (b.payments || []).reduce((acc, p) => acc + p.amount, 0);
    const balance = total - paid;
    return { total, paid, balance, percent: Math.min((paid / total) * 100, 100) };
  };

  const { total, paid, balance, percent } = getTotals(budget);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPayment({ ...newPayment, proof: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const submitPayment = () => {
    if (newPayment.amount <= 0) return;
    
    const record: PaymentRecord = {
      id: `pay_${Math.random().toString(36).substr(2, 9)}`,
      date: newPayment.date,
      amount: newPayment.amount,
      proofBase64: newPayment.proof,
      notes: newPayment.notes
    };

    const updatedBudget: Budget = {
      ...budget,
      payments: [...(budget.payments || []), record]
    };

    onUpdateBudget(updatedBudget);
    setShowAddForm(false);
    setNewPayment({ amount: 0, date: new Date().toISOString().split('T')[0], notes: '', proof: '' });
  };

  const formatCurrency = (val: number) => 
    val.toLocaleString(config.locale, { style: 'currency', currency: config.currency });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
           <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
             <TrendingUp size={16} className="text-indigo-600" /> Estado do Projeto
           </h3>
           <div className="space-y-6">
             <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <span>Progresso</span>
                  <span>{percent.toFixed(0)}%</span>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                  <div className="h-full bg-emerald-500" style={{ width: `${percent}%` }}></div>
                </div>
             </div>
             <div className="grid grid-cols-1 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                   <p className="text-xl font-black text-slate-900">{formatCurrency(total)}</p>
                </div>
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Pago</p>
                   <p className="text-xl font-black text-emerald-700">{formatCurrency(paid)}</p>
                </div>
             </div>
           </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Plus size={16} className="text-indigo-600" /> Lançar Pagamento
            </h3>
            {!showAddForm && (
              <button onClick={() => setShowAddForm(true)} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Novo</button>
            )}
          </div>
          {showAddForm && (
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 space-y-6">
               <div className="grid grid-cols-2 gap-6">
                  <input type="number" value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: parseFloat(e.target.value) || 0})} className="p-4 rounded-2xl border border-slate-200" placeholder="Valor" />
                  <input type="date" value={newPayment.date} onChange={e => setNewPayment({...newPayment, date: e.target.value})} className="p-4 rounded-2xl border border-slate-200" />
               </div>
               <button onClick={submitPayment} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase">Confirmar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentManager;
