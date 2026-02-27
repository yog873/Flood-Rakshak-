import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '../components/shared/useAppContext';
import { t, CITIES } from '../components/shared/translations';
import { Shield, Siren, MessageSquare, MapPin, AlertTriangle, CheckCircle, X, Send, Bell, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import RiskBadge from '../components/shared/RiskBadge';
import moment from 'moment';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { language } = useApp();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('sos');
  const [alertForm, setAlertForm] = useState({ title: '', message: '', city: 'mumbai', ward: '', risk_level: 'amber' });
  const [sendingAlert, setSendingAlert] = useState(false);

  const { data: activeSOSEvents = [] } = useQuery({
    queryKey: ['admin-sos'],
    queryFn: () => base44.entities.SOSEvent.filter({ status: 'active' }, '-created_date', 50),
    refetchInterval: 10000,
  });

  const { data: pendingReports = [] } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => base44.entities.FloodReport.filter({ moderation_status: 'pending' }, '-created_date', 50),
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: () => base44.entities.Alert.filter({ is_active: true }, '-created_date', 50),
  });

  const { data: shelters = [] } = useQuery({
    queryKey: ['admin-shelters'],
    queryFn: () => base44.entities.Shelter.list('-created_date', 50),
  });

  const moderateReport = async (reportId, status) => {
    await base44.entities.FloodReport.update(reportId, { moderation_status: status });
    queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    toast.success(`Report ${status}`);
  };

  const updateShelterStatus = async (shelterId, status) => {
    await base44.entities.Shelter.update(shelterId, { status });
    queryClient.invalidateQueries({ queryKey: ['admin-shelters'] });
    toast.success('Shelter status updated');
  };

  const pushManualAlert = async () => {
    setSendingAlert(true);
    await base44.entities.Alert.create({
      ...alertForm,
      alert_type: 'manual',
      source: 'admin',
      is_active: true,
    });
    queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
    setAlertForm({ title: '', message: '', city: 'mumbai', ward: '', risk_level: 'amber' });
    setSendingAlert(false);
    toast.success('Alert pushed!');
  };

  const tabs = [
    { key: 'sos', label: 'SOS Events', icon: Siren, count: activeSOSEvents.length },
    { key: 'moderation', label: 'Moderation', icon: MessageSquare, count: pendingReports.length },
    { key: 'alerts', label: 'Alerts', icon: AlertTriangle, count: alerts.length },
    { key: 'shelters', label: 'Shelters', icon: MapPin, count: shelters.length },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center gap-3">
          <Shield size={24} className="text-purple-400" />
          <h1 className="text-2xl font-bold">{t(language, 'admin')}</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
              {tab.count > 0 && (
                <span className="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* SOS Tab */}
        {activeTab === 'sos' && (
          <div className="space-y-3">
            {activeSOSEvents.map(sos => (
              <div key={sos.id} className="bg-red-950/40 rounded-xl border border-red-900/50 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-red-300">{sos.reporter_name || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500">
                      {sos.city} {sos.ward && `• ${sos.ward}`} • {moment(sos.created_date).fromNow()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      GPS: {sos.latitude?.toFixed(4)}, {sos.longitude?.toFixed(4)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-700 text-red-300"
                    onClick={async () => {
                      await base44.entities.SOSEvent.update(sos.id, { status: 'resolved' });
                      queryClient.invalidateQueries({ queryKey: ['admin-sos'] });
                    }}
                  >
                    Resolve
                  </Button>
                </div>
              </div>
            ))}
            {activeSOSEvents.length === 0 && <p className="text-center text-gray-500 py-8">No active SOS events</p>}
          </div>
        )}

        {/* Moderation Tab */}
        {activeTab === 'moderation' && (
          <div className="space-y-3">
            {pendingReports.map(report => (
              <div key={report.id} className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white">{report.severity?.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">{report.ward} • {report.city} • {moment(report.created_date).fromNow()}</p>
                  </div>
                  {report.ai_severity_score && (
                    <Badge className="bg-purple-900 text-purple-300">AI: {report.ai_severity_score}</Badge>
                  )}
                </div>
                {report.description && <p className="text-sm text-gray-300">{report.description}</p>}
                {report.ai_flags?.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {report.ai_flags.map((f, i) => (
                      <span key={i} className="text-[10px] bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded-full">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-700 hover:bg-green-600" onClick={() => moderateReport(report.id, 'approved')}>
                    <CheckCircle size={14} className="mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-700 text-red-300" onClick={() => moderateReport(report.id, 'rejected')}>
                    <X size={14} className="mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
            {pendingReports.length === 0 && <p className="text-center text-gray-500 py-8">No pending reports</p>}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4 space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2"><Send size={16} /> Push Manual Alert</h3>
              <Input placeholder="Alert title" value={alertForm.title} onChange={e => setAlertForm(p => ({...p, title: e.target.value}))} className="bg-gray-700 border-gray-600 text-white" />
              <Textarea placeholder="Alert message" value={alertForm.message} onChange={e => setAlertForm(p => ({...p, message: e.target.value}))} className="bg-gray-700 border-gray-600 text-white" />
              <div className="grid grid-cols-3 gap-2">
                <Select value={alertForm.city} onValueChange={v => setAlertForm(p => ({...p, city: v}))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CITIES).map(([k, c]) => <SelectItem key={k} value={k}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input placeholder="Ward" value={alertForm.ward} onChange={e => setAlertForm(p => ({...p, ward: e.target.value}))} className="bg-gray-700 border-gray-600 text-white" />
                <Select value={alertForm.risk_level} onValueChange={v => setAlertForm(p => ({...p, risk_level: v}))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="amber">Amber</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={pushManualAlert} disabled={sendingAlert || !alertForm.title} className="bg-purple-600 hover:bg-purple-700">
                <Bell size={14} className="mr-2" /> Push Alert
              </Button>
            </div>

            {alerts.map(alert => (
              <div key={alert.id} className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RiskBadge level={alert.risk_level} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-white">{alert.title}</p>
                    <p className="text-xs text-gray-500">{alert.city} • {alert.ward} • {moment(alert.created_date).fromNow()}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-gray-500" onClick={async () => {
                  await base44.entities.Alert.update(alert.id, { is_active: false });
                  queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
                }}>
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Shelters Tab */}
        {activeTab === 'shelters' && (
          <div className="space-y-3">
            {shelters.map(shelter => (
              <div key={shelter.id} className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{shelter.name}</p>
                  <p className="text-xs text-gray-500">{shelter.city} • {shelter.ward} • {shelter.current_occupancy || 0}/{shelter.capacity || '?'}</p>
                </div>
                <Select value={shelter.status || 'open'} onValueChange={v => updateShelterStatus(shelter.id, v)}>
                  <SelectTrigger className="w-24 bg-gray-700 border-gray-600 text-white text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
