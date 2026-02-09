
import React, { useState, useEffect, useMemo } from 'react';
import { User, Company, Specialty, PlanType, UserStatus, CountryCode } from '../types';
import { Users, Building, ShieldCheck, AlertTriangle, UserMinus, UserCheck, PlusCircle, Search, BadgeCheck, XCircle, Ban, Mail, CreditCard, ExternalLink, Trash2, Smartphone, Hash, X, Calendar } from 'lucide-react';

const MasterDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [currentGeneratedIds, setCurrentGeneratedIds] = useState({ user: '', company: '' });

  const [newCompany, setNewCompany] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    plan: 'Free' as PlanType,
    country: 'PT' as CountryCode,
    expiryDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    const savedUsers = localStorage.getItem('atrio_all_users');
    const savedCompanies = localStorage.getItem('atrio_companies');
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedCompanies) setCompanies(JSON.parse(savedCompanies));
  }, []);

  useEffect(() => {
    if (showAddModal) {
      setCurrentGeneratedIds({
        user: crypto.randomUUID(),
        company: crypto.randomUUID()
      });
    }
  }, [showAddModal]);

  const syncStorage = (updatedUsers: User[], updatedCompanies: Company[]) => {
    localStorage.setItem('atrio_all_users', JSON.stringify(updatedUsers));
    localStorage.setItem('atrio_companies', JSON.stringify(updatedCompanies));
    setUsers(updatedUsers);
    setCompanies(updatedCompanies);
  };

  const handleUpdateStatus = (userId: string, status: UserStatus) => {
    const updated = users.map(u => u.id === userId ? { ...u, status } : u);
    syncStorage(updated, companies);
  };

  const handleUpdatePlan = (companyId: string, plan: PlanType) => {
    const updated = companies.map(c => {
      if (c.id === companyId) {
        let expiryDate = c.subscriptionExpiryDate;
        // Se estiver a mudar para Premium e não tiver data ou a data for antiga, auto-set 30 dias
        if (plan === 'Premium') {
          const d = new Date();
          d.setDate(d.getDate() + 30);
          expiryDate = d.toISOString().split('T')[0];
        } else if (plan === 'Free') {
          expiryDate = undefined; // Limpa se voltar ao free (opcional)
        }
        return { ...c, plan, subscriptionExpiryDate: expiryDate };
      }
      return c;
    });
    syncStorage(users, updated);
  };

  const handleUpdateExpiry = (companyId: string, date: string) => {
    const updated = companies.map(c => c.id === companyId ? { ...c, subscriptionExpiryDate: date } : c);
    syncStorage(users, updated);
  };

  const handleDeleteUser = (userId: string, companyId: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar esta conta permanentemente?')) {
      const updatedUsers = users.filter(u => u.id !== userId);
      const updatedCompanies = companies.filter(c => c.id !== companyId);
      syncStorage(updatedUsers, updatedCompanies);
    }
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newU: User = {
      id: currentGeneratedIds.user,
      email: newCompany.email,
      password: newCompany.password,
      companyId: currentGeneratedIds.company,
      isVerified: true,
      role: 'User',
      status: 'Active'
    };

    const newC: Company = {
      id: currentGeneratedIds.company,
      name: newCompany.name,
      email: newCompany.email,
      logo: 'https://picsum.photos/seed/' + Math.random() + '/200/200',
      nif: '',
      address: '',
      phone: newCompany.phone,
      specialties: [Specialty.Pedreiro],
      plan: newCompany.plan,
      country: newCompany.country,
      subscriptionExpiryDate: newCompany.plan === 'Premium' ? newCompany.expiryDate : undefined
    };

    syncStorage([...users, newU], [...companies, newC]);
    setShowAddModal(false);
    setNewCompany({ 
      name: '', 
      email: '', 
      password: '', 
      phone: '', 
      plan: 'Free', 
      country: 'PT', 
      expiryDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
    });
  };

  const filteredUsers = users.filter(u => 
    u.role !== 'Master' && 
    (u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.id.includes(searchTerm))
  );

  const getCompany = (companyId: string) => companies.find(c => c.id === companyId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-indigo-600" size={32} /> Central Master Control
          </h2>
          <p className="text-slate-500 font-medium">Gestão global de empresas, licenças e acessos SaaS Átrio.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <PlusCircle size={20} /> Incluir Empresa Manual
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={24} /></div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Utilizadores</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900">{users.filter(u => u.role !== 'Master').length}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CreditCard size={24} /></div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Assinaturas Premium</span>
          </div>
          <h3 className="text-3xl font-black text-emerald-600">{companies.filter(c => c.plan === 'Premium').length}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><Ban size={24} /></div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Contas Suspensas</span>
          </div>
          <h3 className="text-3xl font-black text-red-600">{users.filter(u => u.status !== 'Active').length}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Lista de Empresas / IDs</h3>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar por ID ou Email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-bold" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
                <th className="px-8 py-6">ID Identificação</th>
                <th className="px-8 py-6">Empresa / Email</th>
                <th className="px-8 py-6">Plano</th>
                <th className="px-8 py-6">Próxima Ativação</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Ações Master</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(u => {
                const comp = getCompany(u.companyId);
                const expiryDate = comp?.subscriptionExpiryDate;
                const isNearExpiry = expiryDate && (new Date(expiryDate).getTime() - new Date().getTime()) < (3 * 24 * 60 * 60 * 1000);
                
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <code className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-lg text-slate-500 w-fit">{u.id.substring(0, 8)}...</code>
                        <span className="text-[9px] text-slate-400 mt-1">ID Único Permanente</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-900 text-sm">{comp?.name || 'N/A'}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1"><Mail size={12} /> {u.email}</div>
                    </td>
                    <td className="px-8 py-6">
                      <select 
                        value={comp?.plan} 
                        onChange={(e) => handleUpdatePlan(u.companyId, e.target.value as PlanType)}
                        className={`text-[10px] font-black uppercase tracking-widest border rounded-xl px-3 py-1 outline-none cursor-pointer transition-colors ${comp?.plan === 'Premium' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                      >
                        <option value="Free">Básico (Free)</option>
                        <option value="Premium">Premium (Pro)</option>
                      </select>
                    </td>
                    <td className="px-8 py-6">
                       <input 
                        type="date" 
                        value={comp?.subscriptionExpiryDate || ''} 
                        onChange={(e) => handleUpdateExpiry(u.companyId, e.target.value)}
                        className={`text-[10px] font-black border rounded-lg px-2 py-1 outline-none ${isNearExpiry ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-white border-slate-200 text-slate-700'}`}
                       />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                         <span className={`w-2 h-2 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : u.status === 'Suspended' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                         <span className={`text-[10px] font-black uppercase ${u.status === 'Active' ? 'text-emerald-600' : u.status === 'Suspended' ? 'text-amber-600' : 'text-red-600'}`}>
                           {u.status}
                         </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <button 
                           onClick={() => handleUpdateStatus(u.id, u.status === 'Active' ? 'Suspended' : 'Active')}
                           className={`p-2 rounded-xl border transition-all ${u.status === 'Active' ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'}`}
                           title={u.status === 'Active' ? 'Suspender Conta' : 'Ativar Conta'}
                         >
                           {u.status === 'Active' ? <Ban size={16} /> : <UserCheck size={16} />}
                         </button>
                         <button 
                           onClick={() => handleUpdateStatus(u.id, 'Blocked')}
                           className="p-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-all"
                           title="Bloquear Permanentemente"
                         >
                           <XCircle size={16} />
                         </button>
                         <button 
                           onClick={() => handleDeleteUser(u.id, u.companyId)}
                           className="p-2 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                           title="Eliminar Dados"
                         >
                           <Trash2 size={16} />
                         </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="bg-indigo-600 p-8 text-white flex justify-between items-center relative shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                  <PlusCircle size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-black uppercase tracking-widest">Nova Empresa SaaS</h4>
                  <p className="text-indigo-200 text-xs font-bold">Cadastro manual via Painel Master</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-10">
              <form onSubmit={handleCreateCompany} className="space-y-8">
                
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400"><Hash size={18} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID de Identificação Gerado</p>
                      <code className="text-xs font-black text-indigo-600">{currentGeneratedIds.user}</code>
                    </div>
                  </div>
                  <BadgeCheck className="text-emerald-500" size={24} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Empresa</label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input required type="text" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" placeholder="Ex: EliteCofra Lda" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Master de Acesso</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input required type="email" value={newCompany.email} onChange={e => setNewCompany({...newCompany, email: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" placeholder="admin@empresa.com" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telemóvel / WhatsApp</label>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input required type="tel" value={newCompany.phone} onChange={e => setNewCompany({...newCompany, phone: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" placeholder="+351 9xx xxx xxx" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vencimento da Assinatura</label>
                    <div className="relative">
                       <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                       <input required type="date" value={newCompany.expiryDate} onChange={e => setNewCompany({...newCompany, expiryDate: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Palavra-passe Inicial</label>
                    <input required type="text" value={newCompany.password} onChange={e => setNewCompany({...newCompany, password: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" placeholder="Senha do cliente" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plano Inicial</label>
                    <select value={newCompany.plan} onChange={e => setNewCompany({...newCompany, plan: e.target.value as PlanType})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black uppercase tracking-widest outline-none cursor-pointer focus:ring-2 focus:ring-indigo-600">
                      <option value="Free">Básico (Grátis)</option>
                      <option value="Premium">Premium (Pro)</option>
                    </select>
                  </div>
                </div>

                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                  <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                  <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-tight">
                    Nota Master: O sistema calculará 30 dias de validade a partir do momento em que o plano for ativado como Premium.
                  </p>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-8 py-5 border border-slate-200 text-slate-400 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95">Cancelar</button>
                  <button type="submit" className="flex-1 px-8 py-5 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">Registar Empresa</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDashboard;
