import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import { User, useGetMe, setAuthTokenGetter } from '@workspace/api-client-react';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('token'));

  useEffect(() => {
    setAuthTokenGetter(() => sessionStorage.getItem('token'));
    return () => setAuthTokenGetter(null);
  }, []);
  
  // Set default axios headers
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  const { data: user, isLoading, isError } = useGetMe({
    query: {
      queryKey: ['/api/auth/me'],
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (isError) {
      logout();
    }
  }, [isError]);

  const login = (newToken: string, newUser: User) => {
    sessionStorage.setItem('token', newToken);
    setToken(newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user: user || null, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
