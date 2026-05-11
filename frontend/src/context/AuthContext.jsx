/**
 * context/AuthContext.jsx
 * Provides auth state and methods (login, register, logout, updateUser)
 * using backend API calls only. No localStorage user data — only the JWT token
 * is stored in localStorage for subsequent request auth headers.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { storage } from '../utils/storage';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: if a token exists, fetch the current user from the backend
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then(async (res) => {
        setUser(res.data.data);
        try {
          await storage.initForUser(res.data.data);
        } catch (_) {}
      })
      .catch(() => {
        // Token invalid or expired — remove it
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  // ── LOGIN ──────────────────────────────────
  // Returns null on success, error string on failure
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      try {
        await storage.initForUser(res.data.user);
      } catch (_) {}
      return null;
    } catch (err) {
      return err.response?.data?.message || 'Login failed. Please try again.';
    }
  };

  // ── REGISTER ───────────────────────────────
  const register = async (form) => {
    try {
      const res = await api.post('/auth/register', {
        name:          form.name,
        email:         form.email,
        password:      form.password,
        branch:        form.branch,
        examTarget:    form.examTarget,
        semester:      form.semester || '',
        acceptedTerms: Boolean(form.acceptedTerms),
      });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      try {
        await storage.initForUser(res.data.user);
      } catch (_) {}
      return null;
    } catch (err) {
      return err.response?.data?.message || 'Registration failed. Please try again.';
    }
  };

  // ── LOGOUT ─────────────────────────────────
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {
      // Even if the request fails, we still log out on the client
    }
    localStorage.removeItem('token');
    storage.clear();
    setUser(null);
  };

  // ── UPDATE USER ────────────────────────────
  const updateUser = async (updates) => {
    try {
      const res = await api.put('/auth/update-profile', updates);
      setUser(res.data.data);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {!loading && children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
