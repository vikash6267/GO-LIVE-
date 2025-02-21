import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { addToCart as addToCartAction, removeFromCart as removeFromCartAction, updateQuantity as updateQuantityAction, clearCart as clearCartAction } from '@/store/actions/cartActions';
import { CartItem } from '@/store/types/cartTypes';

export const useCart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const addToCart = async (item: CartItem) => {
    try {
      dispatch(addToCartAction(item));
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      dispatch(removeFromCartAction(productId));
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      if (quantity < 1) return false;
      dispatch(updateQuantityAction(productId, quantity));
      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      return false;
    }
  };

  const clearCart = async () => {
    try {
      dispatch(clearCartAction());
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
};