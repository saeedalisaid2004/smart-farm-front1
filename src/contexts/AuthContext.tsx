import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getSavedAvatarUrl } from "@/services/avatarService";

interface AppUser {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
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
        const parsed = JSON.parse(stored);
        const savedAvatar = getSavedAvatarUrl(parsed.id || parsed.email);
        setUserState(savedAvatar ? { ...parsed, avatar_url: savedAvatar } : parsed);
      } catch {
        localStorage.removeItem("app_user");
      }
    }
    setLoading(false);
  }, []);

  const setUser = (u: AppUser | null) => {
    if (u) {
      const savedAvatar = u.avatar_url || getSavedAvatarUrl(u.id || u.email);
      const nextUser = savedAvatar ? { ...u, avatar_url: savedAvatar } : u;
      setUserState(nextUser);

      const { avatar_url, ...rest } = nextUser;
      localStorage.setItem("app_user", JSON.stringify(rest));
      return;
    }

    setUserState(null);
    localStorage.removeItem("app_user");
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
