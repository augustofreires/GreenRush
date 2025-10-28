import { create } from 'zustand';

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link?: string;
  buttonText?: string;
  active: boolean;
  order: number;
}

interface BannerStore {
  banners: Banner[];
  setBanners: (banners: Banner[]) => void;
  addBanner: (banner: Banner) => void;
  updateBanner: (id: string, banner: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;
  getActiveBanners: () => Banner[];
}

export const useBannerStore = create<BannerStore>()((set, get) => ({
  banners: [],

  setBanners: (banners) => {
    set({ banners });
  },

  addBanner: (banner) => {
    set((state) => ({
      banners: [...state.banners, banner]
    }));
  },

  updateBanner: (id, bannerData) => {
    set((state) => ({
      banners: state.banners.map((b) =>
        b.id === id ? { ...b, ...bannerData } : b
      ),
    }));
  },

  deleteBanner: (id) => {
    set((state) => ({
      banners: state.banners.filter((b) => b.id !== id),
    }));
  },

  getActiveBanners: () => {
    return get().banners
      .filter((b) => b.active)
      .sort((a, b) => a.order - b.order);
  },
}));
