import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useApp } from '../components/shared/useAppContext';
import { t, LANGUAGES, CITIES } from '../components/shared/translations';
import { Settings2, MapPin, Globe, Bell, Phone, Moon, Volume2, Info, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function Settings() {
  const { userProfile, language, darkMode, updateProfile } = useApp();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    city: userProfile?.city || 'mumbai',
    ward: userProfile?.ward || '',
    pincode: userProfile?.pincode || '',
    language: userProfile?.language || 'en',
    notification_preference: userProfile?.notification_preference || 'push',
    emergency_contact: userProfile?.emergency_contact || '',
    dark_mode: userProfile?.dark_mode !== false,
    alert_sound_enabled: userProfile?.alert_sound_enabled !== false,
  });

  useEffect(() => {
    if (userProfile) {
      setForm({
        city: userProfile.city || 'mumbai',
        ward: userProfile.ward || '',
        pincode: userProfile.pincode || '',
        language: userProfile.language || 'en',
        notification_preference: userProfile.notification_preference || 'push',
        emergency_contact: userProfile.emergency_contact || '',
        dark_mode: userProfile.dark_mode !== false,
        alert_sound_enabled: userProfile.alert_sound_enabled !== false,
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
    toast.success('Settings saved!');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="text-gray-400"><ArrowLeft size={20} /></Button>
          </Link>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings2 size={20} className="text-gray-400" />
            {t(language, 'settings')}
          </h2>
        </div>

        {/* City & Ward */}
        <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
            <MapPin size={14} /> {t(language, 'ward')} & {t(language, 'pincode')}
          </h3>
          <Select value={form.city} onValueChange={v => setForm(prev => ({ ...prev, city: v }))}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CITIES).map(([key, city]) => (
                <SelectItem key={key} value={key}>{city.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder={t(language, 'ward')}
            value={form.ward}
            onChange={e => setForm(prev => ({ ...prev, ward: e.target.value }))}
            className="bg-gray-700 border-gray-600 text-white"
          />
          <Input
            placeholder={t(language, 'pincode')}
            value={form.pincode}
            onChange={e => setForm(prev => ({ ...prev, pincode: e.target.value }))}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>

        {/* Language */}
        <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
            <Globe size={14} /> {t(language, 'language')}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => setForm(prev => ({ ...prev, language: lang.code }))}
                className={`py-2 rounded-lg text-sm font-medium transition-all ${
                  form.language === lang.code
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {lang.native}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
            <Bell size={14} /> {t(language, 'notifPref')}
          </h3>
          <Select value={form.notification_preference} onValueChange={v => setForm(prev => ({ ...prev, notification_preference: v }))}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="push">Push Only</SelectItem>
              <SelectItem value="sms">SMS Only</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Emergency Contact */}
        <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
            <Phone size={14} /> {t(language, 'emergencyContact')}
          </h3>
          <Input
            placeholder="Email or phone number"
            value={form.emergency_contact}
            onChange={e => setForm(prev => ({ ...prev, emergency_contact: e.target.value }))}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>

        {/* Toggles */}
        <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Moon size={14} /> {t(language, 'darkMode')}
            </div>
            <Switch checked={form.dark_mode} onCheckedChange={v => setForm(prev => ({ ...prev, dark_mode: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Volume2 size={14} /> {t(language, 'alertSound')}
            </div>
            <Switch checked={form.alert_sound_enabled} onCheckedChange={v => setForm(prev => ({ ...prev, alert_sound_enabled: v }))} />
          </div>
        </div>

        {/* Save */}
        <Button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 h-12">
          {saving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
          Save Settings
        </Button>

        {/* App Info */}
        <div className="text-center text-xs text-gray-600 space-y-1 pt-2">
          <p>{t(language, 'appVersion')}: 1.0.0</p>
          <p>{t(language, 'lastSync')}: {new Date().toLocaleString()}</p>
          <p className="mt-2">Data Sources: IMD, CWC, Community Reports</p>
        </div>
      </div>
    </div>
  );
}
