import { useEffect } from 'react';
import { useTestimonialsVideoStore } from '../store/useTestimonialsVideoStore';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const useLoadVideoTestimonials = () => {
  const { setVideos } = useTestimonialsVideoStore();

  useEffect(() => {
    const loadVideos = async () => {
      try {
        console.log('🔄 Carregando vídeos de depoimentos da API...');
        const response = await fetch(`${API_URL}/video-testimonials`);
        const data = await response.json();

        // Agrupar vídeos por produto
        const videosByProduct: any = {
          cha: [],
          greenrush: [],
          slimshot: [],
          cinta: []
        };

        data.forEach((video: any) => {
          const productKey = video.product.toLowerCase();
          if (videosByProduct[productKey]) {
            videosByProduct[productKey].push({
              id: video.id,
              videoUrl: video.video_url,
              thumbnailUrl: video.thumbnail,
              customerName: video.customer_name || 'Cliente',
              customerLocation: '',
              title: ''
            });
          }
        });

        console.log(`✅ Vídeos carregados do MySQL`);
        setVideos(videosByProduct);
      } catch (error) {
        console.error('❌ Erro ao carregar vídeos:', error);
      }
    };

    loadVideos();
  }, []);
};
