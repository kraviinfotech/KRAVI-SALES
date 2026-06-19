import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    try {
      if (savedUser && token && savedUser !== 'undefined') {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error("Auth initialization error:", err);
      localStorage.clear(); // Clear bad data
    } finally {
    setLoading(false);
    }
  }, []);

  const login = async (creds) => {
    try {
      const { email, mobile, password } = creds;
      // Normalize email before sending to backend (backend expects lowercase)
      const payload = {
        email: email ? email.trim().toLowerCase() : undefined,
        mobile: mobile ? mobile.trim() : undefined,
        password
      };
      const response = await API.post('/auth/login', payload);
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.removeItem(`subscriptionPromptSeen_${userData._id}`);
      setUser(userData);

      return userData;
    } catch (error) {
      let errMsg = '';

      if (error.response) {
        // The server responded with a status code out of 2xx
        const backendData = error.response.data;
        errMsg = backendData.message || (Array.isArray(backendData.errors) ? backendData.errors[0].msg : 'Invalid credentials');
      } else if (error.request) {
        // The request was made but no response was received
        errMsg = 'Backend server is not reachable. Please ensure the server is running on port 5000.';
      } else {
        errMsg = error.message;
      }

      console.error('Login error:', errMsg);
      throw errMsg || 'Login failed. Please check your credentials.';
    }
  };

  const register = async (data) => {
    try {
      const { name, email, mobile, password, role = 'seller' } = data;
      await API.post('/auth/register', { name, email, mobile, password, role });
      return true;
    } catch (error) {
      console.log('Register error response:', error.response?.data);
      const backendData = error.response?.data;
      let errMsg = '';
      if (backendData) {
        if (backendData.message) {
          errMsg = backendData.message;
        } else if (Array.isArray(backendData.errors) && backendData.errors.length) {
          errMsg = backendData.errors[0].msg || 'Invalid input';
        }
      }
      throw errMsg || 'Registration failed. Please check your details.';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateSession = ({ token, user: nextUser }) => {
    if (token) {
      localStorage.setItem('token', token);
    }
    if (nextUser) {
      localStorage.setItem('user', JSON.stringify(nextUser));
      setUser(nextUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateSession }}>
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
