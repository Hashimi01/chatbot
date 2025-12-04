import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  _id: string;
  name: string;
  nameAr: string;
  nameFr?: string;
  price: number;
  quantity: number;
  image?: string;
  stockQuantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i._id === item._id);
        
        if (existingItem) {
          if (existingItem.quantity < item.stockQuantity) {
            set({
              items: items.map((i) =>
                i._id === item._id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            });
          }
        } else {
          set({
            items: [...items, { ...item, quantity: 1 }],
          });
        }
      },
      
      removeItem: (id) => {
        set({
          items: get().items.filter((item) => item._id !== id),
        });
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        
        set({
          items: get().items.map((item) =>
            item._id === id
              ? { ...item, quantity: Math.min(quantity, item.stockQuantity) }
              : item
          ),
        });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);


