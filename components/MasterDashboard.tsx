
import React, { useState, useEffect } from 'react';
import { User, Company, Specialty, PlanType, UserStatus, CountryCode } from '../types';
import { Users, Building, ShieldCheck, AlertTriangle, UserCheck, PlusCircle, Search, BadgeCheck, XCircle, Ban, Mail, CreditCard, Trash2, Smartphone, Hash, X, Calendar } from 'lucide-react';

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
        user: `usr_${Math.random().toString(36).substr(2, 9)}`,
        company: `cpn_${Math.random().toString(36).substr(2, 9)}`
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
        if (plan === 'Premium') {
          const d = new Date();
          d.setDate(d.getDate() + 30);
          expiryDate = d.toISOString().split('T')[0];
        } else {
          expiryDate = undefined;
        }
        return { ...c, plan, subscriptionExpiryDate: expiryDate };
      }
      return c;
    });
    syncStorage(users, updated);
  };

  const handleDeleteUser = (userId: string, companyId: string) => {
    if (window.confirm('Eliminar esta conta permanentemente?')) {
      const updatedUsers = users.filter(u => u.id !== userId);
      const updatedCompanies = companies.filter(c => c.id !== companyId);
      syncStorage(updatedUsers, updatedCompanies);
    }
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const newU: User = { id: currentGeneratedIds.user, email: newCompany.email, password: newCompany.password, companyId: currentGeneratedIds.company, isVerified: true, role: 'User', status: 'Active' };
    const newC: Company = { id: currentGeneratedIds.company, name: newCompany.name, email: newCompany.email, logo: '', nif: '', address: '', phone: newCompany.phone, specialties: [Specialty.Pedreiro], plan: newCompany.plan, country: newCompany.country, subscriptionExpiryDate: newCompany.plan === 'Premium' ? newCompany.expiryDate : undefined };
    syncStorage([...users, newU], [...companies, newC]);
    setShowAddModal(false);
  };

  const filteredUsers = users.filter(u => u.role !== 'Master' && (u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.id.includes(searchTerm)));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Painel Master</h2>
          <p className="text-slate-500 font-medium">Controlo global da plataforma Átrio.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all">Nova Empresa</button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-black uppercase tracking-widest">Utilizadores Registados</h3>
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Pesquisar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
          </div>
        </div>
        <table className="w-full text-left">
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-8 py-6 font-black text-slate-900">{u.email}</td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{u.status}</span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => handleDeleteUser(u.id, u.companyId)} className="text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 animate-in zoom-in">
              <h4 className="text-2xl font-black uppercase mb-6">Registar Nova Empresa</h4>
              <form onSubmit={handleCreateCompany} className="space-y-4">
                 <input required type="text" placeholder="Nome da Empresa" className="w-full p-4 border rounded-xl font-bold" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} />
                 <input required type="email" placeholder="Email" className="w-full p-4 border rounded-xl font-bold" value={newCompany.email} onChange={e => setNewCompany({...newCompany, email: e.target.value})} />
                 <input required type="password" placeholder="Password" className="w-full p-4 border rounded-xl font-bold" value={newCompany.password} onChange={e => setNewCompany({...newCompany, password: e.target.value})} />
                 <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase">Criar Agora</button>
                 <button type="button" onClick={() => setShowAddModal(false)} className="w-full text-slate-400 font-bold uppercase py-2">Cancelar</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default MasterDashboard;
