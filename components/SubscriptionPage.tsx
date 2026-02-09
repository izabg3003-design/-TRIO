
import React, { useState } from 'react';
import { Company } from '../types';
import { Check, Crown, Sparkles, CreditCard, ShieldCheck, History, ArrowRight, Loader2, Zap, FileText } from 'lucide-react';
import { COUNTRY_CONFIGS } from '../constants';

interface SubscriptionPageProps {
  company: Company;
  onUpgrade: () => void;
}

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ company, onUpgrade }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const isPremium = company.plan === 'Premium';
  const config = COUNTRY_CONFIGS[company.country];
  const t = config.translations;

  const handleStartStripe = () => {
    setShowStripeModal(true);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowStripeModal(false);
      onUpgrade();
    }, 2500);
  };

  const invoices = [
    { id: 'INV-003', date: '2024-04-01', amount: t.subscription.proPrice, status: t.pending },
    { id: 'INV-002', date: '2024-03-01', amount: t.subscription.proPrice, status: t.paid },
    { id: 'INV-001', date: '2024-02-01', amount: t.subscription.proPrice, status: t.paid },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl ${isPremium ? 'bg-gradient-to-tr from-indigo-600 to-purple-700' : 'bg-slate-200 text-slate-400'}`}>
            {isPremium ? <Crown size={32} /> : <CreditCard size={32} />}
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">
              {t.subscription.currentPlan}: <span className={isPremium ? 'text-indigo-600' : 'text-slate-500'}>{company.plan}</span>
            </h3>
            <p className="text-slate-500 font-medium">
              {isPremium ? `${t.subscription.renewsOn} 01/05/2024.` : t.auth.loginSub}
            </p>
          </div>
        </div>
        {!isPremium && (
          <button 
            onClick={handleStartStripe}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95"
          >
            <Sparkles size={20} /> {t.subscription.upgradeBtn}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Zap size={16} className="text-indigo-600" /> {t.subscription.plansTitle}
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className={`p-8 rounded-[2rem] border-2 transition-all ${!isPremium ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 bg-white'}`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.subscription.basicName}</p>
              <h5 className="text-3xl font-black text-slate-900 mb-6">{t.subscription.freePrice}</h5>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-xs font-bold text-slate-600"><Check size={14} className="text-indigo-500" /> {t.subscription.features.budgets3}</li>
                <li className="flex items-center gap-3 text-xs font-bold text-slate-400 line-through"><Check size={14} /> {t.subscription.features.pdfExport}</li>
              </ul>
              {!isPremium && <div className="text-center text-[10px] font-black text-indigo-600 uppercase">{t.subscription.activePlan}</div>}
            </div>

            <div className={`p-8 rounded-[2rem] border-2 relative transition-all shadow-xl ${isPremium ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 bg-white hover:border-indigo-200'}`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-indigo-100">Popular</div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">{t.subscription.proName}</p>
              <h5 className="text-3xl font-black text-slate-900 mb-1">{t.subscription.proPrice}</h5>
              <p className="text-[9px] font-black text-slate-400 uppercase mb-5">{t.subscription.proTaxInfo}</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-xs font-bold text-slate-600"><Check size={14} className="text-indigo-500" /> {t.subscription.features.budgetsInf}</li>
                <li className="flex items-center gap-3 text-xs font-bold text-slate-600"><Check size={14} className="text-indigo-500" /> {t.subscription.features.pdfExport}</li>
                <li className="flex items-center gap-3 text-xs font-bold text-slate-600"><Check size={14} className="text-indigo-500" /> {t.subscription.features.payments}</li>
                <li className="flex items-center gap-3 text-xs font-bold text-slate-600"><Check size={14} className="text-indigo-500" /> {t.subscription.features.analytics}</li>
              </ul>
              {!isPremium && (
                <button 
                  onClick={handleStartStripe}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors"
                >
                  {t.subscription.selectPlan}
                </button>
              )}
              {isPremium && <div className="text-center text-[10px] font-black text-indigo-600 uppercase">{t.subscription.activePlan}</div>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <History size={16} className="text-indigo-600" /> {t.subscription.historyTitle}
          </h4>
          
          <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
            {!isPremium ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
                   <ShieldCheck size={32} />
                </div>
                <h5 className="font-bold text-slate-900">{t.subscription.emptyHistory}</h5>
                <p className="text-xs text-slate-500 leading-relaxed px-10">{t.subscription.emptyHistoryDesc}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <div key={inv.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">{inv.id}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{inv.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{inv.amount}</p>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${inv.status === t.paid ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-center justify-between shadow-xl">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <CreditCard size={24} />
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.subscription.paymentMethod}</p>
                 <p className="text-sm font-bold">{isPremium ? 'VISA •••• 4242' : 'N/A'}</p>
               </div>
             </div>
             {isPremium && (
               <button className="text-[10px] font-black text-indigo-400 uppercase hover:text-white transition-colors">{t.subscription.changeMethod}</button>
             )}
          </div>
        </div>
      </div>

      {showStripeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="bg-indigo-600 p-8 text-white flex flex-col items-center gap-4 relative">
                <button onClick={() => setShowStripeModal(false)} className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors">×</button>
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                   <CreditCard size={32} />
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-black">{t.subscription.checkoutTitle}</h4>
                  <p className="text-sm text-indigo-100">{t.subscription.proPrice} {t.subscription.proTaxInfo}</p>
                </div>
              </div>
              <div className="p-10 space-y-6">
                 {isProcessing ? (
                   <div className="py-12 flex flex-col items-center gap-4">
                      <Loader2 size={48} className="text-indigo-600 animate-spin" />
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t.subscription.processing}</p>
                   </div>
                 ) : (
                   <>
                     <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">VISA / MASTERCARD</label>
                          <input type="text" defaultValue="4242 4242 4242 4242" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono" />
                        </div>
                     </div>
                     <button 
                        onClick={handleConfirmPayment}
                        className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
                     >
                       {t.subscription.payNow} <ArrowRight size={20} />
                     </button>
                   </>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
