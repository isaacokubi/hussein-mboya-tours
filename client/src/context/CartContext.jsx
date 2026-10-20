// Import React helpers for creating and consuming shared cart state.
import {
  createContext, // Create the shared context object.
  useContext, // Read the nearest provider's context value.
  useEffect, // Run persistence logic when the cart changes or mounts.
  useState, // Store the cart items in component state.
} from "react";

// Create the context used to expose cart data and actions to child components.
const CartContext = createContext();

// Provide cart state and operations to the component subtree.
export function CartProvider({ children }) {
  // Start with an empty cart until any saved cart has been restored.
  const [cart, setCart] = useState([]);

  // Restore the cart previously saved in browser local storage.
  useEffect(() => {
    // Read the persisted JSON string, if the browser has one.
    const savedCart = localStorage.getItem("cart");

    // Restore state only when a saved cart value exists.
    if (savedCart) {
      // Queue the state update so it runs after the current effect completes.
      queueMicrotask(() => {
        // Parse the saved JSON and use the resulting array as the cart state.
        setCart(JSON.parse(savedCart));
      });
    }
  }, []); // Run restoration once when the provider mounts.

  // Persist every cart change so the cart can survive page reloads.
  useEffect(() => {
    // Convert the current cart array to JSON and store it under the cart key.
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]); // Re-save when the cart contents change.

  // Add a product to the cart unless that product is already present.
  const addToCart = (item) => {
    // Use the previous state to avoid updates based on a stale cart value.
    setCart((prev) => {
      // Find a cart item with the same product identifier.
      const exists = prev.find((product) => product._id === item._id);

      // Do not add the same product twice.
      if (exists) {
        // Preserve the current array when the product already exists.
        return prev;
      }

      // Return a new array containing all previous items and the new item.
      return [
        ...prev,
        item,
      ];
    });
  };

  // Remove a cart item by its product identifier.
  const removeFromCart = (id) => {
    // Build a new array containing every item except the selected identifier.
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  // Remove every item from the cart.
  const clearCart = () => {
    // Replace the cart with a new empty array.
    setCart([]);
  };

  // Calculate the sum of item prices for the current cart.
  const total = cart.reduce(
    // Add each product's numeric price to the running total.
    (sum, item) => sum + Number(item.price || 0),
    0, // Start the accumulator at zero.
  );

  // Expose cart state and actions to all descendants.
  return (
    <CartContext.Provider
      value={{
        cart, // Current cart item array.
        addToCart, // Function for adding a product.
        removeFromCart, // Function for removing a product by ID.
        clearCart, // Function for emptying the cart.
        total, // Calculated sum of product prices.
      }}
    >
      {/* Render the children that consume cart context. */}
      {children}
    </CartContext.Provider>
  );
}

// Provide a hook for reading cart state/actions from any descendant component.
export function useCart() {
  // Return the value published by the nearest CartContext provider.
  return useContext(CartContext);
}
