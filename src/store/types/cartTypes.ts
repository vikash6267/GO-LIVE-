import { createAction } from '@reduxjs/toolkit';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  sizes:any[];
  customizations: Record<string, string>;
  notes: string;
}

export interface CartState {
  items: CartItem[];
}

// Create typed action creators
export const addToCart = createAction<CartItem>('cart/addToCart');
export const removeFromCart = createAction<string>('cart/removeFromCart');
export const updateQuantity = createAction<{
  productId: string;
  quantity: number;
}>('cart/updateQuantity');
export const clearCart = createAction('cart/clearCart');