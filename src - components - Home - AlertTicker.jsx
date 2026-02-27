import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import RiskBadge from '../shared/RiskBadge';

export default function AlertTicker({ alerts = [] }) {
  if (!alerts.length) return null;

  return (
    <div className="bg-red-950/60 border border-red-900/50 rounded-xl px-4 py-2.5 overflow-hidden">
      <div className="flex items-center gap-2">
        <AlertTriangle size={14} className="text-red-400 shrink-0 animate-pulse" />
        <div className="overflow-hidden flex-1">
          <motion.div
            animate={{ x: alerts.length > 1 ? [0, -100 * alerts.length] : 0 }}
            transition={{ duration: alerts.length * 8, repeat: Infinity, ease: "linear" }}
            className="flex gap-8 whitespace-nowrap"
          >
            {alerts.map((alert, i) => (
              <span key={i} className="text-sm text-red-200 inline-flex items-center gap-2">
                <RiskBadge level={alert.risk_level} size="sm" showLabel={false} />
                <span className="font-medium">{alert.title}</span>
                {alert.ward && <span className="text-red-400">• {alert.ward}</span>}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
