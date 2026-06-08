import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import {
  getCurrentUser,
  loginLocalUser,
  logoutLocalUser,
} from '@/storage/userStorage';
import { LocalUser } from '@/types/user';

type AuthContextValue = {
  currentUser: LocalUser | null;
  isAuthLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setCurrentUser)
      .finally(() => setIsAuthLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isAuthLoading,
      login: async (username, password) => {
        setCurrentUser(await loginLocalUser(username, password));
      },
      logout: async () => {
        await logoutLocalUser();
        setCurrentUser(null);
      },
    }),
    [currentUser, isAuthLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
