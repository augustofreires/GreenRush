import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  category: string;
  published: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface BlogStore {
  posts: BlogPost[];
  setPosts: (posts: BlogPost[]) => void;
  addPost: (post: BlogPost) => void;
  updatePost: (id: string, post: Partial<BlogPost>) => void;
  deletePost: (id: string) => void;
  getPostById: (id: string) => BlogPost | undefined;
  getPostBySlug: (slug: string) => BlogPost | undefined;
  getPublishedPosts: () => BlogPost[];
  getPostsByCategory: (category: string) => BlogPost[];
}

export const useBlogStore = create<BlogStore>()(
  persist(
    (set, get) => ({
      posts: [
        {
          id: '1',
          title: 'Como ter cabelos mais fortes e saudáveis',
          slug: 'como-ter-cabelos-mais-fortes-e-saudaveis',
          excerpt: 'Descubra os segredos para ter cabelos incríveis com dicas práticas e produtos certos...',
          content: `# Como ter cabelos mais fortes e saudáveis

Ter cabelos fortes e saudáveis é o sonho de muitas pessoas. Neste artigo, vamos compartilhar dicas essenciais e práticas comprovadas para transformar seus cabelos.

## 1. Alimentação balanceada

A saúde dos cabelos começa de dentro para fora. Alimentos ricos em:
- **Proteínas**: fundamentais para a estrutura capilar
- **Vitaminas do complexo B**: promovem crescimento
- **Ômega 3**: fortalece e dá brilho
- **Ferro e zinco**: previnem queda

## 2. Hidratação adequada

Beba pelo menos 2 litros de água por dia. A hidratação mantém os fios nutridos e evita ressecamento.

## 3. Produtos de qualidade

Use shampoos e condicionadores adequados ao seu tipo de cabelo. Invista em tratamentos específicos como:
- Máscaras nutritivas semanais
- Ampolas de tratamento
- Óleos capilares

## 4. Evite o calor excessivo

Secadores e chapinhas em alta temperatura danificam a fibra capilar. Use sempre protetor térmico e prefira temperaturas mais baixas.

## 5. Corte regular

Apare as pontas a cada 2-3 meses para remover pontas duplas e manter os fios saudáveis.

## Conclusão

Com esses cuidados simples e consistentes, você verá uma transformação incrível nos seus cabelos!`,
          image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=500&fit=crop',
          author: 'BigHair Team',
          category: 'Cabelos',
          published: true,
          publishedAt: '2025-01-05T10:00:00Z',
          createdAt: '2025-01-05T10:00:00Z',
          updatedAt: '2025-01-05T10:00:00Z',
        },
        {
          id: '2',
          title: 'Guia completo de suplementação',
          slug: 'guia-completo-de-suplementacao',
          excerpt: 'Saiba quais vitaminas e minerais são essenciais para sua saúde e bem-estar...',
          content: `# Guia completo de suplementação

A suplementação adequada pode fazer toda a diferença na sua saúde. Conheça os principais suplementos e seus benefícios.

## Vitaminas essenciais

### Vitamina D
Fundamental para imunidade e saúde óssea. Grande parte da população tem deficiência.

### Complexo B
Essencial para energia, metabolismo e sistema nervoso.

### Vitamina C
Poderoso antioxidante, fortalece a imunidade.

## Minerais importantes

### Magnésio
Relaxamento muscular, qualidade do sono e mais de 300 funções no corpo.

### Zinco
Imunidade, cicatrização e saúde da pele.

### Ferro
Previne anemia e fadiga.

## Como suplementar corretamente

1. Faça exames para identificar deficiências
2. Consulte um profissional de saúde
3. Escolha produtos de qualidade
4. Mantenha consistência
5. Acompanhe os resultados

## Conclusão

A suplementação deve complementar uma alimentação saudável, nunca substituí-la!`,
          image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=500&fit=crop',
          author: 'BigHair Team',
          category: 'Saúde',
          published: true,
          publishedAt: '2025-01-04T10:00:00Z',
          createdAt: '2025-01-04T10:00:00Z',
          updatedAt: '2025-01-04T10:00:00Z',
        },
        {
          id: '3',
          title: 'Rotina de cuidados para uma pele perfeita',
          slug: 'rotina-de-cuidados-para-uma-pele-perfeita',
          excerpt: 'Aprenda a cuidar da sua pele com produtos naturais e eficazes...',
          content: `# Rotina de cuidados para uma pele perfeita

Uma pele radiante começa com uma rotina de cuidados consistente. Veja o passo a passo completo.

## Rotina matinal

1. **Limpeza suave** - Remove impurezas acumuladas durante a noite
2. **Tônico** - Equilibra o pH e prepara a pele
3. **Sérum vitamina C** - Protege contra radicais livres
4. **Hidratante** - Mantém a pele nutrida
5. **Protetor solar** - ESSENCIAL, mesmo em dias nublados

## Rotina noturna

1. **Demaquilação** - Remove toda maquiagem
2. **Limpeza profunda** - Limpa poros e impurezas
3. **Esfoliação** - 2x por semana
4. **Sérum específico** - Ácido hialurônico ou retinol
5. **Creme noturno** - Nutrição intensa

## Cuidados semanais

- Máscara facial 1-2x
- Esfoliação suave 2x
- Hidratação extra conforme necessidade

## Dicas extras

✓ Beba muita água
✓ Durma bem
✓ Alimentação saudável
✓ Evite estresse
✓ Exercícios regulares

## Conclusão

Consistência é a chave! Resultados aparecem com dedicação diária.`,
          image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=500&fit=crop',
          author: 'BigHair Team',
          category: 'Beleza',
          published: true,
          publishedAt: '2025-01-03T10:00:00Z',
          createdAt: '2025-01-03T10:00:00Z',
          updatedAt: '2025-01-03T10:00:00Z',
        },
      ],

      setPosts: (posts) => set({ posts }),

      addPost: (post) => {
        set((state) => ({
          posts: [post, ...state.posts],
        }));
      },

      updatePost: (id, postData) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, ...postData, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      deletePost: (id) => {
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== id),
        }));
      },

      getPostById: (id) => {
        return get().posts.find((p) => p.id === id);
      },

      getPostBySlug: (slug) => {
        return get().posts.find((p) => p.slug === slug);
      },

      getPublishedPosts: () => {
        return get().posts
          .filter((p) => p.published)
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      },

      getPostsByCategory: (category) => {
        return get().posts
          .filter((p) => p.published && p.category.toLowerCase() === category.toLowerCase())
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      },
    }),
    {
      name: 'blog-storage',
    }
  )
);
