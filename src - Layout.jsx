import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Map, MessageSquare, Siren, Shield, Settings, Bell, LayoutDashboard } from 'lucide-react';
import { AppProvider, useApp } from './components/shared/useAppContext';
import { t } from './components/shared/translations';

const NAV_ITEMS = [
  { key: 'Home', icon: Home, labelKey: 'home' },
  { key: 'FloodMap', icon: Map, labelKey: 'map' },
  { key: 'Community', icon: MessageSquare, labelKey: 'community' },
  { key: 'SOS', icon: Siren, labelKey: 'sos' },
  { key: 'SafetyInfo', icon: Shield, labelKey: 'info' },
];

const PAGES_WITHOUT_NAV = ['Onboarding'];

function LayoutInner({ children, currentPageName }) {
  const { language, loading, userProfile } = useApp();
  const showNav = !PAGES_WITHOUT_NAV.includes(currentPageName);

  // Redirect to onboarding if profile not set up
  const skipOnboardingPages = ['Onboarding', 'Settings', 'AdminDashboard'];
  if (!loading && !userProfile?.onboarding_complete && !skipOnboardingPages.includes(currentPageName)) {
    window.location.href = createPageUrl('Onboarding');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className={showNav ? 'pb-20' : ''}>
        {children}
      </div>

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800">
          <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
            {NAV_ITEMS.map(item => {
              const isActive = currentPageName === item.key;
              const isSOS = item.key === 'SOS';
              return (
                <Link
                  key={item.key}
                  to={createPageUrl(item.key)}
                  className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                    isSOS
                      ? 'relative -mt-5'
                      : isActive
                        ? 'text-blue-400'
                        : 'text-gray-500'
                  }`}
                >
                  {isSOS ? (
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
                      isActive ? 'bg-red-600 shadow-red-600/40' : 'bg-red-700 shadow-red-700/20'
                    }`}>
                      <item.icon size={24} className="text-white" />
                    </div>
                  ) : (
                    <item.icon size={20} />
                  )}
                  <span className={`text-[10px] font-medium ${isSOS ? 'text-red-400 mt-0.5' : ''}`}>
                    {t(language, item.labelKey)}
                  </span>
                </Link>
              );
            })}
          </div>
          {/* Safe area bottom */}
          <div className="h-safe-area-bottom bg-gray-900/95" />
        </nav>
      )}
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <AppProvider>
      <LayoutInner currentPageName={currentPageName}>
        {children}
      </LayoutInner>
    </AppProvider>
  );
}
