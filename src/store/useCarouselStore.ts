import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CarouselImages {
  cha: string[];
  greenrush: string[];
  slimshot: string[];
  cinta: string[];
}

interface CarouselStore {
  images: CarouselImages;
  setImages: (product: keyof CarouselImages, images: string[]) => void;
  addImage: (product: keyof CarouselImages, imageUrl: string) => void;
  removeImage: (product: keyof CarouselImages, index: number) => void;
  reorderImages: (product: keyof CarouselImages, startIndex: number, endIndex: number) => void;
}

export const useCarouselStore = create<CarouselStore>()(
  persist(
    (set) => ({
      images: {
        cha: [
          'https://via.placeholder.com/600x600?text=Chá+1',
          'https://via.placeholder.com/600x600?text=Chá+2',
          'https://via.placeholder.com/600x600?text=Chá+3',
        ],
        greenrush: [
          'https://via.placeholder.com/600x600?text=Greenrush+1',
          'https://via.placeholder.com/600x600?text=Greenrush+2',
          'https://via.placeholder.com/600x600?text=Greenrush+3',
        ],
        slimshot: [
          'https://via.placeholder.com/600x600?text=Slimshot+1',
          'https://via.placeholder.com/600x600?text=Slimshot+2',
          'https://via.placeholder.com/600x600?text=Slimshot+3',
        ],
        cinta: [
          'https://via.placeholder.com/600x600?text=Cinta+1',
          'https://via.placeholder.com/600x600?text=Cinta+2',
          'https://via.placeholder.com/600x600?text=Cinta+3',
        ],
      },

      setImages: (product, images) =>
        set((state) => ({
          images: {
            ...state.images,
            [product]: images,
          },
        })),

      addImage: (product, imageUrl) =>
        set((state) => ({
          images: {
            ...state.images,
            [product]: [...state.images[product], imageUrl],
          },
        })),

      removeImage: (product, index) =>
        set((state) => ({
          images: {
            ...state.images,
            [product]: state.images[product].filter((_, i) => i !== index),
          },
        })),

      reorderImages: (product, startIndex, endIndex) =>
        set((state) => {
          const result = Array.from(state.images[product]);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);

          return {
            images: {
              ...state.images,
              [product]: result,
            },
          };
        }),
    }),
    {
      name: 'carousel-storage',
    }
  )
);
