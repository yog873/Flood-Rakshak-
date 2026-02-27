import { useState, useEffect, createContext, useContext } from 'react';
import { base44 } from '@/api/base44Client';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null);
  const [language, setLanguage] = useState('en');
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      if (profiles.length > 0) {
        const profile = profiles[0];
        setUserProfile(profile);
        setLanguage(profile.language || 'en');
        setDarkMode(profile.dark_mode !== false);
      }
    } catch (e) {
      // User might not be logged in
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    try {
      if (userProfile?.id) {
        const updated = await base44.entities.UserProfile.update(userProfile.id, data);
        setUserProfile({ ...userProfile, ...data });
      } else {
        const user = await base44.auth.me();
        const created = await base44.entities.UserProfile.create({ ...data, user_email: user.email });
        setUserProfile(created);
      }
      if (data.language) setLanguage(data.language);
      if (data.dark_mode !== undefined) setDarkMode(data.dark_mode);
    } catch (e) {
      console.error('Failed to update profile', e);
    }
  };

  return (
    <AppContext.Provider value={{
      userProfile, setUserProfile, updateProfile,
      language, setLanguage,
      darkMode, setDarkMode,
      loading, currentUser, loadProfile
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

export default AppContext;
