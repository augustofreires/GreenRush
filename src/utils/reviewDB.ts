import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Review } from '../store/useReviewStore';

interface ReviewDB extends DBSchema {
  reviews: {
    key: string;
    value: Review;
    indexes: {
      'by-product': string;
      'by-status': string;
    };
  };
}

let dbInstance: IDBPDatabase<ReviewDB> | null = null;

async function getDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<ReviewDB>('review-database', 1, {
    upgrade(db) {
      const reviewStore = db.createObjectStore('reviews', {
        keyPath: 'id',
      });
      reviewStore.createIndex('by-product', 'productId');
      reviewStore.createIndex('by-status', 'status');
    },
  });

  return dbInstance;
}

export const reviewDB = {
  async getAllReviews(): Promise<Review[]> {
    const db = await getDB();
    return db.getAll('reviews');
  },

  async getReview(id: string): Promise<Review | undefined> {
    const db = await getDB();
    return db.get('reviews', id);
  },

  async addReview(review: Review): Promise<void> {
    const db = await getDB();
    await db.add('reviews', review);
  },

  async updateReview(review: Review): Promise<void> {
    const db = await getDB();
    await db.put('reviews', review);
  },

  async deleteReview(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('reviews', id);
  },

  async getReviewsByProduct(productId: string): Promise<Review[]> {
    const db = await getDB();
    return db.getAllFromIndex('reviews', 'by-product', productId);
  },

  async getReviewsByStatus(status: string): Promise<Review[]> {
    const db = await getDB();
    return db.getAllFromIndex('reviews', 'by-status', status);
  },
};
