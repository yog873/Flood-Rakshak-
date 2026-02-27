import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '../components/shared/useAppContext';
import { t } from '../components/shared/translations';
import ReportCard from '../components/community/ReportCard';
import { MessageSquare, Plus, Filter, Clock, AlertTriangle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function Community() {
  const { userProfile, language, currentUser } = useApp();
  const city = userProfile?.city || 'mumbai';
  const [activeFilter, setActiveFilter] = useState('recent');
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['community-reports', city, activeFilter],
    queryFn: async () => {
      let sortField = '-created_date';
      let filterObj = { city };
      
      if (activeFilter === 'severe') {
        sortField = '-created_date';
      }
      if (activeFilter === 'myward' && userProfile?.ward) {
        filterObj.ward = userProfile.ward;
      }
      
      const results = await base44.entities.FloodReport.filter(filterObj, sortField, 30);
      
      if (activeFilter === 'severe') {
        const severityOrder = ['structural_damage', 'dangerous_flow', 'waist_deep', 'knee_deep', 'waterlogging'];
        return results.sort((a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity));
      }
      return results;
    },
  });

  const filters = [
    { key: 'recent', label: t(language, 'mostRecent'), icon: Clock },
    { key: 'severe', label: t(language, 'mostSevere'), icon: AlertTriangle },
    { key: 'myward', label: t(language, 'myWard'), icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-400" />
            {t(language, 'communityReports')}
          </h2>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeFilter === f.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              <f.icon size={12} />
              {f.label}
            </button>
          ))}
        </div>

        {/* Reports */}
        <div className="space-y-3">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-800/60 rounded-xl p-4 space-y-3">
                <Skeleton className="h-4 w-32 bg-gray-700" />
                <Skeleton className="h-16 w-full bg-gray-700" />
                <Skeleton className="h-3 w-24 bg-gray-700" />
              </div>
            ))
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
              <p>{t(language, 'noData')}</p>
            </div>
          ) : (
            reports.map(report => (
              <ReportCard
                key={report.id}
                report={report}
                lang={language}
                currentUserEmail={currentUser?.email}
                onConfirm={() => queryClient.invalidateQueries({ queryKey: ['community-reports'] })}
              />
            ))
          )}
        </div>

        {/* Floating Action Button */}
        <Link to={createPageUrl('ReportSubmit')}>
          <div className="fixed bottom-24 right-4 z-50">
            <Button className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30">
              <Plus size={24} />
            </Button>
          </div>
        </Link>
      </div>
    </div>
  );
}
