import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BeforeAfter {
  id: string;
  title: string;
  beforeImage: string;
  afterImage: string;
  description?: string;
  active: boolean;
  order: number;
}

interface BeforeAfterStore {
  items: BeforeAfter[];
  setItems: (items: BeforeAfter[]) => void;
  addItem: (item: BeforeAfter) => void;
  updateItem: (id: string, item: Partial<BeforeAfter>) => void;
  deleteItem: (id: string) => void;
  getActiveItems: () => BeforeAfter[];
}

export const useBeforeAfterStore = create<BeforeAfterStore>()(
  persist(
    (set, get) => ({
      items: [],

      setItems: (items) => set({ items }),

      addItem: async (item) => {
        try {
          const API_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

          const response = await fetch(`${API_URL}/before-after`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: item.title,
              beforeImage: item.beforeImage,
              afterImage: item.afterImage,
              description: item.description || '',
              position: item.order
            })
          });

          if (!response.ok) throw new Error('Erro ao salvar antes/depois');

          const result = await response.json();
          console.log('✅ Antes/Depois salvo na API:', result);

          set((state) => ({
            items: [...(state.items || []), { ...item, id: result.id }],
          }));

          window.location.reload();
        } catch (error) {
          console.error('❌ Erro ao adicionar antes/depois:', error);
          alert('Erro ao salvar: ' + error);
        }
      },

      updateItem: async (id, itemData) => {
        try {
          const API_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

          const response = await fetch(`${API_URL}/before-after/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData)
          });

          if (!response.ok) throw new Error('Erro ao atualizar antes/depois');

          console.log('✅ Antes/Depois atualizado na API');

          set((state) => ({
            items: (state.items || []).map((item) =>
              item.id === id ? { ...item, ...itemData } : item
            ),
          }));

          window.location.reload();
        } catch (error) {
          console.error('❌ Erro ao atualizar antes/depois:', error);
          alert('Erro ao atualizar: ' + error);
        }
      },

      deleteItem: async (id) => {
        try {
          const API_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

          const response = await fetch(`${API_URL}/before-after/${id}`, {
            method: 'DELETE'
          });

          if (!response.ok) throw new Error('Erro ao deletar antes/depois');

          console.log('✅ Antes/Depois deletado da API');

          set((state) => ({
            items: (state.items || []).filter((item) => item.id !== id),
          }));

          window.location.reload();
        } catch (error) {
          console.error('❌ Erro ao deletar antes/depois:', error);
          alert('Erro ao deletar: ' + error);
        }
      },

      getActiveItems: () => {
        return (get().items || [])
          .filter((item) => item.active)
          .sort((a, b) => a.order - b.order);
      },
    }),
    {
      name: 'before-after-storage',
    }
  )
);
