import React from 'react';
import { RISK_COLORS } from '../shared/translations';
import { t } from '../shared/translations';
import { Shield, AlertTriangle, AlertOctagon, Flame, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RiskBanner({ riskLevel = 'green', ward, lang = 'en' }) {
  const colors = RISK_COLORS[riskLevel];
  const icons = { green: Shield, amber: AlertTriangle, red: AlertOctagon, critical: Flame };
  const Icon = icons[riskLevel] || Shield;
  const riskLabel = t(lang, `riskLevels.${riskLevel}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-5"
      style={{ backgroundColor: colors.bg }}
    >
      {riskLevel === 'critical' && (
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 bg-red-900/30"
        />
      )}
      <div className="relative flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio size={14} style={{ color: colors.text }} className={riskLevel === 'critical' ? 'animate-pulse' : ''} />
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.text, opacity: 0.8 }}>
              {t(lang, 'currentRisk')}
            </span>
          </div>
          <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
            {riskLabel}
          </h2>
          {ward && (
            <p className="text-sm mt-1" style={{ color: colors.text, opacity: 0.7 }}>
              {t(lang, 'ward')}: {ward}
            </p>
          )}
        </div>
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
          <Icon size={32} style={{ color: colors.text }} />
        </div>
      </div>
    </motion.div>
  );
}
