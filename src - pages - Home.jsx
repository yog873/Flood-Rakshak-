import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useApp } from '../components/shared/useAppContext';
import { t } from '../components/shared/translations';
import RiskBanner from '../components/home/RiskBanner';
import ForecastCards from '../components/home/ForecastCards';
import QuickActions from '../components/home/QuickActions';
import AlertTicker from '../components/home/AlertTicker';
import { Clock, Database, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Home() {
  const { userProfile, language } = useApp();
  const city = userProfile?.city || 'mumbai';
  const ward = userProfile?.ward || '';

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts', city],
    queryFn: () => base44.entities.Alert.filter({ city, is_active: true }, '-created_date', 10),
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Notification.filter({ user_email: user.email, is_read: false }, '-created_date', 5);
    },
  });

  // Get the most relevant alert for user's ward
  const wardAlert = alerts.find(a => a.ward === ward) || alerts[0];
  const currentRisk = wardAlert?.risk_level || 'green';
  const predictions = {
    prediction_6h: wardAlert?.prediction_6h ?? 22,
    prediction_12h: wardAlert?.prediction_12h ?? 38,
    prediction_24h: wardAlert?.prediction_24h ?? 55,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Flood <span className="text-blue-400">रक्षक</span></h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {t(language, 'lastUpdated')}: {new Date().toLocaleTimeString()} • IMD / CWC
            </p>
          </div>
          <Link to={createPageUrl('Notifications')} className="relative p-2">
            <Bell size={22} className="text-gray-400" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </Link>
        </div>

        {/* Active Alerts Ticker */}
        <AlertTicker alerts={alerts} />

        {/* Risk Banner */}
        <RiskBanner riskLevel={currentRisk} ward={ward || city} lang={language} />

        {/* AI Forecast */}
        <ForecastCards predictions={predictions} lang={language} />

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {t(language, 'quickActions')}
          </h3>
          <QuickActions lang={language} />
        </div>

        {/* Data Source Footer */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-600 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-1">
            <Database size={12} />
            <span>IMD • CWC • AI</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
