import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, ProductReview } from '../types';

interface ProductStore {
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductsByCustomLanding: (landingPage: string) => Product[];
  getProductsByCategory: (category: string) => Product[];
  getAvailableProducts: () => Product[];
  searchProducts: (query: string) => Product[];
  addReview: (productSlug: string, review: Omit<ProductReview, 'id' | 'date'>) => void;
  updateReviewStatus: (productId: string, reviewId: string, status: 'pending' | 'approved' | 'rejected') => void;
  deleteReview: (productId: string, reviewId: string) => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [
        {
          id: '1',
          slug: 'cinta-modeladora',
          name: 'Cinta Modeladora',
          description: 'Cinta modeladora de alta compressão para definição corporal instantânea. Proporciona conforto durante todo o dia e realça suas curvas naturais.',
          price: 297.00,
          image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&h=800&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop',
          ],
          category: 'Modeladores',
          stock: 45,
          badge: 'bestseller',
          rating: 4.9,
          reviews: 567,
          benefits: [
            'Modelagem corporal instantânea',
            'Reduz medidas imediatamente',
            'Melhora a postura',
            'Aumenta a autoestima',
            'Confortável para uso prolongado',
            'Tecido respirável e antialérgico',
          ],
          howToUse: [
            'Vista a cinta pela parte inferior do corpo',
            'Ajuste confortavelmente na região do abdômen',
            'Use diariamente por pelo menos 8 horas',
            'Pode ser usada por baixo das roupas',
          ],
          whyChoose: [
            'Resultados Imediatos',
            'Conforto Durante o Dia Todo',
            'Material Respirável',
            'Ajuda na Postura',
            'Discreta Sob Roupas',
          ],
          faqs: [
            { question: 'Quanto tempo devo usar por dia?', answer: 'Recomendamos usar por pelo menos 8 horas diárias para melhores resultados. Pode usar durante todo o dia nas suas atividades normais.' },
            { question: 'Posso usar durante exercícios?', answer: 'Sim! A cinta pode ser usada durante exercícios leves e moderados, ajudando a intensificar os resultados.' },
            { question: 'Como escolher o tamanho correto?', answer: 'Consulte nossa tabela de medidas. Em caso de dúvida entre dois tamanhos, escolha o maior para maior conforto.' },
            { question: 'Posso dormir com a cinta?', answer: 'Não recomendamos dormir com a cinta. Use durante o dia nas suas atividades normais.' },
          ],
          customerReviews: [
            { id: 'm1', author: 'Mariana Santos', rating: 5, date: '2024-09-22', comment: 'Produto excelente! Uso todos os dias e já vejo muita diferença na cintura. Super confortável!', verified: true },
            { id: 'm2', author: 'Luciana Ferreira', rating: 5, date: '2024-09-16', comment: 'Melhor cinta que já usei! Material de qualidade e realmente modela o corpo.', verified: true },
            { id: 'm3', author: 'Amanda Costa', rating: 4, date: '2024-09-11', comment: 'Muito boa! Ajudou muito na minha postura também. Recomendo!', verified: true },
          ],
          variants: [
            { id: '32168944', sku: '1761327673774-PP', name: 'PP', price: 297.00, stock: 10 },
            { id: '30702309', sku: '1761327673774', name: 'P', price: 297.00, stock: 12 },
            { id: '32168961', sku: '1761327673774-M', name: 'M', price: 297.00, stock: 15 },
            { id: '32168991', sku: '1761327673774-G', name: 'G', price: 297.00, stock: 8 },
            { id: '32169017', sku: '1761327673774-GG', name: 'GG', price: 297.00, stock: 5 },





          ],
        },
        {
          id: '2',
          slug: 'cha-natural',
          name: 'GreenRush Chá Natural',
          description: 'Chá natural termogênico desenvolvido com ingredientes selecionados para acelerar o metabolismo, reduzir a retenção de líquidos e controlar o apetite naturalmente.',
          price: 77.00,
          image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=800&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1597318236557-c7a598c44228?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&h=800&fit=crop',
          ],
          category: 'Emagrecimento',
          stock: 120,
          badge: 'sale',
          rating: 4.8,
          reviews: 423,
          benefits: [
            'Acelera o metabolismo naturalmente',
            'Reduz a retenção de líquidos',
            'Controla o apetite',
            'Melhora a digestão',
            '100% natural',
            'Sem efeitos colaterais',
          ],
          ingredients: [
            'Camomila',
            'Erva-cidreira',
            'Maracujá',
            'Jasmim',
            'Chá Verde',
            'Chá Preto',
            'Boldo',
            'Carqueja',
            'Hortelã',
            'Funcho',
          ],
          howToUse: [
            'Prepare uma xícara de chá utilizando água quente (não fervente)',
            'Deixe em infusão por 3 a 5 minutos',
            'Tome 2 a 3 xícaras por dia',
            'Recomenda-se tomar pela manhã e antes das principais refeições',
          ],
          whyChoose: [
            'Aprovado pela ANVISA',
            '100% Natural e Seguro',
            'Sem Cafeína, Sem Agitação',
            'Resultados em poucas semanas',
            'Livre de Efeitos Colaterais',
          ],
          faqs: [
            { question: 'O chá tem cafeína?', answer: 'Não! Nossa fórmula é livre de cafeína, você pode tomar sem preocupação com agitação ou insônia.' },
            { question: 'Quantas xícaras posso tomar por dia?', answer: 'Recomendamos de 2 a 3 xícaras por dia, preferencialmente pela manhã e antes das refeições principais.' },
            { question: 'Em quanto tempo vejo resultados?', answer: 'Os primeiros resultados começam a aparecer nas primeiras semanas de uso contínuo.' },
            { question: 'Gestantes podem tomar?', answer: 'Recomendamos consultar seu médico antes de iniciar qualquer suplementação durante a gestação.' },
          ],
          customerReviews: [
            { id: 'r1', author: 'Maria Silva', rating: 5, date: '2024-09-15', comment: 'Perdi 8kg em 2 meses tomando o chá regularmente. Produto excelente!', verified: true },
            { id: 'r2', author: 'Ana Santos', rating: 5, date: '2024-09-10', comment: 'Ajudou muito a reduzir o inchaço. Recomendo!', verified: true },
            { id: 'r3', author: 'Juliana Costa', rating: 4, date: '2024-09-05', comment: 'Gostei bastante, o sabor é agradável e me ajudou a controlar a ansiedade por doces.', verified: true },
          ],
          variants: [
            { id: '1pack', name: '1 Pacote (30 dias)', price: 77.00, originalPrice: 97.00, stock: 50 },
            { id: '3pack', name: '3 Pacotes (90 dias)', price: 197.00, originalPrice: 291.00, stock: 40 },
            { id: '5pack', name: '5 Pacotes (150 dias)', price: 297.00, originalPrice: 485.00, stock: 30 },
          ],
        },
        {
          id: '3',
          slug: 'capsulas',
          name: 'GreenRush Cápsulas',
          description: 'Suplemento 100% natural em cápsulas para emagrecimento saudável. Acelera o metabolismo, sem efeitos colaterais. Resultados visíveis em poucas semanas.',
          price: 149.90,
          originalPrice: 179.90,
          image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&h=800&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1550572017-4cd4bc2d5ccf?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=800&h=800&fit=crop',
          ],
          category: 'Emagrecimento',
          stock: 95,
          badge: 'bestseller',
          rating: 4.9,
          reviews: 812,
          benefits: [
            'Acelera o metabolismo',
            'Queima de gordura localizada',
            'Controla o apetite',
            'Aumenta a energia e disposição',
            '100% natural',
            'Sem efeitos colaterais',
            'Resultados visíveis em semanas',
          ],
          ingredients: [
            'Extrato de Laranja Moro',
            'Guaraná em Pó',
            'Cafeína Anidra',
            'Ácido Ascórbico (Vitamina C)',
            'Acetato de DL-alfa-tocoferol (Vitamina E)',
            'Acetato de Retinol (Vitamina A)',
            'Picolinato de Cromo',
            'Carbonato de Cálcio',
            'Estearato de Magnésio',
            'Dióxido de Silício',
          ],
          howToUse: [
            'Tome 1 cápsula pela manhã após o café da manhã',
            'Tome 1 cápsula no final da tarde antes do jantar',
            'Beba bastante água ao longo do dia',
            'Use continuamente por pelo menos 90 dias para melhores resultados',
          ],
          whyChoose: [
            'Aprovado pela ANVISA',
            '100% Natural',
            'Sem Efeitos Colaterais',
            'Resultados nas Primeiras Semanas',
            'Acelera Metabolismo Naturalmente',
          ],
          faqs: [
            { question: 'As cápsulas são naturais?', answer: 'Sim! 100% natural e aprovado pela ANVISA, sem efeitos colaterais.' },
            { question: 'Quantas cápsulas devo tomar por dia?', answer: 'Recomendamos 2 cápsulas ao dia: uma pela manhã após o café e outra no final da tarde antes do jantar.' },
            { question: 'Em quanto tempo vejo resultados?', answer: 'Resultados perceptíveis nas primeiras semanas de uso contínuo.' },
            { question: 'Posso tomar durante a gravidez?', answer: 'Recomendamos consultar seu médico antes de iniciar qualquer suplementação durante a gestação ou lactação.' },
          ],
          customerReviews: [
            { id: 'c1', author: 'Fernanda Lima', rating: 5, date: '2024-09-20', comment: 'Produto maravilhoso! Já eliminei 12kg e me sinto muito mais disposta.', verified: true },
            { id: 'c2', author: 'Carla Mendes', rating: 5, date: '2024-09-12', comment: 'Melhor suplemento que já usei. Sem efeitos colaterais e resultados rápidos!', verified: true },
            { id: 'c3', author: 'Patrícia Oliveira', rating: 5, date: '2024-09-08', comment: 'Estou no segundo mês e já perdi 9kg. Super recomendo!', verified: true },
          ],
          variants: [
            { id: '60caps', name: '60 Cápsulas (1 mês)', price: 149.90, originalPrice: 179.90, stock: 40 },
            { id: '180caps', name: '180 Cápsulas (3 meses)', price: 347.00, originalPrice: 539.70, stock: 30 },
            { id: '300caps', name: '300 Cápsulas (5 meses)', price: 547.00, originalPrice: 899.50, stock: 25 },
          ],
        },
        {
          id: '4',
          slug: 'slimshot',
          name: 'SlimShot - Vinagre de Maçã',
          description: 'Shot termogênico de vinagre de maçã concentrado para potencializar seus resultados no emagrecimento. Acelera o metabolismo e auxilia na queima de gordura.',
          price: 89.90,
          originalPrice: 119.90,
          image: 'https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=800&h=800&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800&h=800&fit=crop',
          ],
          category: 'Emagrecimento',
          stock: 80,
          badge: 'new',
          rating: 4.7,
          reviews: 245,
          benefits: [
            'Acelera o metabolismo',
            'Auxilia na digestão',
            'Reduz o inchaço',
            'Controla a glicemia',
            'Detox natural',
            'Formato prático e rápido',
          ],
          ingredients: [
            'Vinagre de Maçã Orgânico',
            'Extrato de Gengibre',
            'Limão',
            'Pimenta Caiena',
            'Mel Orgânico',
          ],
          howToUse: [
            'Tome 1 shot pela manhã em jejum',
            'Pode diluir em água se preferir',
            'Recomenda-se uso diário',
            'Aguarde 15-20 minutos antes do café da manhã',
          ],
          whyChoose: [
            '100% Natural e Orgânico',
            'Formato Prático e Rápido',
            'Potencializa Resultados',
            'Detox Natural',
            'Sabor Agradável',
          ],
          faqs: [
            { question: 'Como devo tomar o SlimShot?', answer: 'Tome 1 shot pela manhã em jejum. Pode diluir em água se preferir. Aguarde 15-20 minutos antes do café da manhã.' },
            { question: 'Posso tomar todos os dias?', answer: 'Sim! O uso diário é recomendado para melhores resultados.' },
            { question: 'Tem gosto ruim?', answer: 'O sabor é naturalmente cítrico e agradável. A combinação de limão e mel torna o shot saboroso.' },
            { question: 'Posso tomar com outros produtos GreenRush?', answer: 'Sim! O SlimShot pode ser combinado com nossas cápsulas e chá para potencializar os resultados.' },
          ],
          customerReviews: [
            { id: 's1', author: 'Renata Oliveira', rating: 5, date: '2024-09-18', comment: 'Adoro! Super prático e me ajudou muito a desinchar. Tomo todos os dias antes do café.', verified: true },
            { id: 's2', author: 'Beatriz Rocha', rating: 4, date: '2024-09-14', comment: 'O sabor é bom e realmente funciona. Senti diferença na digestão.', verified: true },
            { id: 's3', author: 'Camila Souza', rating: 5, date: '2024-09-09', comment: 'Combinei com as cápsulas e os resultados foram incríveis! Já eliminei 6kg.', verified: true },
          ],
          variants: [
            { id: '15shots', name: '15 Shots (15 dias)', price: 89.90, originalPrice: 119.90, stock: 30 },
            { id: '30shots', name: '30 Shots (30 dias)', price: 159.90, originalPrice: 239.80, stock: 25 },
            { id: '60shots', name: '60 Shots (60 dias)', price: 279.90, originalPrice: 479.60, stock: 25 },
          ],
        },
      ],

      setProducts: (products) => set({ products }),

      addProduct: async (product) => {
        try {
          const API_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

          // Preparar dados para API
          const apiData = {
            name: product.name,
            description: product.description,
            shortDescription: product.shortDescription || product.description?.substring(0, 100) || '',
            price: product.price,
            originalPrice: product.originalPrice,
            category: product.category,
            stock: product.stock || 0,
            images: product.images || (product.image ? [product.image] : []),
            tags: product.tags || [],
            isFeatured: product.isFeatured || false,
            customLandingPage: product.customLandingPage || null,
          };

          console.log('📤 Enviando produto para API:', apiData);
          console.log('📷 Imagens que serão salvas:', apiData.images);

          const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Erro da API:', errorData);
            throw new Error(errorData.error?.message || 'Erro ao salvar produto');
          }

          const result = await response.json();
          console.log('✅ Produto salvo na API:', result);

          // Atualizar localStorage com o produto retornado da API
          set((state) => ({
            products: [...state.products, { ...product, id: result.id, slug: result.slug }],
          }));

          // Recarregar para sincronizar com MySQL
          window.location.reload();
        } catch (error) {
          console.error('❌ Erro ao adicionar produto:', error);
          alert('Erro ao salvar produto: ' + error);
        }
      },

      updateProduct: async (id, productData) => {
        try {
          const API_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

          // Preparar dados - converter image para images array
          const apiData: any = { ...productData };
          if (productData.image && !productData.images) {
            apiData.images = [productData.image];
            delete apiData.image;
          }

          console.log('📤 Atualizando produto na API:', apiData);
          console.log('📷 Imagens que serão salvas:', apiData.images);

          const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiData)
          });

          if (!response.ok) throw new Error('Erro ao atualizar produto');

          console.log('✅ Produto atualizado na API');

          // Atualizar localStorage
          set((state) => ({
            products: state.products.map((p) =>
              p.id === id ? { ...p, ...apiData } : p
            ),
          }));

          // Recarregar para sincronizar
          window.location.reload();
        } catch (error) {
          console.error('❌ Erro ao atualizar produto:', error);
          alert('Erro ao atualizar produto: ' + error);
        }
      },

      deleteProduct: async (id) => {
        try {
          const API_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

          const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE'
          });

          if (!response.ok) throw new Error('Erro ao deletar produto');

          console.log('✅ Produto deletado da API');

          // Atualizar localStorage
          set((state) => ({
            products: state.products.filter((p) => p.id !== id),
          }));

          // Recarregar para sincronizar
          window.location.reload();
        } catch (error) {
          console.error('❌ Erro ao deletar produto:', error);
          alert('Erro ao deletar produto: ' + error);
        }
      },

      getProductById: (id) => {
        const products = get().products;
        return Array.isArray(products) ? products.find((p) => p.id === id) : undefined;
      },

      getProductBySlug: (slug) => {
        const products = get().products;
        return Array.isArray(products) ? products.find((p) => p.slug === slug) : undefined;
      },

      getProductsByCustomLanding: (landingPage) => {
        const products = get().products;
        return Array.isArray(products) ? products.filter((p) => p.customLandingPage === landingPage) : [];
      },

      getProductsByCategory: (category) => {
        const products = get().products;
        return Array.isArray(products) ? products.filter((p) =>
          p.category.toLowerCase() === category.toLowerCase()
        ) : [];
      },

      getAvailableProducts: () => {
        const products = get().products;
        return Array.isArray(products) ? products.filter((p) => !p.hidden) : [];
      },

      searchProducts: (query) => {
        const lowerQuery = query.toLowerCase();
        const products = get().products;
        return Array.isArray(products) ? products.filter((p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.description.toLowerCase().includes(lowerQuery) ||
          p.category.toLowerCase().includes(lowerQuery)
        ) : [];
      },

      addReview: (productSlug, review) => {
        set((state) => {
          const products = Array.isArray(state.products) ? state.products.map((p) => {
            if (p.slug === productSlug) {
              const newReview: ProductReview = {
                id: `r${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                verified: false,
                ...review,
              };

              const updatedReviews = [...(p.customerReviews || []), newReview];
              const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
              const avgRating = totalRating / updatedReviews.length;

              return {
                ...p,
                customerReviews: updatedReviews,
                rating: Number(avgRating.toFixed(1)),
                reviews: updatedReviews.length,
              };
            }
            return p;
          }) : [];

          return { products };
        });
      },

      updateReviewStatus: (productId, reviewId, status) => {
        set((state) => {
          const products = Array.isArray(state.products) ? state.products.map((p) => {
            if (p.id === productId) {
              return {
                ...p,
                customerReviews: (p.customerReviews || []).map((r) =>
                  r.id === reviewId ? { ...r, status } : r
                ),
              };
            }
            return p;
          }) : [];

          return { products };
        });
      },

      deleteReview: (productId, reviewId) => {
        set((state) => {
          const products = Array.isArray(state.products) ? state.products.map((p) => {
            if (p.id === productId) {
              const updatedReviews = (p.customerReviews || []).filter((r) => r.id !== reviewId);
              const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
              const avgRating = updatedReviews.length > 0 ? totalRating / updatedReviews.length : 0;

              return {
                ...p,
                customerReviews: updatedReviews,
                rating: Number(avgRating.toFixed(1)),
                reviews: updatedReviews.length,
              };
            }
            return p;
          }) : [];

          return { products };
        });
      },
    }),
    {
      name: 'product-storage',
      version: 6, // Reset com produtos mockados
    }
  )
);
