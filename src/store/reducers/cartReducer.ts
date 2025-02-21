import { createReducer } from '@reduxjs/toolkit';
import { CartState, addToCart, removeFromCart, updateQuantity, clearCart } from '../types/cartTypes';

const initialState: CartState = {
  items: [],
};

export const cartReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(addToCart, (state, action) => {
      const existingItem = state.items.find(item => item.productId === action.payload.productId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push(action.payload);
      }
    })
    .addCase(removeFromCart, (state, action) => {
      state.items = state.items.filter(item => item.productId !== action.payload);
    })
    .addCase(updateQuantity, (state, action) => {
      const item = state.items.find(item => item.productId === action.payload.productId);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    })
    .addCase(clearCart, (state) => {
      state.items = [];
    });
});