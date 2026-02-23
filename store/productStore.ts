import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PlatformFormat = 'etsy' | 'ebay' | 'amazon' | 'shopify';

export interface ChatMessage {
  role: 'user' | 'model';
  text?: string;
  imagePath?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  tags: string[];
  suggestedPriceLow: number;
  suggestedPriceHigh: number;
  category: string;
  platformFormat: PlatformFormat;
  imagePaths: string[];
  primaryImageIndex: number;
  aiChatHistory: ChatMessage[];
  listingScore: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductState {
  products: Product[];
}

interface ProductActions {
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
}

interface ProductStats {
  getTotalProducts: () => number;
  getTotalImages: () => number;
}

export const useProductStore = create<ProductState & ProductActions & ProductStats>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, product],
        })),

      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      getProduct: (id) => get().products.find((p) => p.id === id),

      getTotalProducts: () => get().products.length,

      getTotalImages: () =>
        get().products.reduce((total, p) => total + p.imagePaths.length, 0),
    }),
    {
      name: 'product-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
