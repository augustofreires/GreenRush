import { useEffect } from 'react';
import { useBeforeAfterStore } from '../store/useBeforeAfterStore';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const useLoadBeforeAfter = () => {
  const { setItems } = useBeforeAfterStore();

  useEffect(() => {
    const loadItems = async () => {
      try {
        console.log('🔄 Carregando antes/depois da API...');
        const response = await fetch(`${API_URL}/before-after`);
        const data = await response.json();

        // Converter formato do banco para o formato do store
        const items = data.map((item: any) => ({
          id: item.id,
          title: item.name,
          beforeImage: item.before_image,
          afterImage: item.after_image,
          description: item.description,
          weightLost: item.weight_lost,
          timePeriod: item.time_period,
          order: item.position,
          active: Boolean(item.is_active)
        }));

        console.log(`✅ ${items.length} antes/depois carregados do MySQL`);
        setItems(items);
      } catch (error) {
        console.error('❌ Erro ao carregar antes/depois:', error);
      }
    };

    loadItems();
  }, []);
};
