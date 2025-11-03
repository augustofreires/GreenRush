import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Settings {
  whatsappCommunityLink: string;
  whatsappCommunityImage: string;
}

interface SettingsStore {
  settings: Settings;
  loading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: {
        whatsappCommunityLink: "",
        whatsappCommunityImage: "",
      },
      loading: false,

      fetchSettings: async () => {
        set({ loading: true });
        try {
          const response = await fetch(`${API_URL}/settings/whatsapp_community`);
          
          if (response.ok) {
            const data = await response.json();
            // Se data for string JSON, fazer parse
            const parsed = typeof data === "string" ? JSON.parse(data) : data;
            
            set({
              settings: {
                whatsappCommunityLink: parsed.link || "",
                whatsappCommunityImage: parsed.image || "",
              },
            });
          } else {
            // Se não encontrar, usar valores padrão
            console.log("Configurações não encontradas, usando valores padrão");
          }
        } catch (error) {
          console.error("Erro ao buscar configurações:", error);
        } finally {
          set({ loading: false });
        }
      },

      updateSettings: async (newSettings) => {
        const currentSettings = get().settings;
        const updatedSettings = {
          ...currentSettings,
          ...newSettings,
        };

        // Atualizar estado local imediatamente
        set({ settings: updatedSettings });

        // Salvar no backend
        try {
          const response = await fetch(`${API_URL}/settings/whatsapp_community`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              value: {
                link: updatedSettings.whatsappCommunityLink,
                image: updatedSettings.whatsappCommunityImage,
              },
            }),
          });

          if (!response.ok) {
            throw new Error("Erro ao salvar configurações");
          }

          console.log("✅ Configurações salvas no backend");
        } catch (error) {
          console.error("Erro ao salvar configurações:", error);
          throw error;
        }
      },
    }),
    {
      name: "app-settings-storage",
      onRehydrateStorage: () => (state) => {
        // Automaticamente buscar configurações do backend após hidratar do localStorage
        if (state) {
          state.fetchSettings();
        }
      },
    }
  )
);