
import React, { useState, useEffect } from 'react';
import { AppNotification, NotificationTarget, Company, CountryCode } from '../types';
import { COUNTRY_CONFIGS } from '../constants';
import { 
  Bell, 
  Send, 
  Users, 
  Crown, 
  Zap, 
  Info, 
  AlertTriangle, 
  Trash2, 
  Clock, 
  Target,
  Sparkles,
  ShieldCheck,
  Megaphone,
  X,
  Layout,
  CheckSquare,
  Square,
  Image as ImageIcon,
  Upload
} from 'lucide-react';

interface NotificationsHubProps {
  notifications: AppNotification[];
  isMaster: boolean;
  onSync: (notes: AppNotification[]) => void;
  onMarkAsRead: (id: string) => void;
  readNotifications: string[];
  company: Company | null;
}

const NotificationsHub: React.FC<NotificationsHubProps> = ({ notifications, isMaster, onSync, onMarkAsRead, readNotifications, company }) => {
  const countryCode: CountryCode = company?.country || 'PT';
  const config = COUNTRY_CONFIGS[countryCode];
  const t = config.translations;
  
  const [newNote, setNewNote] = useState({
    title: '',
    message: '',
    target: 'All' as NotificationTarget,
    type: 'Info' as AppNotification['type'],
    isBanner: false,
    bannerImage: ''
  });

  const [selectedHero, setSelectedHero] = useState<AppNotification | null>(null);

  // LOGICA: Quando entrar na aba, se houver banner NÃO LIDO, abre o maior automaticamente
  useEffect(() => {
    if (!isMaster) {
      const unreadBanners = notifications.filter(n => n.isBanner && !readNotifications.includes(n.id));
      if (unreadBanners.length > 0) {
        setSelectedHero(unreadBanners[0]);
      }
    }
  }, []);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewNote({ ...newNote, bannerImage: reader.result as string, isBanner: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const expiry = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const note: AppNotification = {
      id: crypto.randomUUID(),
      title: newNote.title,
      message: newNote.message,
      timestamp: now.toISOString(),
      expiresAt: expiry.toISOString(),
      target: newNote.target,
      type: newNote.type,
      isBanner: newNote.isBanner,
      bannerImage: newNote.bannerImage
    };

    const updatedNotes = [note, ...notifications];
    onSync(updatedNotes);
    setNewNote({ title: '', message: '', target: 'All', type: 'Info', isBanner: false, bannerImage: '' });
    alert(`Notificação disparada!\nExpira em: ${expiry.toLocaleDateString()}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Eliminar esta notificação global?")) {
      onSync(notifications.filter(n => n.id !== id));
    }
  };

  // Função interna para fechar o modal e marcar como lido
  const closeHero = () => {
    if (selectedHero) {
      onMarkAsRead(selectedHero.id);
      setSelectedHero(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* BANNER HERO MODAL (GRANDE) */}
      {selectedHero && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
           <div className="absolute inset-0" onClick={closeHero}></div>
           <div className="bg-white w-full max-w-4xl rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.4)] overflow-hidden relative z-10 animate-in zoom-in-95 duration-500">
              
              {selectedHero.bannerImage ? (
                <div className="w-full h-64 sm:h-96 relative group">
                   <img src={selectedHero.bannerImage} className="w-full h-full object-cover" alt={selectedHero.title} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                   <div className="absolute bottom-8 left-10 text-white">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 backdrop-blur-md mb-4 inline-block ${
                        selectedHero.type === 'Warning' ? 'bg-red-500/80' : selectedHero.type === 'Premium' ? 'bg-indigo-600/80' : 'bg-slate-900/80'
                      }`}>
                         Comunicado Oficial
                      </span>
                      <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none">{selectedHero.title}</h2>
                   </div>
                </div>
              ) : (
                <div className={`w-full p-12 text-white flex flex-col gap-6 ${
                  selectedHero.type === 'Warning' ? 'bg-red-600' : selectedHero.type === 'Premium' ? 'bg-indigo-700' : 'bg-slate-900'
                }`}>
                   <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center border border-white/20 backdrop-blur-md">
                        {selectedHero.type === 'Premium' ? <Crown size={40} /> : <Megaphone size={40} />}
                      </div>
                      <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none">{selectedHero.title}</h2>
                   </div>
                </div>
              )}

              <div className="p-10 sm:p-12 space-y-8">
                 <p className="text-xl sm:text-2xl text-slate-600 font-medium leading-relaxed">
                   {selectedHero.message}
                 </p>
                 
                 <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button 
                      onClick={closeHero}
                      className="w-full sm:flex-1 bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                       Confirmar Leitura <X size={20} />
                    </button>
                 </div>
                 
                 <p className="text-[10px] text-center font-black text-slate-400 uppercase tracking-widest">
                   Esta mensagem será arquivada no seu histórico • Expira em {new Date(selectedHero.expiresAt).toLocaleDateString()}
                 </p>
              </div>

              <button 
                onClick={closeHero}
                className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all"
              >
                <X size={24} />
              </button>
           </div>
        </div>
      )}

      {isMaster && (
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group border border-white/5">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="relative z-10 flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md">
                  <Megaphone size={32} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-widest leading-none mb-2">{t.notifications.sendTitle}</h3>
                  <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em]">Comunicação Global (Auto-Expira em 3 dias)</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSend} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Assunto / Título</label>
                  <input required type="text" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} placeholder="Ex: Aviso Importante" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-white placeholder:text-white/20" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Mensagem</label>
                  <textarea required rows={4} value={newNote.message} onChange={e => setNewNote({...newNote, message: e.target.value})} placeholder="Escreva o conteúdo..." className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-white resize-none placeholder:text-white/20" />
                </div>
              </div>

              <div className="space-y-6 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Público Alvo</label>
                    <select value={newNote.target} onChange={e => setNewNote({...newNote, target: e.target.value as NotificationTarget})} className="w-full px-5 py-4 bg-slate-800 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-white font-black uppercase tracking-widest appearance-none">
                      <option value="All">{t.notifications.targetAll}</option>
                      <option value="Premium">{t.notifications.targetPremium}</option>
                      <option value="Free">{t.notifications.targetFree}</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Tipo de Alerta</label>
                    <select value={newNote.type} onChange={e => setNewNote({...newNote, type: e.target.value as any})} className="w-full px-5 py-4 bg-slate-800 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-white font-black uppercase tracking-widest appearance-none">
                      <option value="Info">Informativa</option>
                      <option value="Warning">Alerta Crítico</option>
                      <option value="Premium">Upgrade / Retention</option>
                    </select>
                  </div>
                </div>

                <div className="p-6 bg-indigo-500/10 border border-white/5 rounded-3xl space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center"><Layout size={20} /></div>
                        <div>
                          <p className="text-[10px] font-black text-white uppercase tracking-widest">Ativar Banner Hero</p>
                          <p className="text-[9px] text-indigo-200 font-medium">Abre grande ao entrar na aba</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setNewNote({...newNote, isBanner: !newNote.isBanner})}
                        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${newNote.isBanner ? 'bg-emerald-500' : 'bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newNote.isBanner ? 'left-7' : 'left-1'}`}></div>
                      </button>
                   </div>
                   
                   {newNote.isBanner && (
                     <div className="flex flex-col gap-3">
                        <label className="cursor-pointer group">
                           <div className="w-full py-6 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-indigo-400 transition-all">
                              <Upload size={20} className="text-indigo-400" />
                              <span className="text-[9px] font-black uppercase text-indigo-200 tracking-widest">Upload do Banner Gráfico</span>
                              <input type="file" className="hidden" accept="image/*" onChange={handleBannerUpload} />
                           </div>
                        </label>
                        {newNote.bannerImage && (
                          <div className="relative h-20 rounded-xl overflow-hidden border border-white/20">
                            <img src={newNote.bannerImage} className="w-full h-full object-cover" alt="Preview" />
                          </div>
                        )}
                     </div>
                   )}
                </div>

                <button type="submit" className="w-full bg-white text-slate-900 py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 active:scale-95 group">
                  <Send size={20} /> DISPARAR AGORA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HISTÓRICO COM CLIQUE PARA ABRIR GRANDE */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-6">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Bell size={18} className="text-indigo-600" /> Centro de Mensagens
          </h4>
        </div>

        {notifications.length === 0 ? (
          <div className="py-32 bg-white rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-6 text-slate-300">
            <Bell size={48} />
            <p className="font-black uppercase tracking-widest text-sm">{t.notifications.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {notifications.map(n => {
              const isUnread = !readNotifications.includes(n.id);
              return (
                <div 
                  key={n.id} 
                  onClick={() => setSelectedHero(n)}
                  className={`group cursor-pointer bg-white p-6 rounded-3xl border transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden ${
                    isUnread ? 'ring-2 ring-indigo-600 ring-offset-2' : ''
                  } ${
                    n.type === 'Premium' ? 'border-amber-200 shadow-amber-50' : 
                    n.type === 'Warning' ? 'border-red-200 shadow-red-50' : 'border-slate-200 shadow-slate-100'
                  }`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${n.type === 'Premium' ? 'bg-amber-400' : n.type === 'Warning' ? 'bg-red-400' : 'bg-indigo-500'}`}></div>

                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border overflow-hidden ${
                      n.type === 'Premium' ? 'bg-amber-100 text-amber-600' : 
                      n.type === 'Warning' ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {n.bannerImage ? (
                        <img src={n.bannerImage} className="w-full h-full object-cover" alt="Small" />
                      ) : (
                        n.isBanner ? <Layout size={28} /> : (n.type === 'Premium' ? <Crown size={28} /> : <Info size={28} />)
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 truncate pr-4">
                           {isUnread && <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></div>}
                           <h5 className={`text-md font-black text-slate-900 truncate ${isUnread ? 'text-indigo-950' : ''}`}>{n.title}</h5>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                          <Clock size={10} className="inline mr-1" /> {new Date(n.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={`text-xs font-medium truncate max-w-2xl ${isUnread ? 'text-slate-800' : 'text-slate-500'}`}>{n.message}</p>
                    </div>

                    <div className="flex items-center gap-3">
                       {n.isBanner && <span className="bg-indigo-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm">Hero</span>}
                       {isMaster && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }} 
                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsHub;
