import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, MapPin, Clock, ThumbsUp, Camera, AlertTriangle, ShieldCheck } from 'lucide-react';
import { SEVERITY_COLORS } from '../shared/translations';
import { t } from '../shared/translations';
import { motion } from 'framer-motion';
import moment from 'moment';

const SEVERITY_LABELS = {
  waterlogging: 'Water Logging',
  knee_deep: 'Knee Deep',
  waist_deep: 'Waist Deep',
  dangerous_flow: 'Dangerous Flow',
  structural_damage: 'Structural Damage'
};

export default function ReportCard({ report, lang = 'en', onConfirm, currentUserEmail }) {
  const [confirming, setConfirming] = useState(false);
  const isVerified = report.verification_status === 'verified';
  const alreadyConfirmed = report.corroborated_by?.includes(currentUserEmail);
  const sevColor = SEVERITY_COLORS[report.severity] || '#EF4444';

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const newCorroborated = [...(report.corroborated_by || []), currentUserEmail];
      const newCount = (report.corroboration_count || 0) + 1;
      const verified = newCount >= 3;
      await base44.entities.FloodReport.update(report.id, {
        corroboration_count: newCount,
        corroborated_by: newCorroborated,
        verification_status: verified ? 'verified' : report.verification_status
      });
      if (onConfirm) onConfirm();
    } finally {
      setConfirming(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/60 backdrop-blur rounded-xl border border-gray-700/50 p-4 space-y-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sevColor }} />
          <span className="text-sm font-semibold text-white">{SEVERITY_LABELS[report.severity] || report.severity}</span>
          {isVerified && (
            <span className="inline-flex items-center gap-1 bg-green-900/50 text-green-400 text-xs px-2 py-0.5 rounded-full">
              <ShieldCheck size={10} /> {t(lang, 'verified')}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">{moment(report.created_date).fromNow()}</span>
      </div>

      {report.description && (
        <p className="text-sm text-gray-300 leading-relaxed">{report.description}</p>
      )}

      {report.photo_url && (
        <div className="rounded-lg overflow-hidden h-40">
          <img src={report.photo_url} alt="Report" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-gray-500">
        {report.ward && (
          <span className="flex items-center gap-1">
            <MapPin size={11} /> {report.ward}
          </span>
        )}
        <span className="flex items-center gap-1">
          <ThumbsUp size={11} /> {report.corroboration_count || 0} confirmations
        </span>
        {report.reporter_name && (
          <span className="text-gray-600">by {report.reporter_name}</span>
        )}
      </div>

      {report.ai_flags?.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {report.ai_flags.map((flag, i) => (
            <span key={i} className="text-[10px] bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded-full">
              AI: {flag}
            </span>
          ))}
        </div>
      )}

      {!alreadyConfirmed && !isVerified && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleConfirm}
          disabled={confirming}
          className="w-full bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <CheckCircle size={14} className="mr-2" />
          {t(lang, 'iCanConfirm')}
        </Button>
      )}
      {alreadyConfirmed && (
        <p className="text-xs text-green-500 text-center">✓ You confirmed this report</p>
      )}
    </motion.div>
  );
}
