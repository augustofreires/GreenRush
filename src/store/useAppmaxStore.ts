import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppmaxStore {
  accessToken: string;
  publicKey: string;
  apiUrl: string;
  enabled: boolean;
  trackingEnabled: boolean;
  conversionPixel: string;
  isConnected: boolean;
  lastSync: string | null;

  setAccessToken: (accessToken: string) => void;
  setPublicKey: (publicKey: string) => void;
  setApiUrl: (apiUrl: string) => void;
  setEnabled: (enabled: boolean) => void;
  setTrackingEnabled: (enabled: boolean) => void;
  setConversionPixel: (pixel: string) => void;
  setConnected: (connected: boolean) => void;
  setLastSync: (date: string) => void;
  disconnect: () => void;
}

export const useAppmaxStore = create<AppmaxStore>()(
  persist(
    (set) => ({
      accessToken: '',
      publicKey: '',
      apiUrl: 'https://admin.appmax.com.br/api/v3',
      enabled: false,
      trackingEnabled: true,
      conversionPixel: '',
      isConnected: false,
      lastSync: null,

      setAccessToken: (accessToken) => set({ accessToken }),
      setPublicKey: (publicKey) => set({ publicKey }),
      setApiUrl: (apiUrl) => set({ apiUrl }),
      setEnabled: (enabled) => set({ enabled }),
      setTrackingEnabled: (enabled) => set({ trackingEnabled: enabled }),
      setConversionPixel: (pixel) => set({ conversionPixel: pixel }),
      setConnected: (connected) => set({ isConnected: connected }),
      setLastSync: (date) => set({ lastSync: date }),

      disconnect: () => set({
        accessToken: '',
        publicKey: '',
        enabled: false,
        isConnected: false,
        lastSync: null,
      }),
    }),
    {
      name: 'appmax-storage',
    }
  )
);
