import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { getUserInfo } from '../api/user';

interface UserStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  fetchUserInfo: () => Promise<void>;
  clearUser: () => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      isAdmin: false,
      
      setUser: (user: User | null) => {
        set({ 
          user, 
          isAdmin: user?.isAdmin || false,
          error: null 
        });
      },
      
      fetchUserInfo: async () => {
        try {
          set({ isLoading: true, error: null });
          const userInfo = await getUserInfo();
          set({ 
            user: userInfo, 
            isAdmin: userInfo.isAdmin || false,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Ошибка получения данных пользователя',
            isLoading: false 
          });
        }
      },
      
      clearUser: () => {
        set({ user: null, isAdmin: false, error: null });
      },
      
      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'mnogo-rolly-user',
      partialize: (state) => ({ 
        user: state.user,
        isAdmin: state.isAdmin 
      }),
    }
  )
);
