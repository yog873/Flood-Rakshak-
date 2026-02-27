import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useApp } from '../components/shared/useAppContext';
import { t, CITIES, SEVERITY_COLORS, RISK_COLORS } from '../components/shared/translations';
import { Layers, MapPin, Shield, AlertTriangle, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RiskBadge from '../components/shared/RiskBadge';
import 'leaflet/dist/leaflet.css';

function LocationMarker() {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const p = [pos.coords.latitude, pos.coords.longitude];
        setPosition(p);
      });
    }
  }, [map]);

  if (!position) return null;
  return (
    <CircleMarker center={position} radius={8} pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.8 }}>
      <Popup>Your Location</Popup>
    </CircleMarker>
  );
}

export default function FloodMap() {
  const { userProfile, language } = useApp();
  const city = userProfile?.city || 'mumbai';
  const cityData = CITIES[city];
  const [layers, setLayers] = useState({ reports: true, shelters: true, risk: true });

  const { data: reports = [] } = useQuery({
    queryKey: ['reports-map', city],
    queryFn: () => base44.entities.FloodReport.filter({ city }, '-created_date', 50),
  });

  const { data: shelters = [] } = useQuery({
    queryKey: ['shelters-map', city],
    queryFn: () => base44.entities.Shelter.filter({ city }, 'name', 50),
  });

  const toggleLayer = (layer) => setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));

  return (
    <div className="h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-900/90 backdrop-blur border-b border-gray-800 flex items-center justify-between z-[1000] relative">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Navigation size={18} className="text-blue-400" />
          {t(language, 'map')} — {cityData?.name}
        </h2>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[cityData?.lat || 19.076, cityData?.lng || 72.877]}
          zoom={12}
          className="h-full w-full"
          style={{ background: '#111827' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; CartoDB'
          />
          <LocationMarker />

          {/* Shelter markers */}
          {layers.shelters && shelters.map(shelter => (
            shelter.latitude && shelter.longitude ? (
              <CircleMarker
                key={shelter.id}
                center={[shelter.latitude, shelter.longitude]}
                radius={10}
                pathOptions={{
                  color: shelter.status === 'open' ? '#10B981' : shelter.status === 'full' ? '#F59E0B' : '#6B7280',
                  fillColor: shelter.status === 'open' ? '#10B981' : shelter.status === 'full' ? '#F59E0B' : '#6B7280',
                  fillOpacity: 0.6
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{shelter.name}</strong>
                    <div className="text-gray-600">{shelter.address}</div>
                    <div className="mt-1">
                      Capacity: {shelter.current_occupancy || 0}/{shelter.capacity || '?'}
                      <span className={`ml-2 font-medium ${shelter.status === 'open' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {shelter.status?.toUpperCase()}
                      </span>
                    </div>
                    {shelter.contact_number && <div>📞 {shelter.contact_number}</div>}
                  </div>
                </Popup>
              </CircleMarker>
            ) : null
          ))}

          {/* Report markers */}
          {layers.reports && reports.map(report => (
            report.latitude && report.longitude ? (
              <CircleMarker
                key={report.id}
                center={[report.latitude, report.longitude]}
                radius={7}
                pathOptions={{
                  color: SEVERITY_COLORS[report.severity] || '#EF4444',
                  fillColor: SEVERITY_COLORS[report.severity] || '#EF4444',
                  fillOpacity: 0.7
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold">{report.severity?.replace(/_/g, ' ')}</div>
                    <div className="text-gray-600">{report.description?.substring(0, 100)}</div>
                    {report.verification_status === 'verified' && (
                      <span className="text-green-600 text-xs font-medium">✓ Verified</span>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ) : null
          ))}
        </MapContainer>

        {/* Layer Toggle */}
        <div className="absolute top-3 right-3 z-[1000] bg-gray-900/95 backdrop-blur rounded-xl border border-gray-700 p-2 space-y-1">
          <button
            onClick={() => toggleLayer('reports')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all w-full ${layers.reports ? 'bg-orange-900/50 text-orange-300' : 'text-gray-500'}`}
          >
            <AlertTriangle size={12} /> Reports
          </button>
          <button
            onClick={() => toggleLayer('shelters')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all w-full ${layers.shelters ? 'bg-green-900/50 text-green-300' : 'text-gray-500'}`}
          >
            <Shield size={12} /> Shelters
          </button>
          <button
            onClick={() => toggleLayer('risk')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all w-full ${layers.risk ? 'bg-red-900/50 text-red-300' : 'text-gray-500'}`}
          >
            <Layers size={12} /> Risk Zones
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-24 left-3 z-[1000] bg-gray-900/95 backdrop-blur rounded-xl border border-gray-700 p-3 space-y-1.5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Legend</div>
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <div className="w-3 h-3 rounded-full bg-blue-500" /> Your Location
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <div className="w-3 h-3 rounded-full bg-green-500" /> Open Shelter
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <div className="w-3 h-3 rounded-full bg-yellow-500" /> Full Shelter
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <div className="w-3 h-3 rounded-full bg-red-500" /> Flood Report
          </div>
        </div>
      </div>
    </div>
  );
}
