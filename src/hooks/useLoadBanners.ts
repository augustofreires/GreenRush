import { useEffect } from 'react';
import { useBannerStore } from '../store/useBannerStore';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const useLoadBanners = () => {
  const { setBanners } = useBannerStore();

  useEffect(() => {
    const loadBanners = async () => {
      try {
        console.log('🔄 Carregando banners da API...');
        const response = await fetch(`${API_URL}/banners`);
        const data = await response.json();

        // Converter formato do banco para o formato do store
        const banners = data.map((b: any) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle,
          image: b.image,
          mobileImage: b.mobile_image,
          link: b.link,
          buttonText: b.button_text,
          order: b.position,
          active: Boolean(b.is_active)
        }));

        console.log(`✅ ${banners.length} banners carregados do MySQL`);
        setBanners(banners);
      } catch (error) {
        console.error('❌ Erro ao carregar banners:', error);
      }
    };

    loadBanners();
  }, []);
};
