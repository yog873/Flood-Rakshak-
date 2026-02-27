import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useApp } from '../components/shared/useAppContext';
import { CITIES, LANGUAGES } from '../components/shared/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Globe, ChevronRight, Shield, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Onboarding() {
  const { updateProfile } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ city: '', ward: '', pincode: '', language: 'en' });

  const steps = [
    // Welcome
    () => (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-24 h-24 rounded-full bg-blue-900/50 flex items-center justify-center mx-auto"
        >
          <Droplets size={48} className="text-blue-400" />
        </motion.div>
        <div>
          <h1 className="text-3xl font-bold text-white">Flood <span className="text-blue-400">रक्षक</span></h1>
          <p className="text-gray-400 mt-2 text-sm">AI-powered flood early warning & community safety</p>
        </div>
        <Button onClick={() => setStep(1)} className="w-full bg-blue-600 hover:bg-blue-700 h-12">
          Get Started <ChevronRight size={18} className="ml-2" />
        </Button>
      </motion.div>
    ),
    // Language
    () => (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        <div className="text-center">
          <Globe size={32} className="mx-auto text-blue-400 mb-3" />
          <h2 className="text-xl font-bold text-white">Select Language</h2>
          <p className="text-sm text-gray-400">भाषा चुनें</p>
        </div>
        <div className="space-y-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setForm(prev => ({ ...prev, language: lang.code }))}
              className={`w-full py-3 px-4 rounded-xl text-left font-medium transition-all flex items-center justify-between ${
                form.language === lang.code
                  ? 'bg-blue-600 text-white border border-blue-500'
                  : 'bg-gray-800 text-gray-300 border border-gray-700'
              }`}
            >
              <span>{lang.native}</span>
              <span className="text-sm opacity-60">{lang.name}</span>
            </button>
          ))}
        </div>
        <Button onClick={() => setStep(2)} className="w-full bg-blue-600 hover:bg-blue-700 h-12">
          Continue <ChevronRight size={18} className="ml-2" />
        </Button>
      </motion.div>
    ),
    // City
    () => (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        <div className="text-center">
          <MapPin size={32} className="mx-auto text-green-400 mb-3" />
          <h2 className="text-xl font-bold text-white">Select Your City</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(CITIES).map(([key, city]) => (
            <button
              key={key}
              onClick={() => setForm(prev => ({ ...prev, city: key }))}
              className={`py-6 px-4 rounded-xl text-center font-semibold transition-all ${
                form.city === key
                  ? 'bg-green-600 text-white border border-green-500'
                  : 'bg-gray-800 text-gray-300 border border-gray-700'
              }`}
            >
              <p className="text-lg">{city.name}</p>
              <p className="text-sm opacity-60">{city.nameHi}</p>
            </button>
          ))}
        </div>
        <Button
          onClick={() => form.city && setStep(3)}
          disabled={!form.city}
          className="w-full bg-blue-600 hover:bg-blue-700 h-12 disabled:opacity-40"
        >
          Continue <ChevronRight size={18} className="ml-2" />
        </Button>
      </motion.div>
    ),
    // Ward
    () => (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        <div className="text-center">
          <Shield size={32} className="mx-auto text-purple-400 mb-3" />
          <h2 className="text-xl font-bold text-white">Ward / Pincode</h2>
          <p className="text-sm text-gray-400">For hyper-local flood alerts</p>
        </div>
        <Input
          placeholder="Ward name or number"
          value={form.ward}
          onChange={e => setForm(prev => ({ ...prev, ward: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white h-12"
        />
        <Input
          placeholder="Pincode"
          value={form.pincode}
          onChange={e => setForm(prev => ({ ...prev, pincode: e.target.value }))}
          className="bg-gray-800 border-gray-700 text-white h-12"
        />
        <Button
          onClick={async () => {
            await updateProfile({ ...form, onboarding_complete: true });
            navigate(createPageUrl('Home'));
          }}
          className="w-full bg-green-600 hover:bg-green-700 h-12"
        >
          Start Using Flood रक्षक
        </Button>
      </motion.div>
    ),
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        {/* Progress */}
        <div className="flex gap-1 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-blue-500' : 'bg-gray-800'}`} />
          ))}
        </div>
        <AnimatePresence mode="wait">
          {steps[step]()}
        </AnimatePresence>
      </div>
    </div>
  );
}
