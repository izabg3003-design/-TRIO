
import React from 'react';
import { Budget, Company, Specialty } from '../types';
import { COUNTRY_CONFIGS } from '../constants';

interface PDFProps {
  budget: Budget;
  company: Company;
}

const BudgetPDFTemplate: React.FC<PDFProps> = ({ budget, company }) => {
  const config = COUNTRY_CONFIGS[company.country];
  const taxes = config.taxLabels;
  
  const subtotal = budget.items.reduce((acc, item) => acc + (item.quantity * item.pricePerUnit), 0);
  const isVatEnabled = budget.isVatEnabled !== false;
  const tax = isVatEnabled ? subtotal * (budget.taxRate / 100) : 0;
  const total = subtotal + tax;

  const formatCurrency = (val: number) => val.toLocaleString(config.locale, { style: 'currency', currency: config.currency });

  return (
    <div id="budget-pdf-content" className="p-10 text-slate-800 bg-white flex flex-col font-sans" style={{ width: '210mm', minHeight: '297mm' }}>
      
      {/* ATRIO TRUST HEADER - RESPONSABILIDADE E CREDIBILIDADE */}
      <div className="flex justify-between items-center mb-6 pb-2 border-b-2 border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="3"><path d="M3 21h18M3 7v14M21 7v14M12 3l9 4-9 4-9-4 9-4z" /></svg>
          </div>
          <span className="text-[10px] font-black tracking-tighter text-slate-900 uppercase">
            SISTEMA <span className="text-indigo-600">ÁTRIO</span> PROFESSIONAL BUILD
          </span>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex flex-col items-end leading-none">
             <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Documento Verificado</span>
             <span className="text-[7px] font-bold text-slate-400 uppercase">Credibilidade • Confiança • Integridade</span>
           </div>
           <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
             <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
           </div>
        </div>
      </div>

      {/* ISSUING COMPANY HIGHLIGHT - DESTAQUE PARA A EMPRESA DO USUÁRIO */}
      <div className="bg-slate-900 text-white rounded-[2rem] p-8 mb-8 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-8">
          <div className="w-28 h-28 bg-white rounded-2xl p-2 flex items-center justify-center shadow-inner overflow-hidden">
             <img src={company.logo} alt={company.name} className="max-w-full max-h-full object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight leading-none mb-1">{company.name}</h1>
            <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-4">Especialistas em Construção Civil</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[10px] opacity-80 font-medium">
              <p><span className="font-bold text-white">{taxes.idNumber}:</span> {company.nif}</p>
              <p><span className="font-bold text-white">Tel:</span> {company.phone}</p>
              <p className="col-span-2"><span className="font-bold text-white">Email:</span> {company.email}</p>
              <p className="col-span-2"><span className="font-bold text-white">Morada:</span> {company.address}</p>
            </div>
          </div>
        </div>
        <div className="text-right border-l border-white/10 pl-8 h-24 flex flex-col justify-center">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Referência</p>
          <p className="text-3xl font-black tracking-tighter">{budget.number}</p>
          <p className="text-xs font-bold text-white/40">{new Date(budget.date).toLocaleDateString(config.locale)}</p>
        </div>
      </div>

      {/* CLIENT DATA CARD */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-8 bg-slate-50 p-6 rounded-3xl border border-slate-100">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-200/50">Destinatário / Client Details</p>
           <h3 className="text-xl font-black text-slate-900 uppercase mb-1">{budget.client.name}</h3>
           <div className="text-[11px] font-medium text-slate-600 space-y-0.5">
             <p><span className="font-bold text-slate-900">{taxes.idNumber}:</span> {budget.client.nif}</p>
             <p><span className="font-bold text-slate-900">Morada:</span> {budget.client.address}</p>
             {budget.client.contactName && <p><span className="font-bold text-slate-900">A/C:</span> {budget.client.contactName}</p>}
           </div>
        </div>
        <div className="col-span-4 flex flex-col gap-4">
          <div className="bg-indigo-600 text-white p-5 rounded-3xl flex flex-col justify-center shadow-lg shadow-indigo-100">
             <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-1">Validade Proposta</p>
             <p className="text-xl font-black">{budget.validUntil ? new Date(budget.validUntil).toLocaleDateString(config.locale) : '30 Dias'}</p>
          </div>
          <div className="bg-white border-2 border-slate-100 p-5 rounded-3xl flex items-center gap-4">
             <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
             </div>
             <div>
                <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Segurança</p>
                <p className="text-[10px] font-black text-indigo-900 uppercase">Cálculo Auditado</p>
             </div>
          </div>
        </div>
      </div>

      {/* COMPACT ITEMS TABLE */}
      <div className="mb-8">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">
              <th className="py-3 px-6 rounded-l-2xl">Descrição do Serviço / Item</th>
              <th className="py-3 px-2 text-center w-20">Setor</th>
              <th className="py-3 px-2 text-center w-16">Qtd</th>
              <th className="py-3 px-4 text-right w-28">Preço Un.</th>
              <th className="py-3 px-6 text-right w-36 rounded-r-2xl">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {budget.items.map((item) => (
              <tr key={item.id}>
                <td className="py-4 px-6">
                  <p className="text-[12px] font-bold text-slate-800">{item.description}</p>
                </td>
                <td className="py-4 px-2 text-center">
                  <span className="text-[8px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {config.translations.specialtyNames[item.category] || item.category}
                  </span>
                </td>
                <td className="py-4 px-2 text-center text-[11px] font-bold">{item.quantity} <span className="text-[9px] text-slate-400 uppercase font-medium">{item.unit}</span></td>
                <td className="py-4 px-4 text-right text-[11px] font-medium text-slate-600">{formatCurrency(item.pricePerUnit)}</td>
                <td className="py-4 px-6 text-right text-[12px] font-black text-slate-900">{formatCurrency(item.quantity * item.pricePerUnit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* NOTAS DETALHADAS - Agora com mais destaque se houver conteúdo */}
      {budget.notes && (
        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 mb-8">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200/50 pb-2">Informações Detalhadas e Condições de Execução</p>
          <div className="text-[10.5px] text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
            {budget.notes}
          </div>
        </div>
      )}

      {/* TOTALS & SIGNATURES */}
      <div className="mt-auto pt-8 flex justify-between items-end gap-10">
        <div className="flex-1">
           <div className="flex gap-16 pl-4">
             <div className="text-center">
               <div className="w-40 h-px bg-slate-300 mt-12 mb-2"></div>
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Assinatura e Carimbo</p>
             </div>
             <div className="text-center">
               <div className="w-40 h-px bg-slate-300 mt-12 mb-2"></div>
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Concordância Cliente</p>
             </div>
           </div>
        </div>

        <div className="w-80 space-y-3">
           <div className="flex justify-between px-4 text-xs font-bold text-slate-500 uppercase">
             <span>Valor Bruto</span>
             <span>{formatCurrency(subtotal)}</span>
           </div>
           {isVatEnabled && (
             <div className="flex justify-between px-4 text-xs font-bold text-slate-400 uppercase border-b border-slate-50 pb-3">
               <span>Taxa {taxes.vat} ({budget.taxRate}%)</span>
               <span>{formatCurrency(tax)}</span>
             </div>
           )}
           <div className="bg-slate-900 text-white rounded-3xl p-6 flex justify-between items-center shadow-xl">
             <div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">Total a Pagar</p>
               <span className="text-3xl font-black tracking-tighter">{formatCurrency(total)}</span>
             </div>
             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-indigo-400" stroke="currentColor" strokeWidth="3"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
             </div>
           </div>
        </div>
      </div>

      {/* ATRIO FINAL SEAL */}
      <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center grayscale opacity-40">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="2.5"><path d="M3 21h18M3 7v14M21 7v14M12 3l9 4-9 4-9-4 9-4z" /></svg>
            </div>
            <div className="max-w-[350px]">
              <p className="text-[9px] font-black text-slate-900 uppercase mb-0.5">PLATAFORMA ÁTRIO BUSINESS SOLUTIONS</p>
              <p className="text-[8px] text-slate-400 font-medium leading-tight">Este orçamento é um documento digital emitido sob os padrões de transparência da plataforma ÁTRIO. A empresa emissora é responsável pela execução e garantias dos serviços listados.</p>
            </div>
         </div>
         <div className="text-right">
            <p className="text-[7px] font-bold text-slate-300 uppercase tracking-widest mb-1">ID ÚNICO DE AUTENTICAÇÃO</p>
            <p className="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-100">
              AT-{budget.id.substring(0,6).toUpperCase()}-{budget.companyId.substring(0,4).toUpperCase()}
            </p>
         </div>
      </div>
    </div>
  );
};

export default BudgetPDFTemplate;
