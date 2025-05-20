
import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is logged in when app loads
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // For demo purposes, we're using localStorage
  // In a real app, you would connect to MongoDB here
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Simulated API call
      const mockResponse = {
        id: '1',
        username: email.split('@')[0],
        email,
      };
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(mockResponse));
      setUser(mockResponse);
      toast.success("Successfully logged in!");
    } catch (error) {
      toast.error("Failed to login. Please try again.");
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      // Simulated API call
      const mockResponse = {
        id: Date.now().toString(),
        username,
        email,
      };
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(mockResponse));
      setUser(mockResponse);
      toast.success("Registration successful!");
    } catch (error) {
      toast.error("Failed to register. Please try again.");
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    toast.success("Successfully logged out!");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
