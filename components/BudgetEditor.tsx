
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Company, Budget, BudgetItem, Specialty, Client } from '../types';
import { COUNTRY_CONFIGS } from '../constants';
import { Plus, Trash2, ArrowLeft, Save, Download, FileText, AlertCircle, Briefcase, Calculator, CheckSquare, Square, Loader2, AlignLeft, User } from 'lucide-react';
import BudgetPDFTemplate from './BudgetPDFTemplate';

interface BudgetEditorProps {
  company: Company;
  onSave: (budget: Budget) => void;
  onCancel: () => void;
  initialData: Budget | null;
  onUpgrade: () => void;
}

const BudgetEditor: React.FC<BudgetEditorProps> = ({ company, onSave, onCancel, initialData, onUpgrade }) => {
  const config = COUNTRY_CONFIGS[company.country];
  const t = config.translations;
  const taxes = config.taxLabels;
  
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [client, setClient] = useState<Client>(initialData?.client || { name: '', contactName: '', address: '', email: '', phone: '', nif: '' });
  const [items, setItems] = useState<BudgetItem[]>(initialData?.items || []);
  const [taxRate, setTaxRate] = useState<number>(initialData?.taxRate || config.defaultRates.vat);
  const [isVatEnabled, setIsVatEnabled] = useState<boolean>(initialData?.isVatEnabled ?? true);
  const [validUntil, setValidUntil] = useState<string>(initialData?.validUntil || '');
  const [status, setStatus] = useState<'Draft' | 'Approved' | 'Rejected'>(initialData?.status || 'Draft');
  const [notes, setNotes] = useState<string>(initialData?.notes || '');
  
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.pricePerUnit), 0);
  const tax = isVatEnabled ? subtotal * (taxRate / 100) : 0;
  const total = subtotal + tax;
  const formatCurrency = (val: number) => val.toLocaleString(config.locale, { style: 'currency', currency: config.currency });

  const isFree = company.plan === 'Free';
  const uniqueSpecialties = Array.from(new Set(items.map(i => i.category)));

  const addItem = () => {
    if (isFree && items.length >= 2) {
      alert(t.limitBudgetItemsSpecialties + " " + t.upgradeNow);
      onUpgrade();
      return;
    }
    const newItem: BudgetItem = { id: crypto.randomUUID(), description: '', quantity: 1, unit: 'un', pricePerUnit: 0, category: company.specialties[0] || Specialty.Outro };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof BudgetItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const preloadImages = (container: HTMLElement) => {
    const images = Array.from(container.getElementsByTagName('img'));
    const promises = images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });
    return Promise.all(promises);
  };

  const handleExportPDF = async () => {
    if (items.length === 0) {
      alert("Adicione itens antes de exportar.");
      return;
    }

    setIsGeneratingPDF(true);

    const budgetData: Budget = {
      ...initialData!,
      id: initialData?.id || crypto.randomUUID(),
      number: initialData?.number || `BGT-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      client, items, taxRate, isVatEnabled, status,
      date: initialData?.date || new Date().toISOString(),
      validUntil, companyId: company.id, notes
    };

    let printRoot = document.getElementById('pdf-render-mount');
    if (!printRoot) {
      printRoot = document.createElement('div');
      printRoot.id = 'pdf-render-mount';
      printRoot.style.position = 'fixed';
      printRoot.style.left = '-5000px';
      printRoot.style.top = '0';
      printRoot.style.width = '210mm';
      printRoot.style.zIndex = '-1000';
      document.body.appendChild(printRoot);
    }

    const reactRoot = ReactDOM.createRoot(printRoot);
    reactRoot.render(<BudgetPDFTemplate budget={budgetData} company={company} />);

    setTimeout(async () => {
      try {
        const element = document.getElementById('pdf-render-mount');
        if (!element) throw new Error("Falha no mount");

        await preloadImages(element);

        const opt = {
          margin: 0,
          filename: `Orcamento_${budgetData.number}_${client.name.replace(/\s+/g, '_')}.pdf`,
          image: { type: 'jpeg', quality: 1.0 },
          html2canvas: { 
            scale: 2, 
            useCORS: true, 
            letterRendering: true,
            scrollX: 0,
            scrollY: 0,
            windowWidth: 1200
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // @ts-ignore
        await html2pdf().set(opt).from(element).save();
      } catch (err) {
        console.error("PDF Export Error:", err);
        alert("Erro ao gerar PDF. Tente novamente.");
      } finally {
        reactRoot.unmount();
        setIsGeneratingPDF(false);
      }
    }, 1500);
  };

  const validateAndSave = () => {
    if (isFree && uniqueSpecialties.length > 2) {
      alert(t.limitBudgetItemsSpecialties);
      onUpgrade();
      return;
    }
    onSave({
      ...initialData!,
      id: initialData?.id || crypto.randomUUID(),
      number: initialData?.number || `BGT-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      client, items, taxRate, isVatEnabled, status,
      date: initialData?.date || new Date().toISOString(),
      validUntil, companyId: company.id, notes
    });
  };

  return (
    <div className="space-y-8 pb-20 animate-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-3 bg-white hover:bg-slate-50 rounded-2xl shadow-sm border border-slate-200 transition-all active:scale-95"><ArrowLeft size={20} /></button>
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{t.sidebar.newBudget}</h2>
            <p className="text-[10px] font-black text-indigo-600 tracking-widest uppercase">{initialData?.number || 'Novo Rascunho'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportPDF}
            disabled={isGeneratingPDF}
            className={`hidden sm:flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all active:scale-95 ${isGeneratingPDF ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isGeneratingPDF ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isGeneratingPDF ? 'A Gerar PDF...' : t.export}
          </button>
          <button 
            onClick={validateAndSave} 
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
          >
            <Save size={18} /> {t.save}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-4 flex items-center gap-2">
              <FileText size={16} className="text-indigo-600" /> {t.editor.clientTitle}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.name}</label>
                <input type="text" value={client.name} onChange={e => setClient({...client, name: e.target.value})} placeholder="Nome Completo / Empresa" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.contactPerson} / Responsável</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input type="text" value={client.contactName} onChange={e => setClient({...client, contactName: e.target.value})} placeholder="Nome do Responsável" className="w-full pl-10 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{taxes.idNumber}</label>
                <input type="text" value={client.nif} onChange={e => setClient({...client, nif: e.target.value})} placeholder="000.000.000" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.editor.validUntil}</label>
                <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.address}</label>
                <input type="text" value={client.address} onChange={e => setClient({...client, address: e.target.value})} placeholder="Rua, Número, Código Postal, Cidade" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.email}</label>
                <input type="email" value={client.email} onChange={e => setClient({...client, email: e.target.value})} placeholder="cliente@exemplo.com" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Briefcase size={16} className="text-indigo-600" /> {t.editor.itemsTitle}
              </h3>
              <button onClick={addItem} className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-indigo-100 transition-all active:scale-95">
                <Plus size={14} className="inline mr-1" /> {t.add}
              </button>
            </div>
            
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 space-y-4 hover:shadow-md transition-all group">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase ml-1">{t.description}</label>
                       <input type="text" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} placeholder="Ex: Assentamento de mosaico" className="w-full bg-white px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="w-48 space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase ml-1">{t.specialties}</label>
                       <select value={item.category} onChange={e => updateItem(item.id, 'category', e.target.value as Specialty)} className="w-full bg-white px-4 py-3 border border-slate-200 rounded-xl text-xs font-black uppercase focus:ring-2 focus:ring-indigo-500 outline-none">
                         {company.specialties.map(s => (
                           <option key={s} value={s}>{t.specialtyNames[s] || s}</option>
                         ))}
                       </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-24 space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase ml-1">{t.quantity}</label>
                       <input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-full bg-white px-4 py-3 border border-slate-200 rounded-xl text-center font-black" />
                    </div>
                    <div className="w-24 space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase ml-1">{t.unit}</label>
                       <input type="text" value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)} placeholder="m2" className="w-full bg-white px-4 py-3 border border-slate-200 rounded-xl text-center font-bold" />
                    </div>
                    <div className="flex-1 space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase ml-1">{t.price}</label>
                       <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{config.currency}</span>
                         <input type="number" value={item.pricePerUnit} onChange={e => updateItem(item.id, 'pricePerUnit', parseFloat(e.target.value) || 0)} className="w-full bg-white pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-right font-black text-indigo-600" />
                       </div>
                    </div>
                    <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="mt-5 p-3 text-red-400 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NOVA SECCÃO: NOTAS DETALHADAS ABAIXO DOS ITENS */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-4 flex items-center gap-2">
              <AlignLeft size={16} className="text-indigo-600" /> {t.editor.notes}
            </h3>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição Detalhada e Condições Gerais</label>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                placeholder="Descreva aqui informações pormenorizadas sobre a execução, prazos, marcas de materiais, ou qualquer detalhe que o cliente (ou você futuramente) precise saber..." 
                className="w-full px-6 py-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-medium text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[250px] leading-relaxed" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-8 sticky top-24">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-4 flex items-center gap-2">
              <Calculator size={16} className="text-indigo-600" /> {t.editor.totalsTitle}
            </h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.status}</label>
                <select value={status} onChange={e => setStatus(e.target.value as any)} className={`w-full px-5 py-4 border rounded-2xl font-black uppercase tracking-widest outline-none transition-all ${status === 'Approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : status === 'Rejected' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                  <option value="Draft">{t.draft}</option>
                  <option value="Approved">{t.approved}</option>
                  <option value="Rejected">{t.rejected}</option>
                </select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{taxes.vat} (%)</label>
                   <button onClick={() => setIsVatEnabled(!isVatEnabled)} className="flex items-center gap-2 group">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">{isVatEnabled ? 'Ativo' : 'Inativo'}</span>
                     {isVatEnabled ? <CheckSquare size={18} className="text-indigo-600" /> : <Square size={18} className="text-slate-300" />}
                   </button>
                </div>
                <div className={`relative transition-opacity duration-300 ${isVatEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                   <input type="number" value={taxRate} disabled={!isVatEnabled} onChange={e => setTaxRate(parseFloat(e.target.value))} className="w-full px-5 py-4 bg-indigo-50 border border-indigo-100 rounded-2xl font-black text-indigo-700 outline-none" />
                   <span className="absolute right-5 top-1/2 -translate-y-1/2 text-indigo-300 font-black">%</span>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                   <span>{t.subtotal}</span>
                   <span className="text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                {isVatEnabled && (
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
                     <span>{taxes.vat}</span>
                     <span className="text-slate-900">{formatCurrency(tax)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-6 border-t-2 border-indigo-600">
                   <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">{t.total}</span>
                   <span className="text-3xl font-black text-indigo-600 tracking-tighter">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetEditor;
