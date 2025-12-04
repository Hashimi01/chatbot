import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  product: {
    _id: string;
    name: string;
    nameAr?: string;
    nameFr?: string;
    nameEn?: string;
    sku: string;
    price: number;
    stockQuantity?: number;
    images?: string[];
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
  tax?: number;
}

export interface Customer {
  _id?: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface POSState {
  // Cart state
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  
  // Customer state
  customer: Customer | null;
  
  // Payment state
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'online';
  
  // UI state
  isProcessing: boolean;
  showPaymentModal: boolean;
  showCustomerModal: boolean;
  
  // Actions
  addItem: (product: CartItem['product'], quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  setCustomer: (customer: Customer | null) => void;
  setPaymentMethod: (method: 'cash' | 'card' | 'bank_transfer' | 'online') => void;
  setDiscount: (discount: number) => void;
  setTax: (tax: number) => void;
  
  setProcessing: (processing: boolean) => void;
  setShowPaymentModal: (show: boolean) => void;
  setShowCustomerModal: (show: boolean) => void;
  
  // Calculations
  calculateTotals: () => void;
  
  // Complete sale
  completeSale: () => Promise<void>;
}

export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      customer: null,
      paymentMethod: 'cash',
      isProcessing: false,
      showPaymentModal: false,
      showCustomerModal: false,

      // Actions
      addItem: (product, quantity = 1) => {
        const state = get();
        const existingItem = state.items.find(item => item.product._id === product._id);
        
        if (existingItem) {
          // Update existing item
          const newQuantity = existingItem.quantity + quantity;
          state.updateItemQuantity(product._id, newQuantity);
        } else {
          // Add new item
          const totalPrice = quantity * product.price;
          const newItem: CartItem = {
            product,
            quantity,
            unitPrice: product.price,
            totalPrice,
            discount: 0,
            tax: 0
          };
          
          set(state => ({
            items: [...state.items, newItem]
          }));
          
          get().calculateTotals();
        }
      },

      removeItem: (productId) => {
        set(state => ({
          items: state.items.filter(item => item.product._id !== productId)
        }));
        get().calculateTotals();
      },

      updateItemQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set(state => ({
          items: state.items.map(item =>
            item.product._id === productId
              ? {
                  ...item,
                  quantity,
                  totalPrice: quantity * item.unitPrice - (item.discount || 0) + (item.tax || 0)
                }
              : item
          )
        }));
        get().calculateTotals();
      },

      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          discount: 0,
          tax: 0,
          total: 0,
          customer: null,
          isProcessing: false,
          showPaymentModal: false,
          showCustomerModal: false
        });
      },

      setCustomer: (customer) => {
        set({ customer });
      },

      setPaymentMethod: (paymentMethod) => {
        set({ paymentMethod });
      },

      setDiscount: (discount) => {
        set({ discount });
        get().calculateTotals();
      },

      setTax: (tax) => {
        set({ tax });
        get().calculateTotals();
      },

      setProcessing: (isProcessing) => {
        set({ isProcessing });
      },

      setShowPaymentModal: (showPaymentModal) => {
        set({ showPaymentModal });
      },

      setShowCustomerModal: (showCustomerModal) => {
        set({ showCustomerModal });
      },

      calculateTotals: () => {
        const state = get();
        const subtotal = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
        const total = subtotal - state.discount + state.tax;
        
        set({ subtotal, total });
      },

      completeSale: async () => {
        const state = get();
        
        if (state.items.length === 0) {
          throw new Error('Cart is empty');
        }

        set({ isProcessing: true });

        try {
          const orderData = {
            items: state.items.map(item => ({
              product: item.product._id,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount || 0,
              tax: item.tax || 0
            })),
            customer: state.customer?._id,
            customerInfo: state.customer ? {
              name: state.customer.fullName || `${state.customer.firstName || ''} ${state.customer.lastName || ''}`.trim(),
              email: state.customer.email || '',
              phone: state.customer.phone || '',
              address: state.customer.address || ''
            } : undefined,
            discount: state.discount,
            tax: state.tax,
            paymentMethod: state.paymentMethod
          };

          const response = await fetch('/api/pos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
          });

          if (!response.ok) {
            throw new Error('Failed to complete sale');
          }

          const result = await response.json();
          
          // Clear cart after successful sale
          get().clearCart();
          
          return result;
        } catch (error) {
          console.error('Error completing sale:', error);
          throw error;
        } finally {
          set({ isProcessing: false });
        }
      }
    }),
    {
      name: 'pos-store',
      partialize: (state) => ({
        items: state.items,
        customer: state.customer,
        paymentMethod: state.paymentMethod,
        discount: state.discount,
        tax: state.tax
      })
    }
  )
);
