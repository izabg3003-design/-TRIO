
import React, { useState, useEffect } from 'react';
import { Company, Budget, User, CountryCode, AppNotification } from './types';
import { supabase } from './lib/supabase';
import Dashboard from './components/Dashboard';
import BudgetEditor from './components/BudgetEditor';
import CompanySettings from './components/CompanySettings';
import Analytics from './components/Analytics';
import Auth from './components/Auth';
import SubscriptionPage from './components/SubscriptionPage';
import PaymentManager from './components/PaymentManager';
import ExpenseManager from './components/ExpenseManager';
import ProjectDashboard from './components/ProjectDashboard';
import MasterDashboard from './components/MasterDashboard';
import NotificationsHub from './components/NotificationsHub';
import { LayoutDashboard, Settings, PlusCircle, BarChart3, CreditCard, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { COUNTRY_CONFIGS } from './constants';

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
  
  const [isAppReady, setIsAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      // Timeout de segurança: Se o Supabase travar por falta de chaves, força a entrada em 1.5s
      const safetyTimeout = setTimeout(() => {
        if (!isAppReady) setIsAppReady(true);
      }, 1500);

      try {
        const localSession = localStorage.getItem('atrio_active_session');
        if (localSession) {
          const { user, company } = JSON.parse(localSession);
          setCurrentUser(user);
          setActiveCompany(company);
          setAppCountry(company.country || 'PT');
          clearTimeout(safetyTimeout);
          setIsAppReady(true);
          return;
        }

        const masterStored = localStorage.getItem('atrio_master_active_session');
        if (masterStored === 'jefersongoes36@gmail.com') {
          const masterUser: User = {
            id: 'master-override',
            email: masterStored,
            companyId: 'master-hq',
            isVerified: true,
            role: 'Master',
            status: 'Active'
          };
          setCurrentUser(masterUser);
          setActiveTab('master');
          clearTimeout(safetyTimeout);
          setIsAppReady(true);
          return;
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;

        if (session) {
          const email = session.user.email?.toLowerCase();
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          const userObj: User = {
            id: session.user.id,
            email: session.user.email!,
            companyId: profile?.company_id || 'pending',
            isVerified: true,
            role: profile?.role || (email === 'jefersongoes36@gmail.com' ? 'Master' : 'User'),
            status: profile?.status || 'Active'
          };
          setCurrentUser(userObj);
          
          if (userObj.companyId !== 'pending') {
            const { data: company } = await supabase.from('companies').select('*').eq('id', userObj.companyId).single();
            if (company) {
              setActiveCompany(company as any);
              setAppCountry(company.country || 'PT');
            }
          }
        }
      } catch (err) {
        console.warn("Resiliência ativada: Ignorando erro de conexão.");
      } finally {
        clearTimeout(safetyTimeout);
        setIsAppReady(true);
      }
    };

    initApp();
  }, []);

  const config = COUNTRY_CONFIGS[appCountry] || COUNTRY_CONFIGS['PT'];
  const t = config.translations;

  const handleSaveBudget = async (budget: Budget) => {
    const companyId = activeCompany?.id || 'master-hq';
    setBudgets(prev => {
      const exists = prev.find(b => b.id === budget.id);
      return exists ? prev.map(b => b.id === budget.id ? budget : b) : [...prev, budget];
    });
    try {
      await supabase.from('budgets').upsert({
        id: budget.id,
        company_id: companyId,
        number: budget.number,
        date: budget.date,
        valid_until: budget.validUntil,
        client: budget.client,
        items: budget.items,
        expenses: budget.expenses || [],
        payments: budget.payments || [],
        notes: budget.notes,
        status: budget.status,
        tax_rate: budget.taxRate,
        is_vat_enabled: budget.isVatEnabled
      });
    } catch (e) {}
    setActiveTab('dashboard');
    setEditingBudget(null);
  };

  const handleAuthSuccess = (user: User, company: Company | null, country: CountryCode) => {
    setCurrentUser(user);
    setActiveCompany(company);
    setAppCountry(country);
    setShowSplash(true);
    setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => { setShowSplash(false); setIsFadingOut(false); }, 1000);
    }, 2000);
    setActiveTab(user.role === 'Master' ? 'master' : 'dashboard');
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    setActiveCompany(null);
    setBudgets([]);
    setActiveTab('dashboard');
    localStorage.removeItem('atrio_master_active_session');
    localStorage.removeItem('atrio_active_session');
    await supabase.auth.signOut().catch(() => {});
  };

  if (!isAppReady) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-indigo-500" size={48} />
      <p className="text-white text-[10px] font-black uppercase tracking-widest italic animate-pulse">Átrio Cloud: Iniciando...</p>
    </div>
  );

  if (!currentUser) return <Auth onAuthSuccess={handleAuthSuccess} initialCountry={appCountry} />;

  const isMaster = currentUser.role === 'Master';
  const fallbackCompany: any = { id: 'master-hq', name: 'ÁTRIO HQ', specialties: [], country: appCountry, plan: 'Premium' };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="flex flex-1">
        {showSplash && (
          <div className={`fixed inset-0 z-[110] bg-slate-900 flex flex-col items-center justify-center transition-opacity duration-1000 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-2xl overflow-hidden p-2">
                {activeCompany?.logo ? <img src={activeCompany.logo} className="w-full h-full object-contain" /> : <ShieldCheck size={48} className="text-indigo-600" />}
              </div>
              <h1 className="text-white text-3xl font-black uppercase tracking-widest">{activeCompany?.name || 'ÁTRIO'}</h1>
            </div>
          </div>
        )}

        <aside className="w-64 bg-white border-r hidden md:flex flex-col fixed inset-y-0 z-40">
          <div className="p-6 border-b flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><LayoutDashboard size={20} /></div>
            <span className="font-black text-2xl tracking-tighter">ÁTRIO<span className="text-indigo-600">.</span></span>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}><LayoutDashboard size={20} /> {t.sidebar.dashboard}</button>
            <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}><BarChart3 size={20} /> {t.sidebar.analytics}</button>
            <button onClick={() => setActiveTab('newBudget')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'newBudget' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}><PlusCircle size={20} /> {t.sidebar.newBudget}</button>
            <button onClick={() => setActiveTab('subscription')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'subscription' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}><CreditCard size={20} /> {t.sidebar.subscription}</button>
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}><Settings size={20} /> {t.sidebar.settings}</button>
            
            {isMaster && (
              <div className="pt-4 mt-4 border-t border-slate-100">
                <p className="px-4 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Admin</p>
                <button onClick={() => setActiveTab('master')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'master' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-50'}`}><ShieldCheck size={20} /> Painel Master</button>
              </div>
            )}
          </nav>
          <div className="p-4 border-t"><button onClick={handleLogout} className="w-full text-xs font-black text-red-500 uppercase py-3 border border-red-100 rounded-xl hover:bg-red-50 transition-colors">Logout</button></div>
        </aside>

        <main className="flex-1 md:ml-64">
          <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-30">
            <h2 className="font-black text-xs uppercase tracking-widest">{t.sidebar[activeTab] || activeTab}</h2>
            <div className="flex gap-2">
              {(['PT', 'BR', 'ES', 'DE', 'CH', 'IT', 'US'] as CountryCode[]).map(c => (
                <button key={c} onClick={() => { setAppCountry(c); }} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${appCountry === c ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 opacity-40 hover:opacity-100'}`}>
                  {COUNTRY_CONFIGS[c]?.flag || '🌐'}
                </button>
              ))}
            </div>
          </header>
          <div className="p-8">
            {activeTab === 'dashboard' && <Dashboard budgets={budgets} onViewBudget={(b) => { setEditingBudget(b); setActiveTab('budgetHub'); }} onNewBudget={() => { setEditingBudget(null); setActiveTab('newBudget'); }} company={activeCompany || fallbackCompany} />}
            {activeTab === 'newBudget' && <BudgetEditor company={activeCompany || fallbackCompany} onSave={handleSaveBudget} initialData={editingBudget} onCancel={() => setActiveTab('dashboard')} onUpgrade={() => setActiveTab('subscription')} />}
            {activeTab === 'analytics' && <Analytics budgets={budgets} company={activeCompany || fallbackCompany} onUpgrade={() => setActiveTab('subscription')} />}
            {activeTab === 'subscription' && <SubscriptionPage company={activeCompany || fallbackCompany} onUpgrade={() => {}} />}
            {activeTab === 'settings' && <CompanySettings company={activeCompany || fallbackCompany} user={currentUser} onSave={() => {}} />}
            {activeTab === 'master' && isMaster && <MasterDashboard />}
            {activeTab === 'notifications' && <NotificationsHub notifications={notifications} isMaster={isMaster} onSync={setNotifications} onMarkAsRead={(id) => setReadNotifications([...readNotifications, id])} readNotifications={readNotifications} company={activeCompany || fallbackCompany} />}
            
            {activeTab === 'budgetHub' && editingBudget && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-black text-xs uppercase tracking-widest">
                    <ArrowLeft size={16} /> {t.hub.back}
                  </button>
                  <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
                    <button onClick={() => setHubTab('summary')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${hubTab === 'summary' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Resumo</button>
                    <button onClick={() => setHubTab('info')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${hubTab === 'info' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Info</button>
                    <button onClick={() => setHubTab('payments')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${hubTab === 'payments' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Pagamentos</button>
                    <button onClick={() => setHubTab('expenses')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${hubTab === 'expenses' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Custos</button>
                  </div>
                </div>
                {hubTab === 'summary' && <ProjectDashboard budget={editingBudget} company={activeCompany || fallbackCompany} />}
                {hubTab === 'info' && <BudgetEditor company={activeCompany || fallbackCompany} onSave={handleSaveBudget} initialData={editingBudget} onCancel={() => setActiveTab('dashboard')} onUpgrade={() => setActiveTab('subscription')} />}
                {hubTab === 'payments' && <PaymentManager budget={editingBudget} company={activeCompany || fallbackCompany} onUpdateBudget={handleSaveBudget} onUpgrade={() => setActiveTab('subscription')} />}
                {hubTab === 'expenses' && <ExpenseManager budget={editingBudget} company={activeCompany || fallbackCompany} onUpdateBudget={handleSaveBudget} onUpgrade={() => setActiveTab('subscription')} />}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
