import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Address } from '../types';

interface AddressWithMeta extends Address {
  id: string;
  userId: string;
  label: string;
  isDefault: boolean;
}

interface AddressStore {
  addresses: AddressWithMeta[];
  addAddress: (userId: string, address: Omit<AddressWithMeta, 'id' | 'userId'>) => void;
  updateAddress: (id: string, address: Partial<AddressWithMeta>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (userId: string, id: string) => void;
  getAddressesByUserId: (userId: string) => AddressWithMeta[];
  getDefaultAddress: (userId: string) => AddressWithMeta | null;
}

// Mock addresses for demo
const mockAddresses: AddressWithMeta[] = [
  {
    id: '1',
    userId: '1',
    label: 'Casa',
    street: 'Rua das Flores',
    number: '123',
    complement: 'Apto 45',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    country: 'Brasil',
    isDefault: true,
  },
  {
    id: '2',
    userId: '1',
    label: 'Trabalho',
    street: 'Av. Paulista',
    number: '1000',
    complement: 'Sala 501',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-100',
    country: 'Brasil',
    isDefault: false,
  },
];

export const useAddressStore = create<AddressStore>()(
  persist(
    (set, get) => ({
      addresses: mockAddresses,

      addAddress: (userId, address) => {
        const newAddress: AddressWithMeta = {
          ...address,
          id: Date.now().toString(),
          userId,
        };
        set((state) => ({
          addresses: [...state.addresses, newAddress],
        }));
      },

      updateAddress: (id, address) => {
        set((state) => ({
          addresses: state.addresses.map((addr) =>
            addr.id === id ? { ...addr, ...address } : addr
          ),
        }));
      },

      deleteAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.filter((addr) => addr.id !== id),
        }));
      },

      setDefaultAddress: (userId, id) => {
        set((state) => ({
          addresses: state.addresses.map((addr) =>
            addr.userId === userId
              ? { ...addr, isDefault: addr.id === id }
              : addr
          ),
        }));
      },

      getAddressesByUserId: (userId) => {
        return get().addresses.filter((addr) => addr.userId === userId);
      },

      getDefaultAddress: (userId) => {
        return (
          get().addresses.find((addr) => addr.userId === userId && addr.isDefault) || null
        );
      },
    }),
    {
      name: 'address-storage',
    }
  )
);

export type { AddressWithMeta };
