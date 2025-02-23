import { createReducer } from '@reduxjs/toolkit';
import { CartState, addToCart, removeFromCart, updateQuantity, clearCart } from '../types/cartTypes';

const initialState: CartState = {
  items: JSON.parse(localStorage.getItem("cartItems") || "[]"),
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
      localStorage.setItem("cartItems", JSON.stringify(state.items)); // ✅ Save to localStorage
    })
    .addCase(removeFromCart, (state, action) => {
      state.items = state.items.filter(item => item.productId !== action.payload);
      localStorage.setItem("cartItems", JSON.stringify(state.items)); // ✅ Save to localStorage
    })
    .addCase(updateQuantity, (state, action) => {
      const { productId, sizeId, quantity } = action.payload;
      const product = state.items.find((item) => item.productId === productId);
      if (product) {
        const size = product.sizes.find((size) => size.id === sizeId);
        if (size) {
          size.quantity = +quantity;
        }
      }
      localStorage.setItem("cartItems", JSON.stringify(state.items)); // ✅ Save to localStorage
    })
    .addCase(clearCart, (state) => {
      state.items = [];
      localStorage.removeItem("cartItems"); // ✅ Remove from localStorage
    });
});
