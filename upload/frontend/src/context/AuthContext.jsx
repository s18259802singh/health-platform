// Who is signed into the PUBLIC / MEMBER side of LifeLink.
// The admin console has its own context (admin/AdminAuthContext.jsx) and its
// own token, so the two sessions are completely independent.

import { createContext, useCallback, useContext, useState } from 'react';
import api, { DEMO, USER_KEY, USER_TOKEN_KEY } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const persist = (data) => {
    localStorage.setItem(USER_TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const login = useCallback(async (email, password) => {
    if (DEMO) {
      return persist({ token: 'demo', user: { id: 'demo', name: 'Dhruv Shah', email, role: 'user' } });
    }
    const { data } = await api.post('/auth/login', { email, password });
    return persist(data);
  }, []);

  const register = useCallback(async (formData) => {
    if (DEMO) {
      return persist({ token: 'demo', user: { id: 'demo', name: formData.name || 'New member', email: formData.email, role: 'user' } });
    }
    const { data } = await api.post('/auth/register', formData);
    return persist(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
