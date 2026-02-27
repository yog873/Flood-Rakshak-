import React from 'react';
import { useApp } from '../components/shared/useAppContext';
import { t, CITIES } from '../components/shared/translations';
import { Phone, ArrowLeft, Shield, Siren, Building2, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const EMERGENCY_NUMBERS = [
  { name: 'NDRF', number: '1078', desc: 'National Disaster Response Force', icon: Shield, color: '#3B82F6' },
  { name: 'Emergency', number: '112', desc: 'All-in-one Emergency Number', icon: Siren, color: '#EF4444' },
  { name: 'Police', number: '100', desc: 'Police Control Room', icon: Shield, color: '#8B5CF6' },
  { name: 'Ambulance', number: '108', desc: 'Medical Emergency', icon: Flame, color: '#10B981' },
  { name: 'Fire', number: '101', desc: 'Fire Department', icon: Flame, color: '#F59E0B' },
];

export default function Emergency() {
  const { userProfile, language } = useApp();
  const city = userProfile?.city || 'mumbai';
  const cityData = CITIES[city];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="text-gray-400"><ArrowLeft size={20} /></Button>
          </Link>
          <h2 className="text-xl font-bold">{t(language, 'emergencyNumbers')}</h2>
        </div>

        {/* National Numbers */}
        <div className="space-y-2">
          {EMERGENCY_NUMBERS.map((item, i) => (
            <motion.a
              key={item.number}
              href={`tel:${item.number}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 bg-gray-800/60 rounded-xl p-4 border border-gray-700/50 active:scale-98"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${item.color}22` }}>
                <item.icon size={22} style={{ color: item.color }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{item.name}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold" style={{ color: item.color }}>{item.number}</span>
                <Phone size={16} className="text-gray-500" />
              </div>
            </motion.a>
          ))}
        </div>

        {/* City Helpline */}
        {cityData && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{t(language, 'cityHelplines')}</h3>
            <a href={`tel:${cityData.helpline}`} className="flex items-center gap-4 bg-blue-950/40 rounded-xl p-4 border border-blue-900/50">
              <div className="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center">
                <Building2 size={22} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{cityData.name} Helpline</p>
                <p className="text-xs text-gray-500">City-specific emergency services</p>
              </div>
              <span className="text-lg font-bold text-blue-400">{cityData.helpline}</span>
            </a>
          </div>
        )}

        {/* SOS Button */}
        <Link to={createPageUrl('SOS')}>
          <div className="bg-red-950/60 border border-red-800 rounded-xl p-5 text-center mt-4">
            <Siren size={32} className="mx-auto text-red-400 mb-2" />
            <p className="font-bold text-red-300 text-lg">{t(language, 'sosTrigger')}</p>
            <p className="text-xs text-red-400 mt-1">{t(language, 'holdToActivate')}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
