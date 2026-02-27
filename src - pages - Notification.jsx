import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '../components/shared/useAppContext';
import { t } from '../components/shared/translations';
import { Bell, ArrowLeft, AlertTriangle, Siren, MessageSquare, Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import RiskBadge from '../components/shared/RiskBadge';
import moment from 'moment';
import { motion } from 'framer-motion';

const TYPE_ICONS = { alert: AlertTriangle, sos: Siren, community: MessageSquare, system: Settings };
const TYPE_COLORS = { alert: '#F59E0B', sos: '#EF4444', community: '#3B82F6', system: '#6B7280' };

export default function Notifications() {
  const { language, currentUser } = useApp();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['all-notifications'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Notification.filter({ user_email: user.email }, '-created_date', 50);
    },
  });

  const markRead = async (notif) => {
    if (!notif.is_read) {
      await base44.entities.Notification.update(notif.id, { is_read: true });
      queryClient.invalidateQueries({ queryKey: ['all-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    for (const n of unread) {
      await base44.entities.Notification.update(n.id, { is_read: true });
    }
    queryClient.invalidateQueries({ queryKey: ['all-notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="text-gray-400"><ArrowLeft size={20} /></Button>
            </Link>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Bell size={20} className="text-yellow-400" />
              {t(language, 'notifications')}
              {unreadCount > 0 && (
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </h2>
          </div>
          {unreadCount > 0 && (
            <Button size="sm" variant="ghost" onClick={markAllRead} className="text-blue-400 text-xs">
              <Check size={14} className="mr-1" /> Mark all read
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {notifications.map((notif, i) => {
            const Icon = TYPE_ICONS[notif.type] || Bell;
            const color = TYPE_COLORS[notif.type] || '#6B7280';
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => markRead(notif)}
                className={`rounded-xl p-4 border cursor-pointer transition-all ${
                  notif.is_read
                    ? 'bg-gray-800/40 border-gray-800'
                    : 'bg-gray-800/80 border-gray-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}22` }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-medium ${notif.is_read ? 'text-gray-400' : 'text-white'}`}>
                        {notif.title}
                      </h4>
                      {notif.risk_level && <RiskBadge level={notif.risk_level} size="sm" showLabel={false} />}
                      {!notif.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                    {notif.recommended_action && (
                      <p className="text-xs text-blue-400 mt-1">→ {notif.recommended_action}</p>
                    )}
                    <p className="text-[10px] text-gray-600 mt-1">
                      {moment(notif.created_date).fromNow()} {notif.ward && `• ${notif.ward}`}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {notifications.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <Bell size={40} className="mx-auto mb-3 opacity-30" />
              <p>No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
