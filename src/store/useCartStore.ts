import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Product } from '../types';

interface CartStore {
  items: CartItem[];
  version: number;
  isCartOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotal: () => number;
  getItemsCount: () => number;
}

// Custom storage with quota error handling
const customStorage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    return str ? JSON.parse(str) : null;
  },
  setItem: (name: string, value: any) => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('[CartStore] localStorage quota exceeded, cleaning up old data...');

        // Clean up old/unnecessary localStorage items
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key !== 'cart-storage') {
            keysToRemove.push(key);
          }
        }

        // Remove non-essential items
        keysToRemove.forEach(key => {
          console.warn(`[CartStore] Removing localStorage key: ${key}`);
          localStorage.removeItem(key);
        });

        // Try again
        try {
          localStorage.setItem(name, JSON.stringify(value));
          console.log('[CartStore] Successfully saved after cleanup');
        } catch (retryError) {
          console.error('[CartStore] Still failed after cleanup, cart will not persist:', retryError);
          // Cart will still work in memory, just won't persist
        }
      } else {
        console.error('[CartStore] Error saving to localStorage:', error);
      }
    }
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      version: 0,
      isCartOpen: false,

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
              version: state.version + 1,
              isCartOpen: true, // Open cart when adding item
            };
          }

          return {
            items: [...state.items, { ...product, quantity }],
            version: state.version + 1,
            isCartOpen: true, // Open cart when adding item
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
          version: state.version + 1,
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => {
          const newItems = state.items.map((item) =>
            item.id === productId ? { ...item, quantity: quantity } : { ...item }
          );
          console.log('[Store] Updating quantity:', productId, 'to', quantity, 'Version:', state.version + 1);
          return {
            items: newItems,
            version: state.version + 1
          };
        });
      },

      clearCart: () => {
        set((state) => ({
          items: [],
          version: state.version + 1
        }));
      },

      openCart: () => {
        set({ isCartOpen: true });
      },

      closeCart: () => {
        set({ isCartOpen: false });
      },

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getItemsCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({
        items: state.items,
        version: state.version,
        // Don't persist isCartOpen
      }),
    }
  )
);
