
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
    // FORCE READY: Se nada acontecer em 1 segundo, abre o ecrã de login
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 1000);

    const initApp = async () => {
      try {
        const localSession = localStorage.getItem('atrio_active_session');
        if (localSession) {
          const { user, company } = JSON.parse(localSession);
          setCurrentUser(user);
          setActiveCompany(company);
          setAppCountry(company.country || 'PT');
          return;
        }

        const masterStored = localStorage.getItem('atrio_master_active_session');
        if (masterStored === 'jefersongoes36@gmail.com') {
          setCurrentUser({ id: 'master', email: masterStored, companyId: 'master', isVerified: true, role: 'Master', status: 'Active' });
          setActiveTab('master');
          return;
        }

        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          const user = data.session.user;
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          if (profile) {
            setCurrentUser({ id: user.id, email: user.email!, companyId: profile.company_id, isVerified: true, role: profile.role, status: profile.status });
            const { data: comp } = await supabase.from('companies').select('*').eq('id', profile.company_id).single();
            if (comp) {
              setActiveCompany(comp as any);
              setAppCountry(comp.country || 'PT');
            }
          }
        }
      } catch (e) {
        console.warn("Falha no boot silencioso.");
      } finally {
        setIsAppReady(true);
        clearTimeout(timer);
      }
    };

    initApp();
    return () => clearTimeout(timer);
  }, []);

  const handleAuthSuccess = (user: User, company: Company | null, country: CountryCode) => {
    setCurrentUser(user);
    setActiveCompany(company);
    setAppCountry(country);
    setShowSplash(true);
    setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => { setShowSplash(false); setIsFadingOut(false); }, 1000);
    }, 1500);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveCompany(null);
    localStorage.removeItem('atrio_active_session');
    localStorage.removeItem('atrio_master_active_session');
    setIsAppReady(true);
  };

  const config = COUNTRY_CONFIGS[appCountry] || COUNTRY_CONFIGS['PT'];
  const t = config.translations;

  if (!isAppReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
        <h1 className="text-white text-xl font-black uppercase tracking-widest italic animate-pulse">Átrio Cloud</h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Sincronizando Ambiente Profissional...</p>
      </div>
    );
  }

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
            {activeTab === 'newBudget' && <BudgetEditor company={activeCompany || fallbackCompany} onSave={(b) => { setBudgets([...budgets, b]); setActiveTab('dashboard'); }} initialData={editingBudget} onCancel={() => setActiveTab('dashboard')} onUpgrade={() => setActiveTab('subscription')} />}
            {activeTab === 'analytics' && <Analytics budgets={budgets} company={activeCompany || fallbackCompany} onUpgrade={() => setActiveTab('subscription')} />}
            {activeTab === 'subscription' && <SubscriptionPage company={activeCompany || fallbackCompany} onUpgrade={() => {}} />}
            {activeTab === 'settings' && <CompanySettings company={activeCompany || fallbackCompany} user={currentUser} onSave={() => {}} />}
            {activeTab === 'master' && isMaster && <MasterDashboard />}
            {activeTab === 'notifications' && <NotificationsHub notifications={notifications} isMaster={isMaster} onSync={setNotifications} onMarkAsRead={(id) => setReadNotifications([...readNotifications, id])} readNotifications={readNotifications} company={activeCompany || fallbackCompany} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
