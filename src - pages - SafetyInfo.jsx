import React, { useState } from 'react';
import { useApp } from '../components/shared/useAppContext';
import { t } from '../components/shared/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Waves, Radio, Package, Users, ChevronDown, AlertTriangle, LifeBuoy, Zap } from 'lucide-react';

const SAFETY_DATA = {
  before: [
    { 
      icon: 'Package', title: 'Emergency Kit',
      content: 'Keep a waterproof bag with documents, medications, flashlight, batteries, first aid kit, dry food, water bottles, and a whistle.',
      hi: { title: 'आपातकालीन किट', content: 'दस्तावेज़, दवाइयाँ, टॉर्च, बैटरी, प्राथमिक चिकित्सा किट, सूखा भोजन, पानी की बोतलें, और सीटी के साथ एक वॉटरप्रूफ बैग रखें।' }
    },
    {
      icon: 'Shield', title: 'Evacuation Plan',
      content: 'Know your nearest shelter location, evacuation routes, and meeting points. Share plan with all family members.',
      hi: { title: 'निकासी योजना', content: 'अपने निकटतम आश्रय स्थान, निकासी मार्ग और बैठक बिंदुओं को जानें। सभी परिवार के सदस्यों के साथ योजना साझा करें।' }
    },
    {
      icon: 'Radio', title: 'Stay Informed',
      content: 'Monitor IMD weather alerts, keep battery-powered radio, charge all devices before monsoon season.',
      hi: { title: 'सूचित रहें', content: 'IMD मौसम अलर्ट की निगरानी करें, बैटरी-चालित रेडियो रखें, मानसून के मौसम से पहले सभी उपकरणों को चार्ज करें।' }
    }
  ],
  during: [
    {
      icon: 'Waves', title: 'Water Safety',
      content: 'Never walk through moving water. 6 inches can knock you down. Never drive through flooded roads. Turn around, don\'t drown.',
      hi: { title: 'जल सुरक्षा', content: 'बहते पानी में कभी न चलें। 6 इंच पानी आपको गिरा सकता है। बाढ़ वाली सड़कों पर कभी ड्राइव न करें।' }
    },
    {
      icon: 'LifeBuoy', title: 'Signaling for Rescue',
      content: 'Move to highest floor. Use bright cloth, flashlight, or whistle to signal rescuers. Stay visible from above.',
      hi: { title: 'बचाव के लिए संकेत', content: 'सबसे ऊंची मंजिल पर जाएं। बचाव दल को संकेत देने के लिए चमकीले कपड़े, टॉर्च या सीटी का उपयोग करें।' }
    },
    {
      icon: 'Zap', title: 'Electrical Safety',
      content: 'Turn off electricity at main switch before flooding. Stay away from fallen power lines. Don\'t use electrical equipment in wet areas.',
      hi: { title: 'विद्युत सुरक्षा', content: 'बाढ़ से पहले मुख्य स्विच पर बिजली बंद करें। गिरी हुई बिजली लाइनों से दूर रहें।' }
    }
  ],
  after: [
    {
      icon: 'AlertTriangle', title: 'Return Safely',
      content: 'Don\'t return home until authorities say it\'s safe. Watch for damaged roads, bridges, and structures. Check for gas leaks.',
      hi: { title: 'सुरक्षित वापसी', content: 'जब तक अधिकारी सुरक्षित न कहें तब तक घर न लौटें। क्षतिग्रस्त सड़कों, पुलों और संरचनाओं पर ध्यान दें।' }
    },
    {
      icon: 'Waves', title: 'Water Contamination',
      content: 'Don\'t drink tap water until cleared. Boil water or use purification tablets. Discard food that contacted flood water.',
      hi: { title: 'जल प्रदूषण', content: 'मंजूरी मिलने तक नल का पानी न पिएं। पानी उबालें या शुद्धिकरण गोलियों का उपयोग करें।' }
    },
    {
      icon: 'Users', title: 'Children & Elderly Care',
      content: 'Keep children away from flood water. Monitor elderly for waterborne diseases. Ensure medications are available.',
      hi: { title: 'बच्चे और बुज़ुर्ग', content: 'बच्चों को बाढ़ के पानी से दूर रखें। बुज़ुर्गों में जलजनित बीमारियों की निगरानी करें।' }
    }
  ]
};

const ICON_MAP = { Shield, Waves, Radio, Package, Users, AlertTriangle, LifeBuoy, Zap };

export default function SafetyInfo() {
  const { language } = useApp();
  const [activeTab, setActiveTab] = useState('before');
  const [expandedCard, setExpandedCard] = useState(null);

  const tabs = [
    { key: 'before', label: t(language, 'before'), color: '#3B82F6' },
    { key: 'during', label: t(language, 'during'), color: '#EF4444' },
    { key: 'after', label: t(language, 'after'), color: '#10B981' },
  ];

  const cards = SAFETY_DATA[activeTab] || [];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Shield size={20} className="text-blue-400" />
          {t(language, 'safetyInfo')}
        </h2>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setExpandedCard(null); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'text-white'
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
              style={activeTab === tab.key ? { backgroundColor: tab.color } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {cards.map((card, i) => {
              const Icon = ICON_MAP[card.icon] || Shield;
              const isExpanded = expandedCard === i;
              const title = (language !== 'en' && card[language]?.title) ? card[language].title : card.title;
              const content = (language !== 'en' && card[language]?.content) ? card[language].content : card.content;

              return (
                <motion.div
                  key={`${activeTab}-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setExpandedCard(isExpanded ? null : i)}
                  className="bg-gray-800/60 rounded-xl border border-gray-700/50 overflow-hidden cursor-pointer"
                >
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${tabs.find(t => t.key === activeTab)?.color}22` }}>
                      <Icon size={20} style={{ color: tabs.find(t => t.key === activeTab)?.color }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm">{title}</h3>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0">
                          <p className="text-sm text-gray-300 leading-relaxed">{content}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
