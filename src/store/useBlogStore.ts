import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_BASE_URL || "/api";

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
  isLoading: boolean;
  loadPosts: () => Promise<void>;
  setPosts: (posts: BlogPost[]) => void;
  addPost: (post: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updatePost: (id: string, post: Partial<BlogPost>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  getPostById: (id: string) => BlogPost | undefined;
  getPostBySlug: (slug: string) => BlogPost | undefined;
  getPublishedPosts: () => BlogPost[];
  getPostsByCategory: (category: string) => BlogPost[];
}

export const useBlogStore = create<BlogStore>()((set, get) => ({
  posts: [],
  isLoading: false,

  loadPosts: async () => {
    try {
      set({ isLoading: true });
      const response = await fetch(`${API_URL}/admin/blog/posts`);
      
      if (!response.ok) {
        throw new Error("Erro ao carregar posts");
      }

      const data = await response.json();
      
      // Converter formato do MySQL para formato do frontend
      const posts = data.map((post: any) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: post.content,
        image: post.image || "",
        author: post.author || "Admin",
        category: post.category || "",
        published: Boolean(post.is_published),
        publishedAt: post.published_at || post.created_at,
        createdAt: post.created_at,
        updatedAt: post.updated_at
      }));

      set({ posts, isLoading: false });
    } catch (error) {
      console.error("Erro ao carregar posts do blog:", error);
      set({ isLoading: false });
    }
  },

  setPosts: (posts) => set({ posts }),

  addPost: async (post) => {
    try {
      const response = await fetch(`${API_URL}/admin/blog/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          image: post.image,
          author: post.author,
          category: post.category,
          isPublished: post.published,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Erro ao criar post");
      }

      // Recarregar posts após adicionar
      await get().loadPosts();
    } catch (error) {
      console.error("Erro ao adicionar post:", error);
      throw error;
    }
  },

  updatePost: async (id, post) => {
    try {
      const currentPost = get().posts.find((p) => p.id === id);
      if (!currentPost) {
        throw new Error("Post não encontrado");
      }

      const updatedData = {
        title: post.title || currentPost.title,
        slug: post.slug || currentPost.slug,
        excerpt: post.excerpt || currentPost.excerpt,
        content: post.content || currentPost.content,
        image: post.image !== undefined ? post.image : currentPost.image,
        author: post.author || currentPost.author,
        category: post.category || currentPost.category,
        isPublished: post.published !== undefined ? post.published : currentPost.published,
      };

      const response = await fetch(`${API_URL}/admin/blog/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Erro ao atualizar post");
      }

      // Recarregar posts após atualizar
      await get().loadPosts();
    } catch (error) {
      console.error("Erro ao atualizar post:", error);
      throw error;
    }
  },

  deletePost: async (id) => {
    try {
      const response = await fetch(`${API_URL}/admin/blog/posts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Erro ao deletar post");
      }

      // Atualizar localmente
      set((state) => ({
        posts: state.posts.filter((p) => p.id !== id),
      }));
    } catch (error) {
      console.error("Erro ao deletar post:", error);
      throw error;
    }
  },

  getPostById: (id) => {
    return get().posts.find((post) => post.id === id);
  },

  getPostBySlug: (slug) => {
    return get().posts.find((post) => post.slug === slug);
  },

  getPublishedPosts: () => {
    return get().posts.filter((post) => post.published);
  },

  getPostsByCategory: (category) => {
    return get().posts.filter((post) => post.category === category && post.published);
  },
}));
