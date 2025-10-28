import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getActiveCategories: () => Category[];
  reorderCategories: (categories: Category[]) => void;
}

const defaultCategories: Category[] = [
  {
    id: '1',
    name: 'Emagrecimento',
    slug: 'emagrecimento',
    description: 'Produtos naturais para perda de peso saudável',
    color: 'from-green-500 to-green-600',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop',
    isActive: true,
    order: 1,
  },
  {
    id: '2',
    name: 'Cintas Modeladoras',
    slug: 'cintas-modeladoras',
    description: 'Cintas modeladoras para definição e contorno corporal',
    color: 'from-pink-500 to-pink-600',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
    isActive: true,
    order: 2,
  },
  {
    id: '3',
    name: 'Chás Detox',
    slug: 'chas-detox',
    description: 'Chás naturais para desintoxicação e emagrecimento',
    color: 'from-green-400 to-green-500',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=400&fit=crop',
    isActive: true,
    order: 3,
  },
  {
    id: '4',
    name: 'Suplementos',
    slug: 'suplementos',
    description: 'Suplementos naturais para auxiliar no emagrecimento',
    color: 'from-purple-500 to-purple-600',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&h=400&fit=crop',
    isActive: true,
    order: 4,
  },
];

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      categories: defaultCategories,

      addCategory: (category) => {
        const newCategory: Category = {
          ...category,
          id: Date.now().toString(),
        };
        set((state) => ({
          categories: [...state.categories, newCategory].sort((a, b) => a.order - b.order),
        }));
      },

      updateCategory: (id, categoryUpdate) => {
        set((state) => ({
          categories: state.categories
            .map((cat) => (cat.id === id ? { ...cat, ...categoryUpdate } : cat))
            .sort((a, b) => a.order - b.order),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
        }));
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
      name: 'category-storage',
      version: 3, // Atualizado para novas categorias de emagrecimento
    }
  )
);
