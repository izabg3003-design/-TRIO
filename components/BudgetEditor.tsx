
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
    const newItem: BudgetItem = { 
      id: `item_${Math.random().toString(36).substr(2, 9)}`, 
      description: '', 
      quantity: 1, 
      unit: 'un', 
      pricePerUnit: 0, 
      category: company.specialties[0] || Specialty.Outro 
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof BudgetItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleExportPDF = async () => {
    if (items.length === 0) {
      alert("Adicione itens antes de exportar.");
      return;
    }

    setIsGeneratingPDF(true);

    const budgetData: Budget = {
      ...initialData!,
      id: initialData?.id || `bgt_${Math.random().toString(36).substr(2, 9)}`,
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
        const opt = {
          margin: 0,
          filename: `Orcamento_${budgetData.number}.pdf`,
          image: { type: 'jpeg', quality: 1.0 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        // @ts-ignore
        await html2pdf().set(opt).from(element).save();
      } catch (err) {
        alert("Erro ao gerar PDF.");
      } finally {
        reactRoot.unmount();
        setIsGeneratingPDF(false);
      }
    }, 1500);
  };

  const validateAndSave = () => {
    onSave({
      ...initialData!,
      id: initialData?.id || `bgt_${Math.random().toString(36).substr(2, 9)}`,
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
          <button onClick={handleExportPDF} disabled={isGeneratingPDF} className={`hidden sm:flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 ${isGeneratingPDF ? 'opacity-70 cursor-not-allowed' : ''}`}>
            {isGeneratingPDF ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isGeneratingPDF ? 'A Gerar PDF...' : t.export}
          </button>
          <button onClick={validateAndSave} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2">
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{taxes.idNumber}</label>
                <input type="text" value={client.nif} onChange={e => setClient({...client, nif: e.target.value})} placeholder="000.000.000" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.address}</label>
                <input type="text" value={client.address} onChange={e => setClient({...client, address: e.target.value})} placeholder="Rua, Número, Código Postal, Cidade" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Briefcase size={16} className="text-indigo-600" /> {t.editor.itemsTitle}
              </h3>
              <button onClick={addItem} className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl uppercase tracking-widest">
                <Plus size={14} className="inline mr-1" /> {t.add}
              </button>
            </div>
            
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 space-y-4">
                  <div className="flex gap-4">
                    <input type="text" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} placeholder="Descrição" className="flex-1 bg-white px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold" />
                    <input type="number" value={item.pricePerUnit} onChange={e => updateItem(item.id, 'pricePerUnit', parseFloat(e.target.value) || 0)} className="w-32 bg-white px-4 py-3 border border-slate-200 rounded-xl text-right font-black" />
                    <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-red-400 p-2"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-4">
              <AlignLeft size={16} className="text-indigo-600 inline mr-2" /> {t.editor.notes}
            </h3>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas..." className="w-full px-6 py-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] min-h-[150px]" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-8 sticky top-24">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-4">
              <Calculator size={16} className="text-indigo-600 inline mr-2" /> Totais
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-black uppercase">
                 <span>Subtotal</span>
                 <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center pt-6 border-t-2 border-indigo-600">
                 <span className="text-xs font-black text-indigo-600 uppercase">Total</span>
                 <span className="text-3xl font-black text-indigo-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetEditor;
