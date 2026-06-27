import { create } from "zustand";

export type CartItem = {
  variantId: string;
  productName: string;
  variantLabel: string;
  price: number;
  image: string | null;
  slug: string;
  quantity: number;
  stock: number;
};

type CartStore = {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  setItems: (items: CartItem[]) => void;
  openCart: () => void;
  closeCart: () => void;
  setLoading: (v: boolean) => void;
};

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  isOpen: false,
  isLoading: false,
  setItems: (items) => set({ items }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
