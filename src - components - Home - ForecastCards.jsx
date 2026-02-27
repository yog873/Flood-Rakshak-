import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp } from 'lucide-react';
import { t } from '../shared/translations';

function ProbabilityGauge({ value }) {
  const color = value < 30 ? '#10B981' : value < 60 ? '#F59E0B' : value < 80 ? '#F97316' : '#EF4444';
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-20 h-20">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
        <motion.circle
          cx="40" cy="40" r="36"
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeDasharray={circumference}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-white">{value}%</span>
      </div>
    </div>
  );
}

export default function ForecastCards({ predictions = {}, lang = 'en' }) {
  const cards = [
    { label: t(lang, 'forecast6h'), value: predictions.prediction_6h || 0, key: '6h' },
    { label: t(lang, 'forecast12h'), value: predictions.prediction_12h || 0, key: '12h' },
    { label: t(lang, 'forecast24h'), value: predictions.prediction_24h || 0, key: '24h' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp size={16} className="text-blue-400" />
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          {t(lang, 'aiPowered')} — {t(lang, 'floodProbability')}
        </h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-800/60 backdrop-blur rounded-xl p-4 flex flex-col items-center border border-gray-700/50"
          >
            <ProbabilityGauge value={card.value} />
            <div className="flex items-center gap-1 mt-2">
              <Clock size={12} className="text-gray-400" />
              <span className="text-xs text-gray-300 font-medium">{card.label}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
