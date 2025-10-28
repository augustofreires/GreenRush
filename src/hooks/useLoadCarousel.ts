import { useEffect } from 'react';
import { useCarouselStore } from '../store/useCarouselStore';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const useLoadCarousel = () => {
  const { setImages } = useCarouselStore();

  useEffect(() => {
    const loadImages = async () => {
      try {
        console.log('🔄 Carregando imagens do carrossel da API...');
        const response = await fetch(`${API_URL}/carousel-images`);
        const data = await response.json();

        // Agrupar imagens por produto
        const imagesByProduct: any = {
          cha: [],
          greenrush: [],
          slimshot: [],
          cinta: []
        };

        data.forEach((img: any) => {
          const productKey = img.product.toLowerCase();
          if (imagesByProduct[productKey]) {
            imagesByProduct[productKey].push(img.image_url);
          }
        });

        // Setar imagens para cada produto
        Object.keys(imagesByProduct).forEach((product) => {
          if (imagesByProduct[product].length > 0) {
            setImages(product as any, imagesByProduct[product]);
          }
        });

        console.log(`✅ Imagens do carrossel carregadas do MySQL`);
      } catch (error) {
        console.error('❌ Erro ao carregar carrossel:', error);
      }
    };

    loadImages();
  }, [setImages]);
};
