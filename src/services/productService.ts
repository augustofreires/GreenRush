import { api } from './api';
import type { Product, Category } from '../types';

export const productService = {
  // Produtos
  async getAll(): Promise<Product[]> {
    const response = await api.get('/products');
    return response.data;
  },

  async getById(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async getByCategory(categorySlug: string): Promise<Product[]> {
    const response = await api.get(`/products/category/${categorySlug}`);
    return response.data;
  },

  async search(query: string): Promise<Product[]> {
    const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  async getFeatured(): Promise<Product[]> {
    const response = await api.get('/products/featured');
    return response.data;
  },

  async getBestsellers(): Promise<Product[]> {
    const response = await api.get('/products/bestsellers');
    return response.data;
  },

  // CRUD Admin
  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const response = await api.post('/products', product);
    return response.data;
  },

  async update(id: string, product: Partial<Product>): Promise<Product> {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  // Categorias
  async getAllCategories(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data;
  },

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const response = await api.post('/categories', category);
    return response.data;
  },

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    const response = await api.put(`/categories/${id}`, category);
    return response.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
