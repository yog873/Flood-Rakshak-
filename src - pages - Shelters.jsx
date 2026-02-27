import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useApp } from '../components/shared/useAppContext';
import { t } from '../components/shared/translations';
import { MapPin, Phone, Users, Clock, Search, Navigation, Utensils, Droplets, Heart, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function calcDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

const FACILITY_ICONS = { food: Utensils, water: Droplets, medical: Heart };

export default function Shelters() {
  const { userProfile, language } = useApp();
  const city = userProfile?.city || 'mumbai';
  const [search, setSearch] = useState('');
  const [userLoc, setUserLoc] = useState(null);
  const [selectedShelter, setSelectedShelter] = useState(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }, []);

  const { data: shelters = [], isLoading } = useQuery({
    queryKey: ['shelters', city],
    queryFn: () => base44.entities.Shelter.filter({ city }, 'name', 50),
  });

  const enrichedShelters = shelters
    .map(s => ({
      ...s,
      dist: userLoc ? calcDistance(userLoc.lat, userLoc.lng, s.latitude, s.longitude) : null,
      walkMinutes: userLoc && s.latitude ? Math.round(calcDistance(userLoc.lat, userLoc.lng, s.latitude, s.longitude) / 5 * 60) : null
    }))
    .filter(s => !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.address?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.dist || 999) - (b.dist || 999));

  const statusColors = { open: 'bg-green-900 text-green-300', full: 'bg-yellow-900 text-yellow-300', closed: 'bg-gray-700 text-gray-400' };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="text-gray-400"><ArrowLeft size={20} /></Button>
          </Link>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MapPin size={20} className="text-green-400" />
            {t(language, 'nearestShelters')}
          </h2>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder={t(language, 'search') + '...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-600"
          />
        </div>

        <div className="space-y-3">
          {enrichedShelters.map((shelter, i) => (
            <motion.div
              key={shelter.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedShelter(selectedShelter?.id === shelter.id ? null : shelter)}
              className={`bg-gray-800/60 rounded-xl border transition-all cursor-pointer ${
                selectedShelter?.id === shelter.id ? 'border-green-700 bg-gray-800' : 'border-gray-700/50'
              }`}
            >
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{shelter.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{shelter.address || shelter.ward}</p>
                  </div>
                  <Badge className={statusColors[shelter.status] || statusColors.open}>
                    {t(language, shelter.status || 'open')}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400">
                  {shelter.dist !== null && (
                    <span className="flex items-center gap-1">
                      <Navigation size={11} /> {shelter.dist.toFixed(1)} km
                    </span>
                  )}
                  {shelter.walkMinutes && (
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> ~{shelter.walkMinutes} min walk
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users size={11} /> {shelter.current_occupancy || 0}/{shelter.capacity || '?'}
                  </span>
                </div>

                {selectedShelter?.id === shelter.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="pt-3 border-t border-gray-700 space-y-2"
                  >
                    {shelter.contact_number && (
                      <a href={`tel:${shelter.contact_number}`} className="flex items-center gap-2 text-sm text-blue-400">
                        <Phone size={14} /> {shelter.contact_number}
                      </a>
                    )}
                    {shelter.facilities?.length > 0 && (
                      <div className="flex gap-2">
                        {shelter.facilities.map(f => {
                          const Icon = FACILITY_ICONS[f] || MapPin;
                          return (
                            <span key={f} className="flex items-center gap-1 text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300">
                              <Icon size={10} /> {f}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    {shelter.latitude && shelter.longitude && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${shelter.latitude},${shelter.longitude}&travelmode=walking`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" className="w-full bg-green-700 hover:bg-green-600 mt-2">
                          <Navigation size={14} className="mr-2" /> Get Walking Directions
                        </Button>
                      </a>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}

          {enrichedShelters.length === 0 && !isLoading && (
            <div className="text-center py-12 text-gray-500">
              <MapPin size={40} className="mx-auto mb-3 opacity-30" />
              <p>{t(language, 'noData')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
