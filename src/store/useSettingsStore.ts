import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  whatsappCommunityLink: string;
  whatsappCommunityImage: string;
}

interface SettingsStore {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: {
        whatsappCommunityLink: 'https://chat.whatsapp.com/sua-comunidade',
        whatsappCommunityImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=600&fit=crop',
      },

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        })),
    }),
    {
      name: 'app-settings-storage',
    }
  )
);
