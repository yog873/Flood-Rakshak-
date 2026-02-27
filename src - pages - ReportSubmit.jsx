import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useApp } from '../components/shared/useAppContext';
import { t } from '../components/shared/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, MapPin, Upload, ArrowLeft, Loader2, CheckCircle, Crosshair } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ReportSubmit() {
  const { userProfile, language, currentUser } = useApp();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [form, setForm] = useState({
    description: '',
    severity: '',
    latitude: null,
    longitude: null,
    photo_url: '',
    language: language,
    city: userProfile?.city || 'mumbai',
    ward: userProfile?.ward || '',
  });
  const [locationStatus, setLocationStatus] = useState('idle');

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    setLocationStatus('loading');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
          setLocationStatus('success');
        },
        () => setLocationStatus('error'),
        { enableHighAccuracy: true }
      );
    } else {
      setLocationStatus('error');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, photo_url: file_url }));
  };

  const handleSubmit = async () => {
    if (!form.severity) {
      toast.error('Please select a severity level');
      return;
    }
    setSubmitting(true);
    try {
      // AI analysis of the report
      setAnalyzing(true);
      let aiFlags = [];
      let aiScore = 0;
      try {
        const aiResult = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze this flood report for severity and urgency. Report: "${form.description}". Severity selected: ${form.severity}. Return a JSON with severity_score (0-100) and detected_flags (array of keywords like "people stranded", "wall collapse", "cars floating", "water rising", etc.)`,
          response_json_schema: {
            type: "object",
            properties: {
              severity_score: { type: "number" },
              detected_flags: { type: "array", items: { type: "string" } }
            }
          }
        });
        aiScore = aiResult.severity_score || 0;
        aiFlags = aiResult.detected_flags || [];
      } catch (e) {
        // AI analysis failed, continue without it
      }
      setAnalyzing(false);

      await base44.entities.FloodReport.create({
        ...form,
        reporter_name: currentUser?.full_name || 'Anonymous',
        ai_severity_score: aiScore,
        ai_flags: aiFlags,
        corroboration_count: 0,
        corroborated_by: [],
        verification_status: 'unverified',
        moderation_status: 'pending'
      });

      setSubmitted(true);
      setTimeout(() => navigate(createPageUrl('Community')), 2000);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-20 h-20 rounded-full bg-green-900/50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Report Submitted!</h2>
          <p className="text-gray-400 text-sm">Thank you for contributing to community safety.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Community')}>
            <Button variant="ghost" size="icon" className="text-gray-400">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <h2 className="text-xl font-bold">{t(language, 'submitReport')}</h2>
        </div>

        {/* Severity */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">{t(language, 'severity')} *</label>
          <div className="grid grid-cols-2 gap-2">
            {['waterlogging', 'knee_deep', 'waist_deep', 'dangerous_flow', 'structural_damage'].map(sev => (
              <button
                key={sev}
                onClick={() => setForm(prev => ({ ...prev, severity: sev }))}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                  form.severity === sev
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400'
                }`}
              >
                {t(language, sev)}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">{t(language, 'description')}</label>
          <Textarea
            placeholder={t(language, 'addDescription')}
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-600 min-h-[100px]"
          />
        </div>

        {/* Photo */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">{t(language, 'photo')}</label>
          {form.photo_url ? (
            <div className="relative rounded-xl overflow-hidden h-40">
              <img src={form.photo_url} alt="Upload" className="w-full h-full object-cover" />
              <button
                onClick={() => setForm(prev => ({ ...prev, photo_url: '' }))}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5"
              >✕</button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 py-8 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-gray-600 transition-colors">
              <Camera size={20} className="text-gray-500" />
              <span className="text-sm text-gray-500">{t(language, 'uploadPhoto')}</span>
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">{t(language, 'location')}</label>
          <div className="bg-gray-800 rounded-xl p-3 flex items-center justify-between border border-gray-700">
            <div className="flex items-center gap-2">
              <MapPin size={16} className={locationStatus === 'success' ? 'text-green-400' : 'text-gray-500'} />
              {locationStatus === 'loading' && <span className="text-xs text-gray-400">Detecting...</span>}
              {locationStatus === 'success' && (
                <span className="text-xs text-green-400">
                  {form.latitude?.toFixed(4)}, {form.longitude?.toFixed(4)}
                </span>
              )}
              {locationStatus === 'error' && <span className="text-xs text-red-400">Location unavailable</span>}
            </div>
            <Button size="sm" variant="ghost" onClick={getLocation} className="text-gray-400">
              <Crosshair size={14} />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Latitude"
              type="number"
              step="any"
              value={form.latitude || ''}
              onChange={e => setForm(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
              className="bg-gray-800 border-gray-700 text-white text-xs"
            />
            <Input
              placeholder="Longitude"
              type="number"
              step="any"
              value={form.longitude || ''}
              onChange={e => setForm(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
              className="bg-gray-800 border-gray-700 text-white text-xs"
            />
          </div>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">{t(language, 'language')}</label>
          <Select value={form.language} onValueChange={v => setForm(prev => ({ ...prev, language: v }))}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिन्दी</SelectItem>
              <SelectItem value="ta">தமிழ்</SelectItem>
              <SelectItem value="bn">বাংলা</SelectItem>
              <SelectItem value="as">অসমীয়া</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={submitting || !form.severity}
          className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              {analyzing ? 'AI Analyzing...' : 'Submitting...'}
            </span>
          ) : (
            t(language, 'submit')
          )}
        </Button>
      </div>
    </div>
  );
}
