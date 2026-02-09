
import React, { useState } from 'react';
import { supabase } from '../lib/supabase.ts';
import { User, Company, Specialty, CountryCode } from '../types.ts';
import { COUNTRY_CONFIGS } from '../constants.tsx';
import { Mail, Lock, Building, ArrowRight, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (user: User, company: Company | null, country: CountryCode) => void;
  initialCountry: CountryCode;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess, initialCountry }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const config = COUNTRY_CONFIGS[initialCountry];
  const t = config.translations;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          companyId: 'COMP-' + data.user.id.substring(0, 5),
          isVerified: true,
          role: email === 'jefersongoes36@gmail.com' ? 'Master' : 'User',
          status: 'Active'
        };

        onAuthSuccess(user, null, initialCountry);
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Verifique seu email para confirmar a conta!");
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || "Erro na autenticação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* LATERAL ESQUERDA: Imagem e Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2070" 
          alt="Construção Civil" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/90 via-slate-900/60 to-transparent"></div>
        
        <div className="relative z-10 w-full p-16 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-2xl">
              <ShieldCheck size={28} />
            </div>
            <span className="text-3xl font-black text-white tracking-tighter">ÁTRIO<span className="text-indigo-400">.</span></span>
          </div>

          <div className="space-y-10 max-w-lg">
            <div className="space-y-4">
              <h1 className="text-5xl font-black text-white leading-tight tracking-tighter uppercase">
                {t.auth.registerTitle}
              </h1>
              <p className="text-indigo-200 text-lg font-medium opacity-80 leading-relaxed">
                {t.auth.registerSub}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {[
                { title: t.auth.benefit1, desc: t.auth.benefit1Desc },
                { title: t.auth.benefit2, desc: t.auth.benefit2Desc },
                { title: t.auth.benefit3, desc: t.auth.benefit3Desc }
              ].map((benefit, i) => (
                <div key={i} className="flex gap-4 group cursor-default">
                  <div className="shrink-0 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 backdrop-blur-md group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all">
                    <CheckCircle2 size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-black uppercase text-xs tracking-widest mb-1">{benefit.title}</h4>
                    <p className="text-indigo-200/60 text-xs leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">
            <span>SaaS Global</span>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
            <span>Construção Civil</span>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
            <span>ÁTRIO v2.5</span>
          </div>
        </div>
      </div>

      {/* LATERAL DIREITA: Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md space-y-8 animate-in slide-in-from-right-8 duration-700">
          <div className="lg:hidden text-center mb-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl mb-4">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">ÁTRIO<span className="text-indigo-600">.</span></h2>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {mode === 'login' ? t.auth.loginTitle : t.auth.registerTitle}
            </h2>
            <p className="text-slate-500 font-medium">
              {mode === 'login' ? t.auth.loginSub : t.auth.registerSub}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.companyName}</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    required 
                    type="text" 
                    value={companyName} 
                    onChange={e => setCompanyName(e.target.value)} 
                    className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all shadow-sm"
                    placeholder="Nome da sua empresa"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.email}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all shadow-sm"
                  placeholder="exemplo@email.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.password}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              disabled={loading} 
              type="submit" 
              className="w-full bg-indigo-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-950 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {mode === 'login' ? t.auth.btnEnter : t.auth.btnRegister}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-4">
            <button 
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }} 
              className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
            >
              {mode === 'login' ? t.auth.switchRegister : t.auth.switchLogin}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
