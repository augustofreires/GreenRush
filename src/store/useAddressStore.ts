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

export const useAddressStore = create<AddressStore>()(
  persist(
    (set, get) => ({
      addresses: [],

      addAddress: (userId, address) => {
        const userAddresses = get().addresses.filter(addr => addr.userId === userId);
        const isFirstAddress = userAddresses.length === 0;

        const newAddress: AddressWithMeta = {
          ...address,
          id: Date.now().toString(),
          userId,
          // Se for o primeiro endereço do usuário, marcar como padrão automaticamente
          isDefault: isFirstAddress ? true : address.isDefault,
        };

        set((state) => ({
          addresses: [
            // Se o novo endereço for padrão, desmarcar outros endereços do mesmo usuário
            ...state.addresses.map((addr) =>
              addr.userId === userId && newAddress.isDefault
                ? { ...addr, isDefault: false }
                : addr
            ),
            newAddress,
          ],
        }));
      },

      updateAddress: (id, address) => {
        const targetAddress = get().addresses.find(addr => addr.id === id);

        set((state) => ({
          addresses: state.addresses.map((addr) => {
            // Se está marcando este endereço como padrão, desmarcar outros do mesmo usuário
            if (addr.userId === targetAddress?.userId && address.isDefault && addr.id !== id) {
              return { ...addr, isDefault: false };
            }
            // Atualizar o endereço alvo
            if (addr.id === id) {
              return { ...addr, ...address };
            }
            return addr;
          }),
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
