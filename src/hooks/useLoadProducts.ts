import { useEffect } from 'react';
import { useProductStore } from '../store/useProductStore';
import { productService } from '../services/productService';

export const useLoadProducts = () => {
  const { setProducts } = useProductStore();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('🔄 Carregando produtos da API...');
        const products = await productService.getAll();
        console.log(`✅ ${products.length} produtos carregados do MySQL`);
        setProducts(products);
      } catch (error) {
        console.error('❌ Erro ao carregar produtos:', error);
      }
    };

    loadProducts();
  }, []);
};
