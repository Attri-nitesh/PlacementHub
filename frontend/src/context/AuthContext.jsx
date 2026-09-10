import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth state on mount via HttpOnly cookie
  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await authApi.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password, role) => {
    const res = await authApi.login(email, password, role);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const registerStudent = async (data) => {
    const res = await authApi.registerStudent(data);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const googleAuth = async (googleData) => {
    const res = await authApi.googleAuth(googleData);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const setRole = async (roleData) => {
    const res = await authApi.setRole(roleData);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        role: user?.role || null,
        login,
        registerStudent,
        googleAuth,
        setRole,
        logout,
        checkAuth,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
