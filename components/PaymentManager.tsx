
import React, { useState } from 'react';
import { Budget, Company, PaymentRecord } from '../types';
import { COUNTRY_CONFIGS } from '../constants';
import { 
  Wallet, 
  Plus, 
  Calendar, 
  DollarSign, 
  FileCheck, 
  History, 
  Eye, 
  TrendingUp,
  Image as ImageIcon,
  AlertTriangle,
  Crown
} from 'lucide-react';

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

  const handleOpenForm = () => {
    if (isLimitReached) {
      alert(t.payments.limitFree + " " + t.upgradeNow);
      onUpgrade();
      return;
    }
    setShowAddForm(true);
  };

  const submitPayment = () => {
    if (newPayment.amount <= 0) return;
    
    // Verificação dupla de segurança
    if (isLimitReached) {
      alert(t.payments.limitFree);
      onUpgrade();
      return;
    }
    
    const record: PaymentRecord = {
      id: crypto.randomUUID(),
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
      
      {/* Coluna de Status */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
           <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
             <TrendingUp size={16} className="text-indigo-600" /> Estado do Projeto
           </h3>

           {isFree && (
             <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-amber-600 uppercase">Limite Plano Free</span>
                  <span className="text-[10px] font-black text-amber-600">{paymentsCount}/3</span>
                </div>
                <div className="h-1.5 w-full bg-amber-200/50 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${(paymentsCount/3)*100}%` }}></div>
                </div>
                {isLimitReached && (
                  <button onClick={onUpgrade} className="w-full mt-2 py-2 bg-amber-500 text-white text-[9px] font-black uppercase rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-1">
                    <Crown size={10} /> {t.upgradeNow}
                  </button>
                )}
             </div>
           )}

           <div className="space-y-6">
             <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <span>Progresso de Pagamento</span>
                  <span>{percent.toFixed(0)}%</span>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                  <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.payments.totalBudget}</p>
                   <p className="text-xl font-black text-slate-900">{formatCurrency(total)}</p>
                </div>
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{t.paid}</p>
                   <p className="text-xl font-black text-emerald-700">{formatCurrency(paid)}</p>
                </div>
                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100">
                   <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">{t.balance}</p>
                   <p className="text-xl font-black text-amber-700">{formatCurrency(balance)}</p>
                </div>
             </div>
           </div>
        </div>
      </div>

      {/* Coluna de Lançamentos */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Plus size={16} className="text-indigo-600" /> {t.payments.addPayment}
            </h3>
            {!showAddForm && (
              <button 
                onClick={handleOpenForm}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${isLimitReached ? 'bg-amber-100 text-amber-600' : 'bg-slate-900 text-white hover:bg-indigo-600'}`}
              >
                {isLimitReached ? (
                  <span className="flex items-center gap-2"><Crown size={12} /> Limite Atingido</span>
                ) : 'Novo Recebimento'}
              </button>
            )}
          </div>

          {showAddForm ? (
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-[2rem] space-y-6 animate-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.payments.amount}</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="number" 
                      value={newPayment.amount}
                      onChange={e => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-4 bg-white border border-slate-200 rounded-2xl font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.payments.paymentDate}</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="date" 
                      value={newPayment.date}
                      onChange={e => setNewPayment({ ...newPayment, date: e.target.value })}
                      className="w-full pl-10 pr-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                  </div>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.payments.proof}</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer group">
                      <div className="w-full px-6 py-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 group-hover:border-indigo-500 transition-all">
                        <ImageIcon size={20} className="text-slate-400 group-hover:text-indigo-500" />
                        <span className="text-xs font-black uppercase text-slate-500 group-hover:text-indigo-500">
                          {newPayment.proof ? 'Comprovativo Selecionado' : 'Fazer Upload'}
                        </span>
                        <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf" />
                      </div>
                    </label>
                    {newPayment.proof && (
                       <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200">
                         {newPayment.proof.startsWith('data:image') ? (
                           <img src={newPayment.proof} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600"><FileCheck size={20} /></div>
                         )}
                       </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                 <button onClick={() => setShowAddForm(false)} className="px-6 py-3 text-xs font-black uppercase text-slate-400 hover:text-slate-600 tracking-widest">{t.cancel}</button>
                 <button 
                  onClick={submitPayment}
                  className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                 >
                   {t.confirm}
                 </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <History size={14} /> {t.payments.history}
              </h4>
              {!budget.payments || budget.payments.length === 0 ? (
                <div className="py-12 text-center text-slate-300 italic text-sm">Nenhum pagamento registado ainda.</div>
              ) : (
                <div className="space-y-3">
                  {budget.payments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                    <div key={record.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><DollarSign size={18} /></div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{formatCurrency(record.amount)}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(record.date).toLocaleDateString(config.locale)}</p>
                        </div>
                      </div>
                      {record.proofBase64 && (
                        <button 
                          onClick={() => {
                            const win = window.open();
                            win?.document.write(`<iframe src="${record.proofBase64}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                          }}
                          className="p-3 bg-white text-indigo-600 rounded-xl shadow-sm border border-slate-200 hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentManager;
