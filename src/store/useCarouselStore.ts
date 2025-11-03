import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface CarouselImages {
  cha: string[];
  greenrush: string[];
  slimshot: string[];
  cinta: string[];
}

interface CarouselStore {
  images: CarouselImages;
  isLoading: boolean;
  loadImages: () => Promise<void>;
  setImages: (product: keyof CarouselImages, images: string[]) => void;
  addImage: (product: keyof CarouselImages, imageUrl: string) => Promise<void>;
  removeImage: (product: keyof CarouselImages, index: number) => Promise<void>;
  reorderImages: (product: keyof CarouselImages, startIndex: number, endIndex: number) => Promise<void>;
}

export const useCarouselStore = create<CarouselStore>()((set, get) => ({
  images: {
    cha: [],
    greenrush: [],
    slimshot: [],
    cinta: [],
  },
  isLoading: false,

  loadImages: async () => {
    try {
      set({ isLoading: true });
      const response = await fetch(`${API_URL}/carousel-images`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar imagens');
      }

      const data = await response.json();
      
      // Organizar imagens por produto
      const imagesByProduct: CarouselImages = {
        cha: [],
        greenrush: [],
        slimshot: [],
        cinta: [],
      };

      data.forEach((item: any) => {
        if (imagesByProduct[item.product as keyof CarouselImages]) {
          imagesByProduct[item.product as keyof CarouselImages].push(item.image_url);
        }
      });

      set({ images: imagesByProduct, isLoading: false });
    } catch (error) {
      console.error('Erro ao carregar imagens do carrossel:', error);
      set({ isLoading: false });
    }
  },

  setImages: (product, images) =>
    set((state) => ({
      images: {
        ...state.images,
        [product]: images,
      },
    })),

  addImage: async (product, imageUrl) => {
    try {
      const position = get().images[product].length;
      
      const response = await fetch(`${API_URL}/carousel-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product,
          imageUrl,
          position,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar imagem');
      }

      // Atualizar localmente
      set((state) => ({
        images: {
          ...state.images,
          [product]: [...state.images[product], imageUrl],
        },
      }));
    } catch (error) {
      console.error('Erro ao adicionar imagem:', error);
      throw error;
    }
  },

  removeImage: async (product, index) => {
    try {
      // Primeiro recarregar do banco para pegar o ID correto
      const response = await fetch(`${API_URL}/carousel-images/${product}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar imagens');
      }

      const data = await response.json();
      const imageToDelete = data[index];

      if (imageToDelete && imageToDelete.id) {
        const deleteResponse = await fetch(`${API_URL}/carousel-images/${imageToDelete.id}`, {
          method: 'DELETE',
        });

        if (!deleteResponse.ok) {
          throw new Error('Erro ao remover imagem');
        }
      }

      // Atualizar localmente
      set((state) => ({
        images: {
          ...state.images,
          [product]: state.images[product].filter((_, i) => i !== index),
        },
      }));
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      throw error;
    }
  },

  reorderImages: async (product, startIndex, endIndex) => {
    try {
      // Atualizar localmente primeiro
      const state = get();
      const result = Array.from(state.images[product]);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      set((prevState) => ({
        images: {
          ...prevState.images,
          [product]: result,
        },
      }));

      // Depois atualizar no backend (deletar tudo e recriar)
      // Buscar IDs atuais
      const response = await fetch(`${API_URL}/carousel-images/${product}`);
      if (response.ok) {
        const data = await response.json();
        
        // Deletar todas
        for (const item of data) {
          await fetch(`${API_URL}/carousel-images/${item.id}`, { method: 'DELETE' });
        }

        // Recriar na nova ordem
        for (let i = 0; i < result.length; i++) {
          await fetch(`${API_URL}/carousel-images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product,
              imageUrl: result[i],
              position: i,
            }),
          });
        }
      }
    } catch (error) {
      console.error('Erro ao reordenar imagens:', error);
      throw error;
    }
  },
}));
