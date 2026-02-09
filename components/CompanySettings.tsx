
import React, { useState } from 'react';
import { Company, Specialty, User } from '../types';
// Added Sparkles to imports
import { Save, Check, Lock, AlertCircle, Upload, Image as ImageIcon, Hash, ShieldCheck, Crown, BadgeCheck, Sparkles } from 'lucide-react';
import { COUNTRY_CONFIGS } from '../constants';

interface Props {
  company: Company;
  user: User;
  onSave: (company: Company) => void;
}

const CompanySettings: React.FC<Props> = ({ company, user, onSave }) => {
  const [formData, setFormData] = useState<Company>({...company});
  const config = COUNTRY_CONFIGS[company.country];
  const t = config.translations;
  const taxes = config.taxLabels;

  const isFree = company.plan === 'Free';

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({...formData, logo: reader.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSpecialty = (s: Specialty) => {
    const isSelected = formData.specialties.includes(s);
    if (isSelected) {
      setFormData({...formData, specialties: formData.specialties.filter(x => x !== s)});
    } else {
      if (isFree && formData.specialties.length >= 2) {
        alert(t.limitSpecialties);
        return;
      }
      setFormData({...formData, specialties: [...formData.specialties, s]});
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* PAINEL DE IDENTIDADE DIGITAL - EXIBIÇÃO DO ID PERMANENTE E PLANO */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md">
              <ShieldCheck size={32} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-widest">Identidade Digital Átrio</h3>
              <p className="text-indigo-300 text-xs font-bold uppercase tracking-tighter">Dados de licenciamento e identificação global</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box do ID */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all">
              <div className="p-2.5 bg-indigo-600 rounded-lg text-white shadow-lg">
                <Hash size={18} />
              </div>
              <div className="truncate">
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest leading-none mb-1">ID Único Permanente</p>
                <code className="text-sm font-black text-white truncate block">{user.id}</code>
              </div>
            </div>

            {/* Box do Plano */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all">
              <div className={`p-2.5 rounded-lg text-white shadow-lg ${isFree ? 'bg-slate-700' : 'bg-amber-500'}`}>
                {isFree ? <BadgeCheck size={18} /> : <Crown size={18} />}
              </div>
              <div>
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest leading-none mb-1">Plano de Subscrição</p>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-black uppercase tracking-widest ${isFree ? 'text-slate-300' : 'text-amber-400'}`}>
                    {isFree ? t.subscription.basicName : t.subscription.proName}
                  </span>
                  {/* Fixed Sparkles reference by adding it to imports */}
                  {!isFree && <Sparkles size={12} className="text-amber-400 animate-pulse" />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Perfil da Empresa</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Gira a identidade do seu negócio na Átrio.</p>
          </div>
          <button 
            onClick={() => onSave(formData)} 
            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Save size={18} /> {t.save}
          </button>
        </div>

        <div className="p-8 space-y-10">
          <div className="flex flex-col md:flex-row gap-8 items-center">
             <div className="relative group">
                <div className="w-64 h-64 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-400 shadow-inner">
                   {formData.logo ? (
                     <img src={formData.logo} alt="Logo Preview" className="max-w-full max-h-full object-contain p-6 drop-shadow-md" />
                   ) : (
                     <ImageIcon className="text-slate-300" size={64} />
                   )}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-4 rounded-2xl shadow-xl cursor-pointer hover:bg-indigo-700 transition-all active:scale-90 border-4 border-white">
                  <Upload size={22} />
                  <input type="file" onChange={handleLogoUpload} className="hidden" accept="image/*" />
                </label>
             </div>
             <div className="flex-1 space-y-3">
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest">Logótipo da Empresa</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Este logótipo aparecerá nos seus orçamentos PDF, faturas e na tela de boas-vindas ao iniciar sessão. Utilize uma imagem com fundo transparente para melhor resultado.
                </p>
                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 bg-indigo-50 w-fit px-4 py-1.5 rounded-full uppercase tracking-tighter">
                   <AlertCircle size={12} /> Recomendado: PNG/SVG 1024x1024px
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.companyName}</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{taxes.idNumber}</label>
              <input type="text" value={formData.nif} onChange={e => setFormData({...formData, nif: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.address}</label>
              <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.email}</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.phone}</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold" />
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t.specialties}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Selecione os setores em que a sua empresa atua.</p>
            </div>
            {isFree && (
              <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase flex items-center gap-1">
                <AlertCircle size={10} /> {formData.specialties.length}/2 Ativas
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.values(Specialty).map(s => {
              const selected = formData.specialties.includes(s);
              return (
                <button 
                  key={s} 
                  onClick={() => toggleSpecialty(s)} 
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                    selected 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                      : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300'
                  }`}
                >
                  <span className="truncate pr-2">{t.specialtyNames[s] || s}</span>
                  {selected && <Check size={14} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySettings;
