import React from 'react';
import { RISK_COLORS } from './translations';
import { AlertTriangle, Shield, AlertOctagon, Flame } from 'lucide-react';

const RISK_ICONS = {
  green: Shield,
  amber: AlertTriangle,
  red: AlertOctagon,
  critical: Flame
};

export default function RiskBadge({ level, size = 'md', showLabel = true, label }) {
  const colors = RISK_COLORS[level] || RISK_COLORS.green;
  const Icon = RISK_ICONS[level] || Shield;
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base font-semibold',
    xl: 'px-6 py-3 text-lg font-bold'
  };

  const iconSizes = { sm: 12, md: 14, lg: 18, xl: 22 };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizes[size]}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`
      }}
    >
      <Icon size={iconSizes[size]} />
      {showLabel && (label || level?.toUpperCase())}
    </span>
  );
}
