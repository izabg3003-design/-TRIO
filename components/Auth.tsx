
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Company, CountryCode, Specialty } from '../types';
import { COUNTRY_CONFIGS } from '../constants';
import { Mail, Lock, Building, ArrowRight, ShieldCheck, Loader2, CheckCircle2, Copy, Check, AlertTriangle, Zap } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (user: User, company: Company | null, country: CountryCode) => void;
  initialCountry: CountryCode;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess, initialCountry }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'success'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredData, setRegisteredData] = useState<{id: string, phone: string} | null>(null);
  const [copied, setCopied] = useState(false);
  const [showEmergencyBypass, setShowEmergencyBypass] = useState(false);

  const config = COUNTRY_CONFIGS[initialCountry];
  const t = config.translations;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowEmergencyBypass(false);

    try {
      if (mode === 'login') {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        
        if (authError) {
          if (authError.message.includes('rate limit') || authError.status === 429) {
            setShowEmergencyBypass(true);
            setLoading(false);
            return;
          }
          throw authError;
        }
        
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          companyId: profile?.company_id || 'pending',
          isVerified: true,
          role: profile?.role || 'User',
          status: profile?.status || 'Active'
        };

        let company = null;
        if (user.companyId !== 'pending') {
          const { data: compData } = await supabase.from('companies').select('*').eq('id', user.companyId).single();
          company = compData;
        }
        onAuthSuccess(user, company as any, initialCountry);

      } else {
        // MODO REGISTO
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        
        if (signUpError) {
           // Se o servidor de email/registo estiver bloqueado (Rate Limit)
           if (signUpError.message.includes('rate limit') || signUpError.status === 429) {
             setShowEmergencyBypass(true);
             setLoading(false);
             return;
           }
           throw signUpError;
        }

        if (data.user) {
          const { data: newCompany, error: compError } = await supabase.from('companies').insert({
              name: companyName, email, phone, country: initialCountry, plan: 'Free', specialties: [Specialty.Pedreiro]
            }).select().single();

          if (compError) throw compError;
          await supabase.from('profiles').insert({
              id: data.user.id, company_id: newCompany.id, role: email.toLowerCase() === 'jefersongoes36@gmail.com' ? 'Master' : 'User', status: 'Active'
          });
          setRegisteredData({ id: data.user.id, phone: phone });
          setMode('success');
        }
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const executeEmergencyBypass = async () => {
    setLoading(true);
    const emergencyId = `emergency-${Math.random().toString(36).substr(2, 9)}`;
    const emergencyCompanyId = `comp-${Math.random().toString(36).substr(2, 9)}`;

    const user: User = { 
      id: emergencyId, 
      email: email || 'usuario@emergencia.com', 
      companyId: emergencyCompanyId, 
      isVerified: true, 
      role: email.toLowerCase() === 'jefersongoes36@gmail.com' ? 'Master' : 'User', 
      status: 'Active' 
    };

    const company: Company = {
      id: emergencyCompanyId,
      name: companyName || 'Empresa Emergência',
      email: email || 'empresa@emergencia.com',
      logo: '',
      nif: '',
      address: '',
      phone: phone || '',
      specialties: [Specialty.Pedreiro],
      plan: 'Free',
      country: initialCountry
    };

    // Tenta salvar na DB mesmo com bypass de Auth
    try {
      await supabase.from('companies').insert({
        id: emergencyCompanyId,
        name: company.name,
        email: company.email,
        phone: company.phone,
        country: initialCountry,
        plan: 'Free'
      });
      await supabase.from('profiles').insert({
        id: emergencyId,
        company_id: emergencyCompanyId,
        role: user.role,
        status: 'Active'
      });
    } catch (e) {
      console.warn("Offline fallback mode.");
    }

    // Salva sessão local para persistência
    localStorage.setItem('atrio_emergency_session', JSON.stringify({ user, company }));
    onAuthSuccess(user, company, initialCountry);
    setLoading(false);
  };

  if (mode === 'success' && registeredData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-12 space-y-8 animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner"><CheckCircle2 size={48} /></div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900">Conta Criada!</h2>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ID da sua Plataforma</p>
            <code className="text-indigo-600 font-black">{registeredData.id}</code>
            <button onClick={() => { navigator.clipboard.writeText(registeredData.id); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="ml-2 text-slate-300 hover:text-indigo-600 transition-colors">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <button onClick={() => setMode('login')} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all">Entrar no Painel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 p-16 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2070" className="w-full h-full object-cover opacity-50 grayscale" alt="Work" />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/95 to-slate-900/90"></div>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-xl"><ShieldCheck size={24} /></div>
          <span className="text-2xl font-black text-white tracking-tighter">ÁTRIO<span className="text-indigo-400">.</span></span>
        </div>
        <div className="relative z-10">
          <h1 className="text-6xl font-black text-white uppercase leading-tight tracking-tighter mb-4 italic">Gestão PRO <br/><span className="text-indigo-400">Sem Bloqueios.</span></h1>
          <p className="text-indigo-200 text-lg opacity-80 max-w-md">Orçamentos, custos e pagamentos em uma plataforma SaaS robusta.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 min-h-screen">
        <div className="w-full max-w-md space-y-8 animate-in slide-in-from-right-4 duration-700">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase italic">{mode === 'login' ? 'Entrar' : 'Novo Registo'}</h2>
            <p className="text-slate-500 font-medium">Configure a sua área profissional em segundos.</p>
          </div>

          {showEmergencyBypass && (
            <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-3xl space-y-4 animate-in zoom-in duration-300">
               <div className="flex items-center gap-3 text-amber-700">
                 <AlertTriangle size={24} />
                 <span className="font-black uppercase text-xs tracking-widest">Limite de Tráfego Atingido</span>
               </div>
               <p className="text-[11px] text-amber-800 font-bold leading-tight uppercase">
                 O servidor bloqueou novas contas/logins temporariamente para evitar spam. Deseja forçar o acesso em modo de emergência?
               </p>
               <button 
                onClick={executeEmergencyBypass}
                className="w-full bg-amber-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
               >
                 <Zap size={14} /> Ativar Modo de Emergência
               </button>
            </div>
          )}

          {error && !showEmergencyBypass && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {mode === 'register' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Empresa</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input required type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600 transition-all" placeholder="Ex: Construções Elite" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telemóvel</label>
                  <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600 transition-all" placeholder="Contacto" />
                </div>
              </>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600 transition-all" placeholder="exemplo@mail.com" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Palavra-passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600 transition-all" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all active:scale-95 group">
              {loading ? <Loader2 className="animate-spin" /> : <>{mode === 'login' ? 'Entrar na Plataforma' : 'Criar Conta Agora'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>
          <div className="text-center pt-4">
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setShowEmergencyBypass(false); }} className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:text-indigo-800 transition-colors">
              {mode === 'login' ? 'Ainda não tem conta? Registe-se' : 'Já tem conta? Faça Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
