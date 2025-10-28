import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number; // 1-5 estrelas
  title: string;
  comment: string;
  images: string[]; // URLs das imagens
  videoUrl?: string;
  isVerifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface ReviewStore {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateReview: (id: string, review: Partial<Review>) => void;
  deleteReview: (id: string) => void;
  approveReview: (id: string) => void;
  rejectReview: (id: string) => void;
  getReviewsByProduct: (productId: string) => Review[];
  getApprovedReviews: () => Review[];
  getPendingReviews: () => Review[];
  getAverageRating: (productId: string) => number;
  getReviewCount: (productId: string) => number;
}

export const useReviewStore = create<ReviewStore>()(
  persist(
    (set, get) => ({
      reviews: [
        // Cinta Modeladora - Produto ID: 1
        {
          id: 'r1',
          productId: '1',
          userId: 'u1',
          userName: 'Mariana Santos',
          userEmail: 'mariana@example.com',
          rating: 5,
          title: 'Excelente produto!',
          comment: 'Produto excelente! Uso todos os dias e já vejo muita diferença na cintura. Super confortável e realmente modela o corpo. Recomendo muito!',
          images: [],
          isVerifiedPurchase: true,
          status: 'approved' as const,
          createdAt: '2024-09-22T10:30:00.000Z',
          updatedAt: '2024-09-22T10:30:00.000Z',
        },
        {
          id: 'r2',
          productId: '1',
          userId: 'u2',
          userName: 'Luciana Ferreira',
          userEmail: 'luciana@example.com',
          rating: 5,
          title: 'Melhor cinta que já usei',
          comment: 'Melhor cinta que já usei! Material de qualidade e realmente modela o corpo. Valeu muito a pena o investimento.',
          images: [],
          isVerifiedPurchase: true,
          status: 'approved' as const,
          createdAt: '2024-09-16T14:20:00.000Z',
          updatedAt: '2024-09-16T14:20:00.000Z',
        },
        {
          id: 'r3',
          productId: '1',
          userId: 'u3',
          userName: 'Amanda Costa',
          userEmail: 'amanda@example.com',
          rating: 4,
          title: 'Muito boa!',
          comment: 'Muito boa! Ajudou muito na minha postura também. Uso no trabalho e quase não percebo que estou com ela. Recomendo!',
          images: [],
          isVerifiedPurchase: true,
          status: 'approved' as const,
          createdAt: '2024-09-11T09:15:00.000Z',
          updatedAt: '2024-09-11T09:15:00.000Z',
        },
        {
          id: 'r4',
          productId: '1',
          userId: 'u4',
          userName: 'Roberta Almeida',
          userEmail: 'roberta@example.com',
          rating: 5,
          title: 'Adorei!',
          comment: 'Simplesmente perfeita! Uso por baixo das roupas e ninguém percebe. A modelagem é incrível e realmente ajuda a afinar a cintura.',
          images: [],
          isVerifiedPurchase: true,
          status: 'approved' as const,
          createdAt: '2024-09-08T16:45:00.000Z',
          updatedAt: '2024-09-08T16:45:00.000Z',
        },

        // Chá Natural - Produto ID: 2
        {
          id: 'r5',
          productId: '2',
          userId: 'u5',
          userName: 'Maria Silva',
          userEmail: 'maria@example.com',
          rating: 5,
          title: 'Resultado incrível!',
          comment: 'Perdi 8kg em 2 meses tomando o chá regularmente. Produto excelente! O sabor é muito bom e me ajudou muito a controlar a ansiedade.',
          images: [],
          isVerifiedPurchase: true,
          status: 'approved' as const,
          createdAt: '2024-09-15T11:00:00.000Z',
          updatedAt: '2024-09-15T11:00:00.000Z',
        },
        {
          id: 'r6',
          productId: '2',
          userId: 'u6',
          userName: 'Ana Santos',
          userEmail: 'ana@example.com',
          rating: 5,
          title: 'Reduziu muito o inchaço',
          comment: 'Ajudou muito a reduzir o inchaço. Tomo pela manhã e antes das refeições. Sinto que minha digestão melhorou muito. Recomendo!',
          images: [],
          isVerifiedPurchase: true,
          status: 'approved' as const,
          createdAt: '2024-09-10T08:30:00.000Z',
          updatedAt: '2024-09-10T08:30:00.000Z',
        },
        {
          id: 'r7',
          productId: '2',
          userId: 'u7',
          userName: 'Juliana Costa',
          userEmail: 'juliana@example.com',
          rating: 4,
          title: 'Sabor agradável',
          comment: 'Gostei bastante, o sabor é agradável e me ajudou a controlar a ansiedade por doces. Já estou no segundo pacote.',
          images: [],
          isVerifiedPurchase: true,
          status: 'approved' as const,
          createdAt: '2024-09-05T13:20:00.000Z',
          updatedAt: '2024-09-05T13:20:00.000Z',
        },

        // Cápsulas - Produto ID: 3
        {
          id: 'r8',
          productId: '3',
          userId: 'u8',
          userName: 'Fernanda Lima',
          userEmail: 'fernanda@example.com',
          rating: 5,
          title: 'Produto maravilhoso!',
          comment: 'Produto maravilhoso! Já eliminei 12kg e me sinto muito mais disposta. Tomo religiosamente 2 vezes ao dia e os resultados são visíveis!',
          images: [],
          isVerifiedPurchase: true,
          status: 'approved' as const,
          createdAt: '2024-09-20T15:10:00.000Z',
          updatedAt: '2024-09-20T15:10:00.000Z',
        },
        {
          id: 'r9',
          productId: '3',
          userId: 'u9',
          userName: 'Carla Mendes',
          userEmail: 'carla@example.com',
          rating: 5,
          title: 'Melhor suplemento!',
          comment: 'Melhor suplemento que já usei. Sem efeitos colaterais e resultados rápidos! Estou super satisfeita e já indiquei para várias amigas.',
          images: [],
          isVerifiedPurchase: true,
          status: 'approved' as const,
          createdAt: '2024-09-12T10:45:00.000Z',
          updatedAt: '2024-09-12T10:45:00.000Z',
        },
        {
          id: 'r10',
          productId: '3',
          userId: 'u10',
          userName: 'Patrícia Oliveira',
          userEmail: 'patricia@example.com',
          rating: 5,
          title: 'Super recomendo!',
          comment: 'Estou no segundo mês e já perdi 9kg. Super recomendo! A energia que sinto ao longo do dia também melhorou muito.',
          images: [],
          isVerifiedPurchase: true,
          status: 'approved' as const,
          createdAt: '2024-09-08T12:00:00.000Z',
          updatedAt: '2024-09-08T12:00:00.000Z',
        },
        {
          id: 'r11',
          productId: '3',
          userId: 'u11',
          userName: 'Daniela Rodrigues',
          userEmail: 'daniela@example.com',
          rating: 4,
          title: 'Muito bom',
          comment: 'Produto muito bom! Já perdi 5kg no primeiro mês. Continuarei usando para alcançar meu objetivo.',
          images: [],
          isVerifiedPurchase: true,
          status: 'approved' as const,
          createdAt: '2024-09-03T14:30:00.000Z',
          updatedAt: '2024-09-03T14:30:00.000Z',
        },

        // SlimShot - Produto ID: 4
        {
          id: 'r12',
          productId: '4',
          userId: 'u12',
          userName: 'Renata Oliveira',
          userEmail: 'renata@example.com',
          rating: 5,
          title: 'Adoro!',
          comment: 'Adoro! Super prático e me ajudou muito a desinchar. Tomo todos os dias antes do café e já virou parte da minha rotina.',
          images: [],
          isVerifiedPurchase: true,
          status: 'approved' as const,
          createdAt: '2024-09-18T09:00:00.000Z',
          updatedAt: '2024-09-18T09:00:00.000Z',
        },
        {
          id: 'r13',
          productId: '4',
          userId: 'u13',
          userName: 'Beatriz Rocha',
          userEmail: 'beatriz@example.com',
          rating: 4,
          title: 'Sabor bom',
          comment: 'O sabor é bom e realmente funciona. Senti diferença na digestão desde a primeira semana. Valeu a pena!',
          images: [],
          isVerifiedPurchase: true,
          status: 'approved' as const,
          createdAt: '2024-09-14T11:30:00.000Z',
          updatedAt: '2024-09-14T11:30:00.000Z',
        },
        {
          id: 'r14',
          productId: '4',
          userId: 'u14',
          userName: 'Camila Souza',
          userEmail: 'camila@example.com',
          rating: 5,
          title: 'Resultados incríveis!',
          comment: 'Combinei com as cápsulas e os resultados foram incríveis! Já eliminei 6kg em um mês. Super indico!',
          images: [],
          isVerifiedPurchase: true,
          status: 'approved' as const,
          createdAt: '2024-09-09T16:00:00.000Z',
          updatedAt: '2024-09-09T16:00:00.000Z',
        },

        // Algumas avaliações pendentes para teste do admin
        {
          id: 'r15',
          productId: '1',
          userId: 'u15',
          userName: 'Gabriela Martins',
          userEmail: 'gabriela@example.com',
          rating: 5,
          title: 'Estou amando!',
          comment: 'Estou usando há 2 semanas e já percebo a diferença. A cinta é muito confortável e discreta.',
          images: [],
          isVerifiedPurchase: true,
          status: 'pending' as const,
          createdAt: '2024-10-15T10:00:00.000Z',
          updatedAt: '2024-10-15T10:00:00.000Z',
        },
        {
          id: 'r16',
          productId: '2',
          userId: 'u16',
          userName: 'Paula Soares',
          userEmail: 'paula@example.com',
          rating: 4,
          title: 'Bom produto',
          comment: 'Chá gostoso e está me ajudando muito. Já perdi 3kg em 3 semanas.',
          images: [],
          isVerifiedPurchase: false,
          status: 'pending' as const,
          createdAt: '2024-10-16T14:00:00.000Z',
          updatedAt: '2024-10-16T14:00:00.000Z',
        },
        {
          id: 'r17',
          productId: '3',
          userId: 'u17',
          userName: 'Rafaela Lima',
          userEmail: 'rafaela@example.com',
          rating: 5,
          title: 'Funcionou comigo!',
          comment: 'Cápsulas excelentes! Me sinto mais disposta e já eliminei 4kg no primeiro mês.',
          images: [],
          isVerifiedPurchase: true,
          status: 'pending' as const,
          createdAt: '2024-10-17T09:30:00.000Z',
          updatedAt: '2024-10-17T09:30:00.000Z',
        },
      ],

      addReview: (review) => {
        const newReview: Review = {
          ...review,
          id: Date.now().toString(),
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          reviews: [newReview, ...state.reviews],
        }));
      },

      updateReview: (id, reviewUpdate) => {
        set((state) => ({
          reviews: state.reviews.map((review) =>
            review.id === id
              ? { ...review, ...reviewUpdate, updatedAt: new Date().toISOString() }
              : review
          ),
        }));
      },

      deleteReview: (id) => {
        set((state) => ({
          reviews: state.reviews.filter((review) => review.id !== id),
        }));
      },

      approveReview: (id) => {
        set((state) => ({
          reviews: state.reviews.map((review) =>
            review.id === id
              ? { ...review, status: 'approved', updatedAt: new Date().toISOString() }
              : review
          ),
        }));
      },

      rejectReview: (id) => {
        set((state) => ({
          reviews: state.reviews.map((review) =>
            review.id === id
              ? { ...review, status: 'rejected', updatedAt: new Date().toISOString() }
              : review
          ),
        }));
      },

      getReviewsByProduct: (productId) => {
        return get()
          .reviews.filter((review) => review.productId === productId && review.status === 'approved')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getApprovedReviews: () => {
        return get()
          .reviews.filter((review) => review.status === 'approved')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getPendingReviews: () => {
        return get()
          .reviews.filter((review) => review.status === 'pending')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getAverageRating: (productId) => {
        const productReviews = get().reviews.filter(
          (review) => review.productId === productId && review.status === 'approved'
        );
        if (productReviews.length === 0) return 0;
        const sum = productReviews.reduce((acc, review) => acc + review.rating, 0);
        return Math.round((sum / productReviews.length) * 10) / 10;
      },

      getReviewCount: (productId) => {
        return get().reviews.filter(
          (review) => review.productId === productId && review.status === 'approved'
        ).length;
      },
    }),
    {
      name: 'review-storage',
      version: 1, // Incrementar para forçar reset com avaliações mockadas
    }
  )
);
