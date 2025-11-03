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
          title: 'Benefícios da Cinta Modeladora: Transforme Seu Corpo',
          slug: 'beneficios-da-cinta-modeladora',
          excerpt: 'Descubra como a cinta modeladora pode ajudar no emagrecimento, postura e autoestima. Resultados visíveis desde o primeiro uso!',
          content: `# Benefícios da Cinta Modeladora: Transforme Seu Corpo

A cinta modeladora se tornou uma aliada essencial para quem busca um corpo mais definido e saudável. Conheça todos os benefícios comprovados!

## 1. Modelagem Instantânea

A cinta modeladora proporciona resultados visíveis desde o primeiro uso:
- **Redução de medidas** instantânea
- **Silhueta definida** na cintura e abdômen
- **Roupas ficam mais bonitas** e ajustadas
- **Confiança imediata** em qualquer ocasião

## 2. Auxílio no Emagrecimento

Quando usada regularmente durante exercícios:
- Aumenta a transpiração na região abdominal
- Ajuda a queimar gordura localizada
- Potencializa os resultados dos treinos
- Acelera o metabolismo local

## 3. Melhora da Postura

Um dos benefícios mais importantes:
- **Suporte para a coluna** durante todo o dia
- Reduz dores nas costas
- Corrige a postura gradualmente
- Fortalece a musculatura do core

## 4. Pós-Parto e Pós-Cirúrgico

Indicada por médicos para:
- Recuperação após cesariana
- Apoio no pós-parto normal
- Cicatrização de cirurgias abdominais
- Retorno mais rápido ao corpo anterior

## 5. Aumento da Autoestima

O impacto psicológico é real:
- Mais confiança no dia a dia
- Segurança para usar suas roupas favoritas
- Motivação para manter hábitos saudáveis
- Bem-estar emocional

## Como Usar Corretamente

Para obter melhores resultados:
1. Comece com 2-4 horas por dia
2. Aumente gradualmente o tempo de uso
3. Use durante exercícios para potencializar
4. Mantenha a pele limpa e hidratada
5. Escolha o tamanho correto

## Cuidados Importantes

⚠️ **Atenção**:
- Não use durante o sono
- Respeite seu conforto
- Hidrate-se bem
- Combine com alimentação saudável
- Consulte um médico se tiver dúvidas

## Conclusão

A cinta modeladora é muito mais que estética - é saúde, bem-estar e autoestima. Use corretamente e veja a transformação!`,
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=500&fit=crop',
          author: 'Green Rush Team',
          category: 'Emagrecimento',
          published: true,
          publishedAt: '2025-01-05T10:00:00Z',
          createdAt: '2025-01-05T10:00:00Z',
          updatedAt: '2025-01-05T10:00:00Z',
        },
        {
          id: '2',
          title: 'Vinagre de Maçã: O Segredo Para Emagrecer com Saúde',
          slug: 'beneficios-vinagre-de-maca',
          excerpt: 'Conheça os incríveis benefícios do vinagre de maçã para emagrecimento, digestão e saúde. Um aliado natural e poderoso!',
          content: `# Vinagre de Maçã: O Segredo Para Emagrecer com Saúde

O vinagre de maçã é um dos suplementos naturais mais poderosos para quem busca emagrecimento e saúde. Descubra por quê!

## 1. Acelera o Emagrecimento

Estudos científicos comprovam:
- **Aumenta a saciedade** e reduz o apetite
- **Acelera o metabolismo** naturalmente
- **Queima gordura** especialmente abdominal
- **Reduz picos de insulina** após refeições

## 2. Melhora a Digestão

Benefícios para o sistema digestivo:
- Estimula a produção de enzimas digestivas
- Alivia azia e refluxo
- Melhora a absorção de nutrientes
- Combate gases e inchaço

## 3. Controle do Açúcar no Sangue

Ideal para quem tem resistência à insulina:
- Reduz níveis de glicose
- Melhora sensibilidade à insulina
- Previne picos de açúcar
- Ajuda no controle do diabetes tipo 2

## 4. Desintoxicação Natural

Limpa o organismo de dentro para fora:
- **Ação detox** potente
- Elimina toxinas acumuladas
- Melhora função hepática
- Alcaliniza o pH do corpo

## 5. Fortalece a Imunidade

Propriedades antimicrobianas:
- Rico em probióticos naturais
- Combate bactérias nocivas
- Fortalece a flora intestinal
- Previne infecções

## 6. Benefícios para a Pele

Beleza de dentro para fora:
- Reduz acne e oleosidade
- Clareia manchas
- Tonifica a pele
- Ação anti-idade

## Como Consumir

**Receita básica**:
- 1-2 colheres de sopa de vinagre de maçã
- 200ml de água
- Tome 15-30 minutos antes das refeições
- 2x ao dia (almoço e jantar)

**Dica**: Adicione mel ou limão para melhorar o sabor!

## Cuidados Importantes

⚠️ **Atenção**:
- Sempre dilua em água (nunca puro!)
- Use canudo para proteger o esmalte dos dentes
- Escolha versão orgânica e não filtrada
- Comece com doses pequenas
- Consulte um médico se tiver gastrite

## Resultados Esperados

Com uso regular:
- ✓ Perda de 2-4kg por mês
- ✓ Redução de medidas abdominais
- ✓ Mais energia e disposição
- ✓ Digestão mais leve
- ✓ Pele mais bonita

## Conclusão

O vinagre de maçã é um aliado poderoso e natural para sua saúde. Combine com alimentação equilibrada e exercícios para resultados ainda melhores!`,
          image: 'https://images.unsplash.com/photo-1629978389675-9b279c1b2f46?w=800&h=500&fit=crop',
          author: 'Green Rush Team',
          category: 'Emagrecimento',
          published: true,
          publishedAt: '2025-01-04T10:00:00Z',
          createdAt: '2025-01-04T10:00:00Z',
          updatedAt: '2025-01-04T10:00:00Z',
        },
        {
          id: '3',
          title: 'Chás Detox: Emagreça e Elimine Toxinas Naturalmente',
          slug: 'beneficios-chas-detox',
          excerpt: 'Descubra como os chás detox podem transformar sua saúde, acelerar o emagrecimento e aumentar sua energia!',
          content: `# Chás Detox: Emagreça e Elimine Toxinas Naturalmente

Os chás detox são verdadeiros aliados na busca por um corpo saudável e uma vida mais leve. Conheça todos os benefícios!

## 1. Desintoxicação Profunda

A principal função dos chás detox:
- **Elimina toxinas** acumuladas no organismo
- Limpa fígado e rins naturalmente
- Remove resíduos metabólicos
- Purifica o sangue

## 2. Acelera o Emagrecimento

Como os chás ajudam a emagrecer:
- **Acelera o metabolismo** em até 10%
- Aumenta a queima de gordura
- Reduz retenção de líquidos
- Diminui o inchaço abdominal
- Controla o apetite

## 3. Melhora da Digestão

Benefícios para o sistema digestivo:
- Combate gases e constipação
- Estimula o funcionamento intestinal
- Reduz a sensação de peso após refeições
- Melhora absorção de nutrientes

## 4. Mais Energia e Disposição

Sinta a diferença no dia a dia:
- Aumenta os níveis de energia
- Combate a fadiga crônica
- Melhora o foco e concentração
- Proporciona bem-estar geral

## 5. Fortalece a Imunidade

Proteja seu corpo:
- Rico em antioxidantes
- Combate radicais livres
- Fortalece defesas naturais
- Previne doenças

## 6. Pele Mais Bonita

Beleza que vem de dentro:
- Reduz acne e espinhas
- Combate celulite
- Pele mais hidratada e luminosa
- Efeito anti-idade

## Principais Ingredientes

**Chá Verde**
- Termogênico natural
- Rico em antioxidantes
- Acelera metabolismo

**Hibisco**
- Combate retenção
- Ação diurética
- Controla pressão

**Gengibre**
- Anti-inflamatório
- Termogênico potente
- Melhora digestão

**Cavalinha**
- Diurético natural
- Elimina toxinas
- Fortalece cabelos e unhas

**Carqueja**
- Limpa o fígado
- Facilita digestão
- Controla glicose

## Como Preparar e Consumir

**Modo de preparo**:
1. Ferva 500ml de água
2. Adicione 1 sachê ou 1 colher de chá
3. Deixe em infusão por 5-10 minutos
4. Coe e consuma morno ou frio

**Quando tomar**:
- ☀️ **Manhã em jejum**: desintoxica e acelera metabolismo
- 🍽️ **Antes das refeições**: controla apetite
- 🌙 **À noite**: versões calmantes para melhor sono

**Frequência**: 2-3 xícaras por dia

## Resultados Esperados

Com uso regular (30 dias):
- ✓ Perda de 3-5kg
- ✓ Redução de inchaço
- ✓ Barriga mais lisa
- ✓ Mais disposição
- ✓ Pele mais bonita
- ✓ Melhor funcionamento intestinal

## Cuidados Importantes

⚠️ **Atenção**:
- Não substitua refeições por chás
- Evite adoçar (use stevia se necessário)
- Gestantes devem consultar médico
- Não exagere na quantidade
- Combine com alimentação saudável

## Potencialize os Resultados

Para emagrecer mais rápido:
- 💪 Pratique exercícios regulares
- 🥗 Alimentação equilibrada
- 💧 Beba 2L de água por dia
- 😴 Durma bem (7-8h)
- 🧘 Reduza o estresse

## Conclusão

Os chás detox são uma forma natural, saudável e deliciosa de cuidar do seu corpo. Faça do chá um hábito diário e transforme sua vida!`,
          image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&h=500&fit=crop',
          author: 'Green Rush Team',
          category: 'Emagrecimento',
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