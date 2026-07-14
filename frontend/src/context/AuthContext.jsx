import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import API from '../api/axios';

const AuthContext = createContext(null);

const USER_STORAGE_KEY = 'user:v1';

const getStoredUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const savedUser = localStorage.getItem(
    USER_STORAGE_KEY
  );

  try {
    if (
      savedUser &&
      savedUser !== 'undefined'
    ) {
      return JSON.parse(savedUser);
    }
  } catch (err) {
    console.error(
      'Auth initialization error:',
      err
    );

    // Remove only corrupted auth data.
    localStorage.removeItem(
      USER_STORAGE_KEY
    );
  }

  return null;
};

const register = async (data) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      role = 'seller',
      acceptedTerms,
    } = data;

    await API.post(
      '/auth/register',
      {
        name,
        email,
        mobile,
        password,
        role,
        acceptedTerms,
      }
    );

    return true;
  } catch (error) {
    console.log(
      'Register error response:',
      error.response?.data
    );

    const backendData =
      error.response?.data;

    let errMsg = '';

    if (backendData) {
      if (backendData.message) {
        errMsg =
          backendData.message;
      } else if (
        Array.isArray(
          backendData.errors
        ) &&
        backendData.errors.length
      ) {
        errMsg =
          backendData.errors[0]?.msg ||
          'Invalid input';
      }
    }

    throw (
      errMsg ||
      'Registration failed. Please check your details.'
    );
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const loading = false;

  const login = useCallback(async (creds) => {
    try {
      const {
        email,
        mobile,
        password,
      } = creds;

      const payload = {
        email: email
          ? email.trim().toLowerCase()
          : undefined,

        mobile: mobile
          ? mobile.trim()
          : undefined,

        password,
      };

      const response = await API.post(
        '/auth/login',
        payload
      );

      const {
        user: userData,
        token: authToken,
      } = response.data;

      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(userData)
      );
      sessionStorage.removeItem(
        `subscriptionPromptSeen_${userData._id}`
      );

      setUser(userData);

      return userData;
    } catch (error) {
      let errMsg = '';

      if (error.response) {
        const backendData =
          error.response.data;

        errMsg =
          backendData.message ||
          (
            Array.isArray(
              backendData.errors
            )
              ? backendData.errors[0]?.msg
              : 'Invalid credentials'
          );
      } else if (error.request) {
        errMsg =
          'Backend server is not reachable. Please ensure the server is running on port 5000.';
      } else {
        errMsg = error.message;
      }

      console.error(
        'Login error:',
        errMsg
      );

      throw (
        errMsg ||
        'Login failed. Please check your credentials.'
      );
    }
  }, []);

  const googleLogin = useCallback(async (idToken) => {
    try {
      const response = await API.post(
        '/auth/google',
        {
          idToken,
        }
      );

      const {
        user: userData,
        token: authToken,
      } = response.data;

      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(userData)
      );
      sessionStorage.removeItem(
        `subscriptionPromptSeen_${userData._id}`
      );

      setUser(userData);

      return userData;
    } catch (error) {
      let errMsg = '';

      if (error.response) {
        const backendData =
          error.response.data;

        errMsg =
          backendData.message ||
          (
            Array.isArray(
              backendData.errors
            )
              ? backendData.errors[0]?.msg
              : 'Google sign-in failed'
          );
      } else if (error.request) {
        errMsg =
          'Backend server is not reachable. Please ensure the server is running on port 5002.';
      } else {
        errMsg = error.message;
      }

      console.error(
        'Google login error:',
        errMsg
      );

      throw (
        errMsg ||
        'Google login failed. Please try again.'
      );
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await API.post(
        '/auth/logout'
      );
    } catch (err) {
      console.error(
        'Logout error:',
        err
      );
    } finally {
      localStorage.removeItem(
        USER_STORAGE_KEY
      );
      setUser(null);
    }
  }, []);

  const updateSession = useCallback((nextSession) => {
    const nextUser = nextSession?.user || nextSession;
    if (nextUser) {
      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(nextUser)
      );

      setUser(nextUser);
    }
  }, []);

  const authValue = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      googleLogin,
      logout,
      updateSession,
    }),
    [user, loading, login, googleLogin, logout, updateSession]
  );

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};

