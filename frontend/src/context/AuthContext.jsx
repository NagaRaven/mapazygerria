import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('zygerria_token');
    localStorage.removeItem('zygerria_user');
    api.defaults.headers.common['Authorization'] = '';
    setIsAuthenticated(false);
    setUsername(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('zygerria_token');
    const savedUser = localStorage.getItem('zygerria_user');
    if (token && savedUser) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/api/auth/verify')
        .then(() => {
          setIsAuthenticated(true);
          setUsername(savedUser);
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [logout]);

  const login = async (user, password) => {
    const res = await api.post('/api/auth/login', { username: user, password });
    const { token, username: returnedUser } = res.data;
    localStorage.setItem('zygerria_token', token);
    localStorage.setItem('zygerria_user', returnedUser);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setIsAuthenticated(true);
    setUsername(returnedUser);
    return returnedUser;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
