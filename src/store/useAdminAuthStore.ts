import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminAuthState {
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  verifySession: () => Promise<boolean>;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        try {
          const response = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });

          const data = await response.json();

          if (data.success && data.token) {
            set({ token: data.token, isAuthenticated: true });
            return { success: true, message: data.message };
          } else {
            return { success: false, message: data.message || 'Erro ao fazer login' };
          }
        } catch (error) {
          console.error('Erro no login:', error);
          return { success: false, message: 'Erro ao conectar com o servidor' };
        }
      },

      logout: async () => {
        const { token } = get();

        if (token) {
          try {
            await fetch(`${API_URL}/admin/logout`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
          } catch (error) {
            console.error('Erro no logout:', error);
          }
        }

        set({ token: null, isAuthenticated: false });
      },

      verifySession: async () => {
        const { token } = get();

        if (!token) {
          set({ isAuthenticated: false });
          return false;
        }

        try {
          const response = await fetch(`${API_URL}/admin/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (data.success) {
            set({ isAuthenticated: true });
            return true;
          } else {
            set({ token: null, isAuthenticated: false });
            return false;
          }
        } catch (error) {
          console.error('Erro ao verificar sessão:', error);
          set({ token: null, isAuthenticated: false });
          return false;
        }
      },
    }),
    {
      name: 'admin-auth-storage',
    }
  )
);
