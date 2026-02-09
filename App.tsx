
import React, { useState, useEffect, useMemo } from 'react';
import { Company, Budget, User, CountryCode, AppNotification } from './types.ts';
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

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('atrio_user');
      const savedBudgets = localStorage.getItem('atrio_all_budgets');
      const savedCompanies = localStorage.getItem('atrio_companies');
      const savedCountry = localStorage.getItem('atrio_app_country') as CountryCode;
      const savedNotifications = localStorage.getItem('atrio_global_notifications');
      const savedRead = localStorage.getItem('atrio_read_notifications');
      
      if (savedCountry) setAppCountry(savedCountry);
      if (savedRead) setReadNotifications(JSON.parse(savedRead));

      if (savedNotifications) {
        const allNotes = JSON.parse(savedNotifications) as AppNotification[];
        const now = new Date();
        const validNotes = allNotes.filter(n => new Date(n.expiresAt) > now);
        setNotifications(validNotes);
      }

      if (savedUser) {
        const user = JSON.parse(savedUser) as User;
        if (user.role === 'Master') {
          setCurrentUser(user);
          setActiveTab('master');
        } else {
          setCurrentUser(user);
          if (savedCompanies) {
            const companies = JSON.parse(savedCompanies) as Company[];
            const company = companies.find(c => c.id === user.companyId);
            if (company) {
              setActiveCompany(company);
            }
          }
        }
      }
      if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
    } catch (e) {
      console.error("Erro ao carregar dados do localStorage", e);
    }
    setIsAppReady(true);
  }, []);

  useEffect(() => {
    if (activeCompany && isAppReady) {
      const now = new Date();
      
      if (activeCompany.plan === 'Premium' && activeCompany.subscriptionExpiryDate) {
        const expiry = new Date(activeCompany.subscriptionExpiryDate);
        
        if (now > expiry) {
          const downgradedCompany: Company = {
            ...activeCompany,
            plan: 'Free',
            subscriptionExpiryDate: undefined
          };
          
          handleUpdateCompany(downgradedCompany);
          alert("Sua assinatura Premium expirou. Sua conta retornou ao plano Básico.");
          setActiveTab('subscription');
          return;
        }

        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 3 && diffDays >= 0) {
          const lastDismiss = localStorage.getItem(`atrio_renewal_dismiss_${activeCompany.id}`);
          const SIX_HOURS = 6 * 60 * 60 * 1000;
          if (!lastDismiss || (now.getTime() - parseInt(lastDismiss)) > SIX_HOURS) {
            setShowRenewalStrip(true);
          }
        } else {
          setShowRenewalStrip(false);
        }
      }
    }
  }, [activeCompany?.id, activeCompany?.plan, isAppReady]);

  useEffect(() => {
    if (isAppReady) localStorage.setItem('atrio_all_budgets', JSON.stringify(budgets));
  }, [budgets, isAppReady]);

  const isMaster = currentUser?.role === 'Master';
  const config = COUNTRY_CONFIGS[appCountry];
  const t = config.translations;
  const companyBudgets = activeCompany ? budgets.filter(b => b.companyId === activeCompany.id) : [];

  const relevantNotifications = useMemo(() => {
    if (isMaster) return notifications;
    if (!activeCompany) return [];
    return notifications.filter(n => 
      n.target === 'All' || 
      (n.target === 'Premium' && activeCompany.plan === 'Premium') ||
      (n.target === 'Free' && activeCompany.plan === 'Free')
    );
  }, [notifications, activeCompany?.plan, isMaster]);

  const unreadCount = useMemo(() => {
    if (isMaster) return 0;
    return relevantNotifications.filter(n => !readNotifications.includes(n.id)).length;
  }, [relevantNotifications, readNotifications, isMaster]);

  const handleDismissRenewalStrip = () => {
    setShowRenewalStrip(false);
    if (activeCompany) {
      localStorage.setItem(`atrio_renewal_dismiss_${activeCompany.id}`, Date.now().toString());
    }
  };

  const handleCountrySwitch = (code: CountryCode) => {
    setAppCountry(code);
    localStorage.setItem('atrio_app_country', code);
  };

  const handleSaveBudget = (budget: Budget) => {
    const isNew = !prevBudgets().find(b => b.id === budget.id);
    if (activeCompany?.plan === 'Free' && companyBudgets.length >= 3 && isNew) {
      alert(t.limitReached + ": " + t.subscription.features.budgets3);
      setActiveTab('subscription');
      return;
    }
    setBudgets(prev => {
      const exists = prev.find(b => b.id === budget.id);
      if (exists) return prev.map(b => b.id === budget.id ? budget : b);
      return [...prev, { ...budget, companyId: activeCompany!.id }];
    });
    setActiveTab('dashboard');
    setEditingBudget(null);
  };

  const handleUpdateBudget = (budget: Budget) => {
    setBudgets(prev => prev.map(b => b.id === budget.id ? budget : b));
  };

  const prevBudgets = () => {
    const saved = localStorage.getItem('atrio_all_budgets');
    return saved ? JSON.parse(saved) as Budget[] : [];
  };

  const handleAuthSuccess = (user: User, company: Company | null, country: CountryCode) => {
    setCurrentUser(user);
    if (user.role === 'Master') {
      setActiveTab('master');
    } else {
      setActiveCompany(company);
      setActiveTab('dashboard');
    }
    
    setAppCountry(country);
    localStorage.setItem('atrio_user', JSON.stringify(user));
    localStorage.setItem('atrio_app_country', country);
    
    if (company) {
      const savedCompaniesRaw = localStorage.getItem('atrio_companies');
      const savedCompanies = savedCompaniesRaw ? JSON.parse(savedCompaniesRaw) : [];
      if (!savedCompanies.find((c: Company) => c.id === company.id)) {
        localStorage.setItem('atrio_companies', JSON.stringify([...savedCompanies, company]));
      }
    }

    setShowSplash(true);
    setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setShowSplash(false);
        setIsFadingOut(false);
      }, 1000); 
    }, 2800);
  };

  const handleLogout = () => {
    localStorage.removeItem('atrio_user');
    setCurrentUser(null);
    setActiveCompany(null);
    setActiveTab('dashboard');
  };

  const handleUpdateCompany = (newCompany: Company) => {
    setActiveCompany(newCompany);
    const savedCompaniesRaw = localStorage.getItem('atrio_companies');
    if (savedCompaniesRaw) {
      const companies = JSON.parse(savedCompaniesRaw) as Company[];
      const updated = companies.map(c => c.id === newCompany.id ? newCompany : c);
      localStorage.setItem('atrio_companies', JSON.stringify(updated));
    }
  };

  const handleSyncNotifications = (newNotes: AppNotification[]) => {
    setNotifications(newNotes);
    localStorage.setItem('atrio_global_notifications', JSON.stringify(newNotes));
  };

  const handleMarkAsRead = (id: string) => {
    if (!readNotifications.includes(id)) {
      const updated = [...readNotifications, id];
      setReadNotifications(updated);
      localStorage.setItem('atrio_read_notifications', JSON.stringify(updated));
    }
  };

  if (!isAppReady) return null;
  if (!currentUser || (!isMaster && !activeCompany)) return <Auth onAuthSuccess={handleAuthSuccess} initialCountry={appCountry} />;

  const displayCompany: Company | null = activeCompany ? {
    ...activeCompany,
    country: appCountry
  } : null;

  const isFree = displayCompany?.plan === 'Free';
  const usageCount = companyBudgets.length;
  const usagePercent = isFree ? Math.min((usageCount / 3) * 100, 100) : 100;
  const isPremiumPlan = displayCompany?.plan === 'Premium';

  const openBudgetHub = (budget: Budget, initialSubTab: 'summary' | 'info' | 'payments' | 'expenses' = 'summary') => {
    if (budget.status === 'Draft' && initialSubTab !== 'info') {
       initialSubTab = 'info';
    }
    if (!isPremiumPlan && (initialSubTab === 'payments' || initialSubTab === 'expenses' || initialSubTab === 'summary')) {
      const approvedBudgets = companyBudgets.filter(b => b.status === 'Approved');
      const budgetIndex = approvedBudgets.findIndex(b => b.id === budget.id);
      if (budgetIndex >= 3 && budget.status === 'Approved') {
        alert(t.limitReached + ": " + (initialSubTab === 'payments' ? t.payments.limitFree : t.expenses.limitFree));
        setActiveTab('subscription');
        return;
      }
    }
    setEditingBudget(budget);
    setHubTab(initialSubTab);
    setActiveTab('budgetHub');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {showRenewalStrip && !isMaster && (
        <div className="bg-red-600 text-white px-6 py-2.5 flex items-center justify-between animate-in slide-in-from-top duration-500 z-[100] shadow-lg sticky top-0">
          <div className="flex items-center gap-3">
             <AlertCircle size={20} className="animate-pulse" />
             <p className="text-xs font-black uppercase tracking-widest leading-none">
               {t.renewalAlert.replace('{days}', (activeCompany?.subscriptionExpiryDate ? Math.max(0, Math.ceil((new Date(activeCompany.subscriptionExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 3).toString())}
             </p>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setActiveTab('subscription')} className="bg-white text-red-600 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors shadow-sm">
               Renovar Agora
             </button>
             <button onClick={handleDismissRenewalStrip} className="p-1 hover:bg-black/10 rounded-full transition-colors">
               <X size={18} />
             </button>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {showSplash && (
          <div className={`fixed inset-0 z-[110] bg-slate-900 flex flex-col items-center justify-center transition-opacity duration-1000 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
            <div className="flex flex-col items-center gap-10 animate-in zoom-in-90 duration-1000">
              <div className="w-80 h-80 bg-white p-6 rounded-[3rem] shadow-[0_0_80px_rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden ring-12 ring-white/5 animate-pulse relative group">
                  {isMaster ? (
                    <ShieldCheck size={120} className="text-indigo-600 drop-shadow-2xl" />
                  ) : (
                    <img src={activeCompany?.logo} alt={activeCompany?.name} className="max-w-full max-h-full object-contain drop-shadow-2xl" />
                  )}
              </div>
              <div className="text-center space-y-3">
                <p className="text-indigo-400 font-black text-xs uppercase tracking-[0.8em]">{t.hub.welcome}</p>
                <h1 className="text-white text-5xl font-black uppercase tracking-tighter">{isMaster ? 'Master Control' : activeCompany?.name}</h1>
              </div>
            </div>
          </div>
        )}

        <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed inset-y-0 shadow-xl z-40">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab(isMaster ? 'master' : 'dashboard')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2.5"><path d="M3 21h18M3 7v14M21 7v14M12 3l9 4-9 4-9-4 9-4z" /></svg>
            </div>
            <span className="font-black text-2xl tracking-tighter">ÁTRIO<span className="text-indigo-600">.</span></span>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {isMaster ? (
              <>
                <button onClick={() => setActiveTab('master')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'master' ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}><ShieldCheck size={20} /> Master Control</button>
                <button onClick={() => setActiveTab('notifications')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'notifications' ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}><Bell size={20} /> Notificações</button>
              </>
            ) : (
              <>
                <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}><LayoutDashboard size={20} /> {t.sidebar.dashboard}</button>
                <button onClick={() => setActiveTab('notifications')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === 'notifications' ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-3"><Bell size={20} /> {t.notifications.title}</div>
                  {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">{unreadCount}</span>}
                </button>
                <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}><BarChart3 size={20} /> {t.sidebar.analytics}</button>
                <button onClick={() => setActiveTab('newBudget')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'newBudget' ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}><PlusCircle size={20} /> {t.sidebar.newBudget}</button>
                <button onClick={() => setActiveTab('subscription')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'subscription' ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}><CreditCard size={20} /> {t.sidebar.subscription}</button>
                <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}><Settings size={20} /> {t.sidebar.settings}</button>
              </>
            )}
          </nav>
          
          <div className="p-4 border-t space-y-4">
            {!isMaster && isFree && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                  <span>{t.usageBudgets}</span>
                  <span className={usageCount >= 3 ? 'text-red-500' : ''}>{usageCount}/3</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${usageCount >= 3 ? 'bg-red-500' : 'bg-indigo-600'}`} style={{ width: `${usagePercent}%` }}></div>
                </div>
              </div>
            )}
            <div className="bg-slate-900 p-4 rounded-2xl shadow-xl flex items-center justify-between">
              <div className="truncate">
                <p className="text-[10px] font-black text-slate-500 uppercase">{isMaster ? 'Super Admin' : displayCompany?.plan}</p>
                <p className="text-xs font-black text-white truncate">{isMaster ? 'Atrio Master' : displayCompany?.name}</p>
              </div>
              <button onClick={handleLogout} className="text-red-400 p-2 hover:bg-red-400/10 rounded-lg"><X size={18} /></button>
            </div>
          </div>
        </aside>

        <main className="flex-1 md:ml-64">
          <header className="h-16 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-8 sticky top-0 z-30">
            <h2 className="font-black text-slate-800 uppercase tracking-[0.2em] text-xs">
              {isMaster ? 'Master Control' : (t.sidebar[activeTab] || activeTab)}
            </h2>
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
               {(Object.keys(COUNTRY_CONFIGS) as CountryCode[]).map(code => (
                 <button key={code} onClick={() => handleCountrySwitch(code)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${appCountry === code ? 'bg-white shadow-sm' : 'opacity-40 grayscale'}`}>{COUNTRY_CONFIGS[code].flag}</button>
               ))}
            </div>
          </header>
          <div className="p-8">
            {activeTab === 'master' && <MasterDashboard />}
            {activeTab === 'notifications' && (
              <NotificationsHub 
                notifications={relevantNotifications} 
                isMaster={isMaster} 
                onSync={handleSyncNotifications}
                onMarkAsRead={handleMarkAsRead}
                readNotifications={readNotifications}
                company={displayCompany!}
              />
            )}
            {!isMaster && (
              <>
                {activeTab === 'dashboard' && <Dashboard budgets={companyBudgets} onViewBudget={openBudgetHub} onNewBudget={() => { setEditingBudget(null); setActiveTab('newBudget'); }} company={displayCompany!} />}
                {activeTab === 'analytics' && <Analytics budgets={companyBudgets} company={displayCompany!} onUpgrade={() => setActiveTab('subscription')} />}
                {activeTab === 'newBudget' && <BudgetEditor company={displayCompany!} onSave={handleSaveBudget} initialData={editingBudget} onCancel={() => setActiveTab('dashboard')} onUpgrade={() => setActiveTab('subscription')} />}
                {activeTab === 'budgetHub' && editingBudget && (
                  <div className="space-y-8">
                    <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-fit">
                      {editingBudget.status === 'Approved' && <button onClick={() => setHubTab('summary')} className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${hubTab === 'summary' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Resumo</button>}
                      <button onClick={() => setHubTab('info')} className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${hubTab === 'info' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Orçamento</button>
                      {editingBudget.status === 'Approved' && (
                        <>
                          <button onClick={() => setHubTab('payments')} className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${hubTab === 'payments' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}>Pagamentos</button>
                          <button onClick={() => setHubTab('expenses')} className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${hubTab === 'expenses' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Custos</button>
                        </>
                      )}
                      <button onClick={() => setActiveTab('dashboard')} className="px-4 py-3 rounded-xl text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2 text-[10px] font-black uppercase"><ArrowLeft size={14} /> {t.hub.back}</button>
                    </div>
                    {hubTab === 'summary' && editingBudget.status === 'Approved' && <ProjectDashboard budget={editingBudget} company={displayCompany!} />}
                    {hubTab === 'info' && <BudgetEditor company={displayCompany!} onSave={handleSaveBudget} initialData={editingBudget} onCancel={() => setActiveTab('dashboard')} onUpgrade={() => setActiveTab('subscription')} />}
                    {hubTab === 'payments' && <PaymentManager budget={editingBudget} company={displayCompany!} onUpgrade={() => setActiveTab('subscription')} onUpdateBudget={(b) => { handleUpdateBudget(b); setEditingBudget(b); }} />}
                    {hubTab === 'expenses' && <ExpenseManager budget={editingBudget} company={displayCompany!} onUpgrade={() => setActiveTab('subscription')} onUpdateBudget={(b) => { handleUpdateBudget(b); setEditingBudget(b); }} />}
                  </div>
                )}
                {activeTab === 'settings' && <CompanySettings company={displayCompany!} user={currentUser!} onSave={handleUpdateCompany} />}
                {activeTab === 'subscription' && <SubscriptionPage company={displayCompany!} onUpgrade={() => {
                  const expiry = new Date(); expiry.setDate(expiry.getDate() + 30);
                  handleUpdateCompany({...activeCompany!, plan: 'Premium', subscriptionExpiryDate: expiry.toISOString().split('T')[0]}); 
                  setActiveTab('dashboard');
                }} />}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
