
import React, { useState, useEffect, useMemo } from 'react';
import { Company, Budget, User, CountryCode, AppNotification } from './types.ts';
import { supabase } from './lib/supabase.ts';
import Dashboard from './components/Dashboard.tsx';
import BudgetEditor from './components/BudgetEditor.tsx';
import CompanySettings from './components/CompanySettings.tsx';
import Analytics from './components/Analytics.tsx';
import Auth from './components/Auth.tsx';
import SubscriptionPage from './components/SubscriptionPage.tsx';
import PaymentManager from './components/PaymentManager.tsx';
import ExpenseManager from './components/ExpenseManager.tsx';
import ProjectDashboard from './components/ProjectDashboard.tsx';
import MasterDashboard from './components/MasterDashboard.tsx';
import NotificationsHub from './components/NotificationsHub.tsx';
import { LayoutDashboard, Settings, PlusCircle, BarChart3, CreditCard, ArrowLeft, ShieldCheck, Bell, X, AlertCircle } from 'lucide-react';
import { COUNTRY_CONFIGS } from './constants.tsx';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [appCountry, setAppCountry] = useState<CountryCode>('PT');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'newBudget' | 'settings' | 'analytics' | 'subscription' | 'budgetHub' | 'master' | 'notifications'>('dashboard');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [hubTab, setHubTab] = useState<'summary' | 'info' | 'payments' | 'expenses'>('summary');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [readNotifications, setReadNotifications] = useState<string[]>([]);
  
  const [showRenewalStrip, setShowRenewalStrip] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Inicialização e Carga de Dados
  useEffect(() => {
    const initApp = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Fix: Moving savedUser declaration outside of if(session) block to fix scope issues at lines 73/74
        const savedUser = localStorage.getItem('atrio_user');
        
        if (session) {
          // Aqui no futuro buscaríamos os dados da 'profile' no Supabase
          // Por enquanto, mantemos a compatibilidade com a estrutura de objetos
          if (savedUser) setCurrentUser(JSON.parse(savedUser));
        }

        const savedCountry = localStorage.getItem('atrio_app_country') as CountryCode;
        if (savedCountry) setAppCountry(savedCountry);

        // Carregar Budgets do Supabase (Exemplo de integração)
        // const { data: budgetsData } = await supabase.from('budgets').select('*');
        // if (budgetsData) setBudgets(budgetsData);

        const savedBudgets = localStorage.getItem('atrio_all_budgets');
        if (savedBudgets) setBudgets(JSON.parse(savedBudgets));

        const savedCompanies = localStorage.getItem('atrio_companies');
        if (savedCompanies && savedUser) {
          const user = JSON.parse(savedUser);
          const companies = JSON.parse(savedCompanies);
          const company = companies.find((c: any) => c.id === user.companyId);
          if (company) setActiveCompany(company);
        }
      } catch (e) {
        console.error("Erro na inicialização:", e);
      } finally {
        setIsAppReady(true);
      }
    };

    initApp();
  }, []);

  // Lógica de Renovação e Assinatura
  useEffect(() => {
    if (activeCompany && isAppReady) {
      const now = new Date();
      if (activeCompany.plan === 'Premium' && activeCompany.subscriptionExpiryDate) {
        const expiry = new Date(activeCompany.subscriptionExpiryDate);
        if (now > expiry) {
          handleUpdateCompany({ ...activeCompany, plan: 'Free', subscriptionExpiryDate: undefined });
          alert("Sua assinatura Premium expirou.");
          setActiveTab('subscription');
        } else {
          const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          setShowRenewalStrip(diffDays <= 3);
        }
      }
    }
  }, [activeCompany?.id, activeCompany?.plan, isAppReady]);

  const config = COUNTRY_CONFIGS[appCountry];
  const t = config.translations;
  const companyBudgets = activeCompany ? budgets.filter(b => b.companyId === activeCompany.id) : [];

  const handleSaveBudget = async (budget: Budget) => {
    const isNew = !budgets.find(b => b.id === budget.id);
    if (activeCompany?.plan === 'Free' && companyBudgets.length >= 3 && isNew) {
      alert(t.limitReached);
      setActiveTab('subscription');
      return;
    }

    const updatedBudgets = isNew ? [...budgets, budget] : budgets.map(b => b.id === budget.id ? budget : b);
    setBudgets(updatedBudgets);
    localStorage.setItem('atrio_all_budgets', JSON.stringify(updatedBudgets));
    
    // Sincronização com Supabase opcional aqui
    // await supabase.from('budgets').upsert(budget);

    setActiveTab('dashboard');
    setEditingBudget(null);
  };

  const handleAuthSuccess = (user: User, company: Company | null, country: CountryCode) => {
    setCurrentUser(user);
    setActiveCompany(company);
    setAppCountry(country);
    localStorage.setItem('atrio_user', JSON.stringify(user));
    localStorage.setItem('atrio_app_country', country);
    
    if (company) {
      const saved = JSON.parse(localStorage.getItem('atrio_companies') || '[]');
      if (!saved.find((c: any) => c.id === company.id)) {
        localStorage.setItem('atrio_companies', JSON.stringify([...saved, company]));
      }
    }

    setShowSplash(true);
    setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => { setShowSplash(false); setIsFadingOut(false); }, 1000);
    }, 2000);
    setActiveTab(user.role === 'Master' ? 'master' : 'dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('atrio_user');
    setCurrentUser(null);
    setActiveCompany(null);
    setActiveTab('dashboard');
  };

  const handleUpdateCompany = (newCompany: Company) => {
    setActiveCompany(newCompany);
    const saved = JSON.parse(localStorage.getItem('atrio_companies') || '[]');
    localStorage.setItem('atrio_companies', JSON.stringify(saved.map((c: any) => c.id === newCompany.id ? newCompany : c)));
  };

  if (!isAppReady) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!currentUser) return <Auth onAuthSuccess={handleAuthSuccess} initialCountry={appCountry} />;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {showRenewalStrip && !activeCompany?.id.includes('MASTER') && (
        <div className="bg-red-600 text-white px-6 py-2.5 flex items-center justify-between sticky top-0 z-[100] shadow-lg">
          <div className="flex items-center gap-3"><AlertCircle size={20} className="animate-pulse" /><p className="text-xs font-black uppercase">Sua assinatura expira em breve!</p></div>
          <button onClick={() => setActiveTab('subscription')} className="bg-white text-red-600 px-4 py-1 rounded-lg text-[10px] font-black uppercase">Renovar Agora</button>
        </div>
      )}

      <div className="flex flex-1">
        {showSplash && (
          <div className={`fixed inset-0 z-[110] bg-slate-900 flex flex-col items-center justify-center transition-opacity duration-1000 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-2xl">
                {activeCompany?.logo ? <img src={activeCompany.logo} className="w-16 h-16 object-contain" /> : <ShieldCheck size={48} className="text-indigo-600" />}
              </div>
              <h1 className="text-white text-3xl font-black uppercase tracking-widest">{activeCompany?.name || 'ÁTRIO'}</h1>
            </div>
          </div>
        )}

        <aside className="w-64 bg-white border-r hidden md:flex flex-col fixed inset-y-0 z-40">
          <div className="p-6 border-b flex items-center gap-3"><div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white"><LayoutDashboard size={20} /></div><span className="font-black text-2xl tracking-tighter">ÁTRIO<span className="text-indigo-600">.</span></span></div>
          <nav className="flex-1 p-4 space-y-1">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}><LayoutDashboard size={20} /> {t.sidebar.dashboard}</button>
            <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}><BarChart3 size={20} /> {t.sidebar.analytics}</button>
            <button onClick={() => setActiveTab('newBudget')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'newBudget' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}><PlusCircle size={20} /> {t.sidebar.newBudget}</button>
            <button onClick={() => setActiveTab('subscription')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'subscription' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}><CreditCard size={20} /> {t.sidebar.subscription}</button>
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}><Settings size={20} /> {t.sidebar.settings}</button>
          </nav>
          <div className="p-4 border-t"><button onClick={handleLogout} className="w-full text-xs font-black text-red-500 uppercase py-3 border border-red-100 rounded-xl hover:bg-red-50">Logout</button></div>
        </aside>

        <main className="flex-1 md:ml-64">
          <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-30">
            <h2 className="font-black text-xs uppercase tracking-widest">{t.sidebar[activeTab] || activeTab}</h2>
            <div className="flex gap-2">
              {(['PT', 'BR', 'ES'] as CountryCode[]).map(c => <button key={c} onClick={() => { setAppCountry(c); localStorage.setItem('atrio_app_country', c); }} className={`w-8 h-8 rounded-lg flex items-center justify-center ${appCountry === c ? 'bg-slate-100 ring-1 ring-slate-200' : 'opacity-40'}`}>{COUNTRY_CONFIGS[c].flag}</button>)}
            </div>
          </header>
          <div className="p-8">
            {activeTab === 'dashboard' && <Dashboard budgets={companyBudgets} onViewBudget={(b) => { setEditingBudget(b); setActiveTab('budgetHub'); }} onNewBudget={() => { setEditingBudget(null); setActiveTab('newBudget'); }} company={activeCompany!} />}
            {activeTab === 'newBudget' && <BudgetEditor company={activeCompany!} onSave={handleSaveBudget} initialData={editingBudget} onCancel={() => setActiveTab('dashboard')} onUpgrade={() => setActiveTab('subscription')} />}
            {activeTab === 'analytics' && <Analytics budgets={companyBudgets} company={activeCompany!} onUpgrade={() => setActiveTab('subscription')} />}
            {activeTab === 'subscription' && <SubscriptionPage company={activeCompany!} onUpgrade={() => handleUpdateCompany({ ...activeCompany!, plan: 'Premium', subscriptionExpiryDate: new Date(Date.now() + 30 * 86400000).toISOString() })} />}
            {activeTab === 'settings' && <CompanySettings company={activeCompany!} user={currentUser} onSave={handleUpdateCompany} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
