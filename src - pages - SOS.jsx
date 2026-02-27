import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '../components/shared/useAppContext';
import { t, CITIES } from '../components/shared/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { Siren, MapPin, Clock, Phone, X, Radio, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import moment from 'moment';

export default function SOS() {
  const { userProfile, language, currentUser } = useApp();
  const city = userProfile?.city || 'mumbai';
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [activated, setActivated] = useState(false);
  const [activeSOS, setActiveSOS] = useState(null);
  const [location, setLocation] = useState(null);
  const holdTimer = useRef(null);
  const progressTimer = useRef(null);
  const queryClient = useQueryClient();

  const { data: activeSOSEvents = [] } = useQuery({
    queryKey: ['active-sos', city],
    queryFn: () => base44.entities.SOSEvent.filter({ city, status: 'active' }, '-created_date', 20),
    refetchInterval: 10000,
  });

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
    // Check if user has active SOS
    const checkActive = async () => {
      if (currentUser?.email) {
        const myActive = await base44.entities.SOSEvent.filter({ reporter_email: currentUser.email, status: 'active' });
        if (myActive.length > 0) {
          setActiveSOS(myActive[0]);
          setActivated(true);
        }
      }
    };
    checkActive();
  }, [currentUser]);

  const startHold = () => {
    setHolding(true);
    setHoldProgress(0);
    progressTimer.current = setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer.current);
          triggerSOS();
          return 100;
        }
        return prev + (100 / 30); // 3 seconds = 30 intervals of 100ms
      });
    }, 100);
  };

  const endHold = () => {
    setHolding(false);
    setHoldProgress(0);
    if (progressTimer.current) clearInterval(progressTimer.current);
  };

  const triggerSOS = async () => {
    setHolding(false);
    const sos = await base44.entities.SOSEvent.create({
      latitude: location?.lat,
      longitude: location?.lng,
      city,
      ward: userProfile?.ward || '',
      status: 'active',
      emergency_contact: userProfile?.emergency_contact || '',
      reporter_name: currentUser?.full_name || 'Unknown',
      reporter_email: currentUser?.email || '',
    });
    setActiveSOS(sos);
    setActivated(true);
    queryClient.invalidateQueries({ queryKey: ['active-sos'] });

    // Send notification via email if emergency contact exists
    if (userProfile?.emergency_contact) {
      try {
        await base44.integrations.Core.SendEmail({
          to: userProfile.emergency_contact,
          subject: `🚨 SOS ALERT from ${currentUser?.full_name || 'User'}`,
          body: `Emergency SOS activated!\nLocation: ${location?.lat}, ${location?.lng}\nCity: ${city}\nTime: ${new Date().toISOString()}\n\nPlease contact local emergency services.`
        });
      } catch (e) { /* Continue even if email fails */ }
    }
  };

  const cancelSOS = async () => {
    if (activeSOS?.id) {
      await base44.entities.SOSEvent.update(activeSOS.id, { status: 'cancelled' });
      setActivated(false);
      setActiveSOS(null);
      queryClient.invalidateQueries({ queryKey: ['active-sos'] });
    }
  };

  if (activated && activeSOS) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-950 border border-red-800 rounded-2xl p-6 text-center space-y-4"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-red-900 flex items-center justify-center mx-auto"
            >
              <Siren size={40} className="text-red-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-red-300">{t(language, 'sosActivated')}</h2>
            <div className="space-y-2 text-sm text-red-200">
              <div className="flex items-center justify-center gap-2">
                <MapPin size={14} />
                <span>{t(language, 'gpsSent')}: {location?.lat?.toFixed(4)}, {location?.lng?.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Clock size={14} />
                <span>{moment(activeSOS.created_date).format('hh:mm A, DD MMM YYYY')}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Radio size={14} />
                <span>{t(language, 'contactsNotified')}</span>
              </div>
            </div>
            <Button onClick={cancelSOS} variant="outline" className="border-red-700 text-red-300 hover:bg-red-900">
              <X size={16} className="mr-2" /> {t(language, 'cancelSOS')}
            </Button>
          </motion.div>

          {/* Active SOS in city */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Radio size={14} className="text-red-400 animate-pulse" />
              {t(language, 'activeSOS')} ({activeSOSEvents.length})
            </h3>
            {activeSOSEvents.map(sos => (
              <div key={sos.id} className="bg-gray-800/60 rounded-xl p-3 flex items-center gap-3 border border-gray-700/50">
                <div className="w-8 h-8 rounded-full bg-red-900/50 flex items-center justify-center">
                  <User size={14} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{sos.reporter_name || 'Anonymous'}</p>
                  <p className="text-xs text-gray-500">{sos.ward || sos.city} • {moment(sos.created_date).fromNow()}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Emergency Numbers */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{t(language, 'emergencyNumbers')}</h3>
            <a href="tel:1078" className="flex items-center gap-3 bg-gray-800 rounded-xl p-3 border border-gray-700">
              <Phone size={18} className="text-green-400" />
              <div>
                <p className="text-sm font-medium text-white">NDRF - 1078</p>
                <p className="text-xs text-gray-500">National Disaster Response Force</p>
              </div>
            </a>
            <a href={`tel:${CITIES[city]?.helpline}`} className="flex items-center gap-3 bg-gray-800 rounded-xl p-3 border border-gray-700">
              <Phone size={18} className="text-blue-400" />
              <div>
                <p className="text-sm font-medium text-white">{CITIES[city]?.name} Helpline - {CITIES[city]?.helpline}</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full space-y-8 text-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">{t(language, 'sosTrigger')}</h2>
          <p className="text-sm text-gray-400">{t(language, 'holdToActivate')}</p>
        </div>

        {/* SOS Button */}
        <div className="relative flex items-center justify-center">
          <svg className="w-52 h-52 -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" stroke="#1F2937" strokeWidth="8" fill="none" />
            <circle
              cx="100" cy="100" r="90"
              stroke="#EF4444"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 90}
              strokeDashoffset={2 * Math.PI * 90 * (1 - holdProgress / 100)}
              className="transition-all duration-100"
            />
          </svg>
          <button
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            className={`absolute w-40 h-40 rounded-full flex items-center justify-center transition-all ${
              holding ? 'bg-red-700 scale-95' : 'bg-red-600 hover:bg-red-500 active:scale-95'
            } shadow-2xl shadow-red-600/40`}
          >
            <Siren size={56} className="text-white" />
          </button>
        </div>

        {/* Active SOS count */}
        {activeSOSEvents.length > 0 && (
          <div className="bg-red-950/40 rounded-xl p-4 border border-red-900/50">
            <p className="text-sm text-red-300">
              <Radio size={12} className="inline mr-1 animate-pulse" />
              {activeSOSEvents.length} {t(language, 'activeSOS')} in {CITIES[city]?.name}
            </p>
          </div>
        )}

        {/* Emergency Numbers */}
        <div className="space-y-2">
          <a href="tel:1078" className="flex items-center justify-center gap-3 bg-gray-800 rounded-xl p-3 border border-gray-700">
            <Phone size={18} className="text-green-400" />
            <span className="text-sm font-medium">NDRF - 1078</span>
          </a>
          <a href="tel:112" className="flex items-center justify-center gap-3 bg-gray-800 rounded-xl p-3 border border-gray-700">
            <Phone size={18} className="text-blue-400" />
            <span className="text-sm font-medium">Emergency - 112</span>
          </a>
        </div>
      </div>
    </div>
  );
}
