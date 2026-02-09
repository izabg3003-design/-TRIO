
import React, { useState } from 'react';
import { supabase } from '../lib/supabase.ts';
import { User, Company, CountryCode, Specialty } from '../types.ts';
import { COUNTRY_CONFIGS } from '../constants.tsx';
import { Mail, Lock, Building, ArrowRight, ShieldCheck, Loader2, CheckCircle2, Smartphone, Copy, Check } from 'lucide-react';

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

  const config = COUNTRY_CONFIGS[initialCountry];
  const t = config.translations;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        
        const isMasterEmail = email.toLowerCase() === 'jefersongoes36@gmail.com';
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();

        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          companyId: profile?.company_id || 'master-bypass',
          isVerified: true,
          role: isMasterEmail ? 'Master' : (profile?.role || 'User'),
          status: profile?.status || 'Active'
        };

        const { data: company } = await supabase.from('companies').select('*').eq('id', user.companyId).single();
        onAuthSuccess(user, company as any, initialCountry);
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;

        if (data.user) {
          const { data: newCompany, error: compError } = await supabase.from('companies').insert({
              name: companyName, email, phone, country: initialCountry, plan: 'Free', specialties: [Specialty.Pedreiro]
            }).select().single();

          if (compError) throw compError;

          const isMaster = email.toLowerCase() === 'jefersongoes36@gmail.com';
          await supabase.from('profiles').insert({
              id: data.user.id, company_id: newCompany.id, role: isMaster ? 'Master' : 'User', status: 'Active'
          });

          setRegisteredData({ id: data.user.id, phone: phone });
          setMode('success');
        }
      }
    } catch (err: any) {
      setError(err.message || "Erro de acesso.");
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'success' && registeredData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-12 space-y-8 animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner"><CheckCircle2 size={48} /></div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Bem-vindo à Átrio!</h2>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ID Único de Acesso</p>
            <code className="text-indigo-600 font-black">{registeredData.id}</code>
            <button onClick={() => { navigator.clipboard.writeText(registeredData.id); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="ml-2 text-slate-300 hover:text-indigo-600">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <button onClick={() => setMode('login')} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">Entrar no Painel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* LADO ESQUERDO: IMAGEM E BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 p-16 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2070" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" alt="Construção" />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 to-slate-900/80"></div>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-xl"><ShieldCheck size={24} /></div>
          <span className="text-2xl font-black text-white tracking-tighter">ÁTRIO<span className="text-indigo-400">.</span></span>
        </div>
        <div className="relative z-10">
          <h1 className="text-5xl font-black text-white uppercase leading-tight tracking-tighter mb-4">Sincronia Global <br/><span className="text-indigo-400">em Nuvem.</span></h1>
          <p className="text-indigo-200 text-lg opacity-80 max-w-md">Gerencie orçamentos com backup em tempo real via Supabase DB.</p>
        </div>
        <div className="relative z-10 text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Powered by Supabase DB</div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 min-h-screen">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-6">
             <span className="text-2xl font-black text-slate-900 tracking-tighter">ÁTRIO<span className="text-indigo-600">.</span></span>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{mode === 'login' ? 'Entrar' : 'Registrar'}</h2>
            <p className="text-slate-500 font-medium">Acesse sua plataforma sincronizada.</p>
          </div>
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100">{error}</div>}
          <form onSubmit={handleAuth} className="space-y-5">
            {mode === 'register' && (
              <>
                <input required type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" placeholder="Nome da Empresa" />
                <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" placeholder="Telemóvel" />
              </>
            )}
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" placeholder="E-mail" />
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" placeholder="Palavra-passe" />
            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all">
              {loading ? <Loader2 className="animate-spin" /> : <>{mode === 'login' ? 'Entrar' : 'Criar Conta'} <ArrowRight size={20} /></>}
            </button>
          </form>
          <div className="text-center">
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">
              {mode === 'login' ? 'Não tem conta? Registre-se' : 'Já tem conta? Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
