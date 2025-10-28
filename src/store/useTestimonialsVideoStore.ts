import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VideoTestimonial {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  customerName: string;
  customerLocation: string;
  title: string;
}

interface TestimonialsVideoState {
  cha: VideoTestimonial[];
  greenrush: VideoTestimonial[];
  slimshot: VideoTestimonial[];
  cinta: VideoTestimonial[];
}

type ProductKey = 'cha' | 'greenrush' | 'slimshot' | 'cinta';

interface TestimonialsVideoStore {
  videos: TestimonialsVideoState;
  setVideos: (videos: TestimonialsVideoState) => void;
  addVideo: (product: ProductKey, video: VideoTestimonial) => void;
  removeVideo: (product: ProductKey, videoId: string) => void;
  updateVideo: (product: ProductKey, videoId: string, updatedVideo: Partial<VideoTestimonial>) => void;
  reorderVideos: (product: ProductKey, startIndex: number, endIndex: number) => void;
  getActiveVideos: () => VideoTestimonial[];
}

export const useTestimonialsVideoStore = create<TestimonialsVideoStore>()(
  persist(
    (set) => ({
      videos: {
        cha: [],
        greenrush: [],
        slimshot: [],
        cinta: [],
      },

      setVideos: (videos) => set({ videos }),

      addVideo: async (product, video) => {
        try {
          const API_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

          const response = await fetch(`${API_URL}/video-testimonials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product: product,
              videoUrl: video.videoUrl,
              thumbnail: video.thumbnailUrl || '',
              customerName: video.customerName || 'Cliente'
            })
          });

          if (!response.ok) throw new Error('Erro ao salvar vídeo');

          const result = await response.json();
          console.log('✅ Vídeo salvo na API:', result);

          set((state) => ({
            videos: {
              ...state.videos,
              [product]: [...(state.videos[product] || []), { ...video, id: result.id }],
            },
          }));

          window.location.reload();
        } catch (error) {
          console.error('❌ Erro ao adicionar vídeo:', error);
          alert('Erro ao salvar vídeo: ' + error);
        }
      },

      removeVideo: async (product, videoId) => {
        try {
          const API_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

          const response = await fetch(`${API_URL}/video-testimonials/${videoId}`, {
            method: 'DELETE'
          });

          if (!response.ok) throw new Error('Erro ao deletar vídeo');

          console.log('✅ Vídeo deletado da API');

          set((state) => ({
            videos: {
              ...state.videos,
              [product]: (state.videos[product] || []).filter((v) => v.id !== videoId),
            },
          }));

          window.location.reload();
        } catch (error) {
          console.error('❌ Erro ao deletar vídeo:', error);
          alert('Erro ao deletar vídeo: ' + error);
        }
      },

      updateVideo: (product, videoId, updatedVideo) =>
        set((state) => ({
          videos: {
            ...state.videos,
            [product]: (state.videos[product] || []).map((v) =>
              v.id === videoId ? { ...v, ...updatedVideo } : v
            ),
          },
        })),

      reorderVideos: (product, startIndex, endIndex) =>
        set((state) => {
          const result = Array.from(state.videos[product] || []);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);

          return {
            videos: {
              ...state.videos,
              [product]: result,
            },
          };
        }),

      getActiveVideos: () => {
        const state = useTestimonialsVideoStore.getState();
        // Retorna todos os vídeos de todos os produtos combinados com verificação de segurança
        return [
          ...(state.videos?.cha || []),
          ...(state.videos?.greenrush || []),
          ...(state.videos?.slimshot || []),
          ...(state.videos?.cinta || []),
        ];
      },
    }),
    {
      name: 'testimonials-video-storage',
    }
  )
);
