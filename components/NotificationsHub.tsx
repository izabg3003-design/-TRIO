
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
  Megaphone,
  X,
  Layout,
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

  useEffect(() => {
    if (!isMaster) {
      const unreadBanners = notifications.filter(n => n.isBanner && !readNotifications.includes(n.id));
      if (unreadBanners.length > 0) {
        setSelectedHero(unreadBanners[0]);
      }
    }
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const expiry = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const note: AppNotification = {
      id: `note_${Math.random().toString(36).substr(2, 9)}`,
      title: newNote.title,
      message: newNote.message,
      timestamp: now.toISOString(),
      expiresAt: expiry.toISOString(),
      target: newNote.target,
      type: newNote.type,
      isBanner: newNote.isBanner,
      bannerImage: newNote.bannerImage
    };

    onSync([note, ...notifications]);
    setNewNote({ title: '', message: '', target: 'All', type: 'Info', isBanner: false, bannerImage: '' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      {isMaster && (
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
          <h3 className="text-2xl font-black uppercase tracking-widest mb-6">Disparar Notificação Master</h3>
          <form onSubmit={handleSend} className="space-y-4">
             <input required placeholder="Título" className="w-full p-4 bg-white/10 rounded-xl border border-white/10 text-white font-bold" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} />
             <textarea required placeholder="Mensagem" className="w-full p-4 bg-white/10 rounded-xl border border-white/10 text-white font-bold" value={newNote.message} onChange={e => setNewNote({...newNote, message: e.target.value})} />
             <button className="w-full bg-indigo-600 py-4 rounded-xl font-black uppercase">Enviar Agora</button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest">Sem notificações</div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Bell size={24} /></div>
              <div className="flex-1">
                <h5 className="font-black text-slate-900">{n.title}</h5>
                <p className="text-xs text-slate-500">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsHub;
