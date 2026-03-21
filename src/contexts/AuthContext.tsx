import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AppUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  setUser: (user: AppUser | null) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("app_user");
    if (stored) {
      try {
        setUserState(JSON.parse(stored));
      } catch {
        localStorage.removeItem("app_user");
      }
    }
    setLoading(false);
  }, []);

  const setUser = (u: AppUser | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem("app_user", JSON.stringify(u));
    } else {
      localStorage.removeItem("app_user");
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("external_user_id");
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
