import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  image: string;
  showOverlay?: boolean;
  isActive: boolean;
  order: number;
}

interface CategoryStore {
  categories: Category[];
  loading: boolean;
  fetchCategories: () => Promise<void>;
  fetchAllCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, "id">) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getActiveCategories: () => Category[];
  reorderCategories: (categories: Category[]) => void;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      categories: [],
      loading: false,

      fetchCategories: async () => {
        set({ loading: true });
        try {
          const response = await fetch(`${API_URL}/categories`);
          
          if (response.ok) {
            const data = await response.json();
            const mappedCategories: Category[] = data.map((cat: any) => ({
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              description: cat.description || "",
              color: cat.color || "from-green-500 to-green-600",
              image: cat.image || "",
              showOverlay: cat.show_overlay !== 0,
              isActive: cat.is_active !== 0,
              order: cat.display_order || 0,
            }));
            
            set({ categories: mappedCategories });
          }
        } catch (error) {
          console.error("Erro ao buscar categorias:", error);
        } finally {
          set({ loading: false });
        }
      },

      fetchAllCategories: async () => {
        set({ loading: true });
        try {
          const response = await fetch(`${API_URL}/admin/categories`);
          
          if (response.ok) {
            const data = await response.json();
            const mappedCategories: Category[] = data.map((cat: any) => ({
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              description: cat.description || "",
              color: cat.color || "from-green-500 to-green-600",
              image: cat.image || "",
              showOverlay: cat.show_overlay !== 0,
              isActive: cat.is_active !== 0,
              order: cat.display_order || 0,
            }));
            
            set({ categories: mappedCategories });
          }
        } catch (error) {
          console.error("Erro ao buscar todas as categorias:", error);
        } finally {
          set({ loading: false });
        }
      },

      addCategory: async (category) => {
        try {
          const response = await fetch(`${API_URL}/categories`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: category.name,
              slug: category.slug,
              description: category.description,
              color: category.color,
              image: category.image,
              showOverlay: category.showOverlay,
              isActive: category.isActive,
              order: category.order,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const newCategory: Category = {
              ...category,
              id: data.id,
            };
            set((state) => ({
              categories: [...state.categories, newCategory].sort((a, b) => a.order - b.order),
            }));
          } else {
            throw new Error("Erro ao criar categoria");
          }
        } catch (error) {
          console.error("Erro ao criar categoria:", error);
          throw error;
        }
      },

      updateCategory: async (id, categoryUpdate) => {
        const currentCategory = get().categories.find(cat => cat.id === id);
        if (!currentCategory) return;

        const updatedCategory = { ...currentCategory, ...categoryUpdate };

        try {
          const response = await fetch(`${API_URL}/categories/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: updatedCategory.name,
              slug: updatedCategory.slug,
              description: updatedCategory.description,
              color: updatedCategory.color,
              image: updatedCategory.image,
              showOverlay: updatedCategory.showOverlay,
              isActive: updatedCategory.isActive,
              order: updatedCategory.order,
            }),
          });

          if (response.ok) {
            set((state) => ({
              categories: state.categories
                .map((cat) => (cat.id === id ? updatedCategory : cat))
                .sort((a, b) => a.order - b.order),
            }));
          } else {
            throw new Error("Erro ao atualizar categoria");
          }
        } catch (error) {
          console.error("Erro ao atualizar categoria:", error);
          throw error;
        }
      },

      deleteCategory: async (id) => {
        try {
          const response = await fetch(`${API_URL}/categories/${id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            set((state) => ({
              categories: state.categories.filter((cat) => cat.id !== id),
            }));
          } else {
            throw new Error("Erro ao deletar categoria");
          }
        } catch (error) {
          console.error("Erro ao deletar categoria:", error);
          throw error;
        }
      },

      getActiveCategories: () => {
        return get()
          .categories.filter((cat) => cat.isActive)
          .sort((a, b) => a.order - b.order);
      },

      reorderCategories: (categories) => {
        set({ categories });
      },
    }),
    {
      name: "category-storage",
      version: 4, // Atualizado para integração com backend
    }
  )
);
