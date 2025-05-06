
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

interface User {
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem("bank-user");
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation - in a real app, this would be an API call
      if (email && password.length >= 6) {
        // For demo, create a user with the email
        const userData = { email, name: email.split('@')[0] };
        
        setUser(userData);
        localStorage.setItem("bank-user", JSON.stringify(userData));
        
        toast({
          title: "Login Successful",
          description: "Welcome to Stellar Loan Compass",
        });
        
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("bank-user");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
