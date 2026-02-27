import React from 'react';
import { motion } from 'framer-motion';
import { Siren, MapPin, FileWarning, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { t } from '../shared/translations';

export default function QuickActions({ lang = 'en' }) {
  const actions = [
    { icon: Siren, label: t(lang, 'sosTrigger'), color: '#EF4444', bgColor: '#7F1D1D', page: 'SOS' },
    { icon: MapPin, label: t(lang, 'findShelters'), color: '#10B981', bgColor: '#064E3B', page: 'Shelters' },
    { icon: FileWarning, label: t(lang, 'reportFlood'), color: '#F59E0B', bgColor: '#78350F', page: 'ReportSubmit' },
    { icon: Phone, label: t(lang, 'emergencyDial'), color: '#8B5CF6', bgColor: '#4C1D95', page: 'Emergency' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, i) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
        >
          <Link to={createPageUrl(action.page)} className="block">
            <div
              className="rounded-xl p-4 flex flex-col items-center gap-2 border transition-all active:scale-95"
              style={{
                backgroundColor: action.bgColor,
                borderColor: `${action.color}33`
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${action.color}22` }}
              >
                <action.icon size={24} style={{ color: action.color }} />
              </div>
              <span className="text-xs font-semibold text-center text-gray-200">{action.label}</span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
