interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image_url: string;
  }
  
  const CART_KEY = "cart";
  
  const signalCartUpdate = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cart-updated'));
    }
  }

  export const getCart = (): CartItem[] => {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart).map((item: CartItem) => (
      {
        ...item,
        price: Number(item.price)
      }
    )) : [];
  };
  
  export const addToCart = (item: CartItem) => {
    const cart = getCart();
    const existingItem = cart.find((i) => i.productId === item.productId);
  
    if (existingItem) {
      existingItem.quantity += item.quantity; // Update quantity if item already exists
    } else {
      cart.push(item); // Add new item to the cart
    }
  
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    signalCartUpdate();
  };
  
  export const removeFromCart = (productId: string) => {
    const cart = getCart();
    const updatedCart = cart.filter((item) => item.productId !== productId);
    localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
    signalCartUpdate();
  };
  
  export const updateCartItemQuantity = (productId: string, quantity: number) => {
    const cart = getCart();
    const item = cart.find((i) => i.productId === productId);
  
    if (item) {
      item.quantity = quantity;
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      signalCartUpdate();
    }
  };
  
  export const clearCart = () => {
    localStorage.removeItem(CART_KEY);
    signalCartUpdate();
  };