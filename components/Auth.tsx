
import React, { useState, useEffect, useMemo } from 'react';
import { User, Company, Specialty, CountryCode } from '../types';
import { COUNTRY_CONFIGS } from '../constants';
import { 
  Mail, 
  Lock, 
  Building, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  PieChart, 
  Wallet, 
  Calculator,
  History,
  Briefcase,
  Ban,
  AlertCircle,
  AlertTriangle,
  Smartphone,
  Hash,
  BadgeCheck
} from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (user: User, company: Company | null, country: CountryCode) => void;
  initialCountry: CountryCode;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess, initialCountry }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(initialCountry);
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Pre-generate IDs for visualization during registration
  const generatedIds = useMemo(() => ({
    user: crypto.randomUUID(),
    company: crypto.randomUUID()
  }), [mode === 'register']);

  useEffect(() => {
    const saved = localStorage.getItem('atrio_app_country') as CountryCode;
    if (saved) setSelectedCountry(saved);
  }, []);

  const handleCountryChange = (code: CountryCode) => {
    setSelectedCountry(code);
    localStorage.setItem('atrio_app_country', code);
  };

  const config = COUNTRY_CONFIGS[selectedCountry];
  const t = config.translations;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email === 'jefersongoes36@gmail.com' && password === 'Izarelle30*') {
      const masterUser: User = {
        id: 'MASTER-ADMIN',
        email: email,
        companyId: 'MASTER-COMP',
        isVerified: true,
        role: 'Master',
        status: 'Active'
      };
      onAuthSuccess(masterUser, null, selectedCountry);
      return;
    }

    const savedUsersRaw = localStorage.getItem('atrio_all_users');
    const users = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (user) {
      if (user.status === 'Blocked') {
        setError('Esta conta foi bloqueada permanentemente pelo administrador.');
        return;
      }
      if (user.status === 'Suspended') {
        setError('Esta conta está suspensa temporariamente. Contacte o suporte.');
        return;
      }
      if (!user.isVerified) { setMode('verify'); return; }

      const companiesRaw = localStorage.getItem('atrio_companies');
      const companies = companiesRaw ? JSON.parse(companiesRaw) : [];
      const company = companies.find((c: any) => c.id === user.companyId);
      
      if (company) onAuthSuccess(user, company, selectedCountry);
      else setError('Erro ao localizar empresa. Contacte o suporte.');
    } else setError('Credenciais inválidas ou conta inexistente.');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = { 
      id: generatedIds.user, 
      email, 
      password, 
      companyId: generatedIds.company, 
      isVerified: false,
      role: 'User',
      status: 'Active'
    };
    const newCompany: Company = {
      id: generatedIds.company, 
      name: companyName, 
      logo: 'https://picsum.photos/seed/' + Math.random() + '/200/200',
      nif: '', 
      address: '', 
      email: email, 
      phone: phone, 
      specialties: [Specialty.Pedreiro], 
      plan: 'Free', 
      country: selectedCountry
    };
    const savedUsersRaw = localStorage.getItem('atrio_all_users');
    const users = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
    localStorage.setItem('atrio_all_users', JSON.stringify([...users, newUser]));
    const companiesRaw = localStorage.getItem('atrio_companies');
    const companies = companiesRaw ? JSON.parse(companiesRaw) : [];
    localStorage.setItem('atrio_companies', JSON.stringify([...companies, newCompany]));
    setMode('verify');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode === '1234') {
      const savedUsersRaw = localStorage.getItem('atrio_all_users');
      const users = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
      const updatedUsers = users.map((u: User) => u.email === email ? { ...u, isVerified: true } : u);
      localStorage.setItem('atrio_all_users', JSON.stringify(updatedUsers));
      const user = updatedUsers.find((u: User) => u.email === email);
      const companiesRaw = localStorage.getItem('atrio_companies');
      const companies = companiesRaw ? JSON.parse(companiesRaw) : [];
      const company = companies.find((c: Company) => c.id === user.companyId);
      onAuthSuccess(user!, company!, selectedCountry);
    } else setError('Código de verificação inválido.');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-center p-12 xl:p-20 bg-indigo-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40 mix-blend-luminosity" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2070")' }}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/95 via-indigo-950/80 to-indigo-900/40"></div>
        <div className="relative z-10 space-y-8 max-w-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-950 shadow-2xl"><svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="2.5"><path d="M3 21h18M3 7v14M21 7v14M12 3l9 4-9 4-9-4 9-4z" /></svg></div>
            <span className="text-4xl font-black uppercase tracking-tighter">ÁTRIO<span className="text-indigo-400">.</span></span>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl xl:text-6xl font-black leading-[1.05] drop-shadow-2xl">
              {selectedCountry === 'PT' || selectedCountry === 'BR' ? 'Domine os seus ' : 
               selectedCountry === 'ES' ? 'Domina tus ' : 
               selectedCountry === 'IT' ? 'Domina i tuoi ' : 'Master your '}
              <span className="text-indigo-300">
                {selectedCountry === 'PT' || selectedCountry === 'BR' ? 'orçamentos.' : 
                 selectedCountry === 'ES' ? 'presupuestos.' : 
                 selectedCountry === 'DE' || selectedCountry === 'CH' ? 'Angebote.' : 
                 selectedCountry === 'IT' ? 'preventivi.' : 'estimates.'}
              </span>
            </h1>
            <p className="text-lg xl:text-xl text-indigo-100/90 font-medium">Software Professional de Gestão para Construção Civil em todo o mundo.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
                  {i === 1 ? <FileText size={18} /> : i === 2 ? <PieChart size={18} /> : i === 3 ? <Wallet size={18} /> : i === 4 ? <Calculator size={18} /> : i === 5 ? <History size={18} /> : <Briefcase size={18} />}
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight">{t.auth[`benefit${i}`]}</p>
                  <p className="text-xs text-indigo-200/70">{t.auth[`benefit${i}Desc`]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 animate-in zoom-in duration-500">
          <div className="mb-8 p-1 bg-slate-100 rounded-2xl flex flex-wrap gap-1 justify-center">
            {(Object.keys(COUNTRY_CONFIGS) as CountryCode[]).map(code => (
              <button key={code} onClick={() => handleCountryChange(code)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${selectedCountry === code ? 'bg-white shadow-md scale-110' : 'opacity-60 grayscale'}`}>{COUNTRY_CONFIGS[code].flag}</button>
            ))}
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-shake">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2">{mode === 'login' ? t.auth.loginTitle : mode === 'register' ? t.auth.registerTitle : t.auth.verifyTitle}</h2>
            <p className="text-slate-500 font-medium text-sm">{mode === 'login' ? t.auth.loginSub : mode === 'register' ? t.auth.registerSub : t.auth.verifySub}</p>
          </div>
          {mode === 'verify' ? (
            <form onSubmit={handleVerify} className="space-y-6">
              <input type="text" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} placeholder="1234" className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-center text-4xl font-black tracking-[0.5em]" />
              <button type="submit" className="w-full bg-indigo-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest">{t.auth.btnVerify}</button>
            </form>
          ) : (
            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-5">
              {mode === 'register' && (
                <>
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg text-indigo-400 shadow-sm"><Hash size={14} /></div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ID Antecipado</p>
                        <code className="text-[10px] font-black text-indigo-600">{generatedIds.user.substring(0,18)}...</code>
                      </div>
                    </div>
                    <BadgeCheck className="text-indigo-600" size={18} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.companyName}</label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} required className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-semibold outline-none focus:ring-2 focus:ring-indigo-600" placeholder="Nome da sua Empresa" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telemóvel</label>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-semibold outline-none focus:ring-2 focus:ring-indigo-600" placeholder="+351 9xx xxx xxx" />
                    </div>
                  </div>
                </>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.email}</label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-semibold outline-none focus:ring-2 focus:ring-indigo-600" placeholder="seu@email.com" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.password}</label>
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-semibold outline-none focus:ring-2 focus:ring-indigo-600" />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest mt-4 shadow-xl shadow-indigo-100 hover:bg-indigo-950 transition-all active:scale-95">{mode === 'login' ? t.auth.btnEnter : t.auth.btnRegister}</button>
              <div className="pt-8 text-center border-t border-slate-50 mt-4">
                <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-indigo-600 font-black hover:underline text-sm">{mode === 'login' ? t.auth.switchRegister : t.auth.switchLogin}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
