import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check local storage for session
    const savedUser = localStorage.getItem('operator_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // 1. Operator Authenticator
    if (username === 'operator' && password === 'admin123') {
      const mockUser = { id: '1', username: 'operator', role: 'Operator' };
      localStorage.setItem('operator_session', JSON.stringify(mockUser));
      setUser(mockUser);
      return { success: true };
    }

    // 2. Farmer Authenticator via Phone Number
    try {
      const farmersList = await db.getFarmers();
      const farmerMatch = farmersList.find(f => f.phone === username);
      if (farmerMatch) {
        if (password === 'farmer123') {
          const farmerUser = {
            id: farmerMatch.id,
            username: farmerMatch.name,
            phone: farmerMatch.phone,
            village: farmerMatch.village,
            role: 'Farmer'
          };
          localStorage.setItem('operator_session', JSON.stringify(farmerUser));
          setUser(farmerUser);
          return { success: true };
        } else {
          return { success: false, error: 'Invalid farmer password. Use "farmer123".' };
        }
      }
    } catch (err) {
      console.error('Farmer login database lookup failed:', err);
    }

    return { success: false, error: 'Invalid operator credentials or unregistered farmer phone number.' };
  };

  const logout = () => {
    localStorage.removeItem('operator_session');
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
