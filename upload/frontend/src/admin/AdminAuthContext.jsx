// Who is signed into the ADMIN CONSOLE. Deliberately a different context from
// the user-side AuthContext: the two panels have independent sessions.

import { createContext, useCallback, useContext, useState } from 'react';
import adminApi, { ADMIN_KEY, ADMIN_TOKEN_KEY } from '../api/adminApi';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem(ADMIN_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email, password) => {
    const { data } = await adminApi.post('/admin/login', { email, password });
    localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data.admin;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
