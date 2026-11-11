/**
 * Purpose: Cart Context React context/provider. Main declarations: CartProvider, addToCart, removeFromCart, clearCart, useCart.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */

// Load react so this module can use its exported dependencies.
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";


// Declare CartContext for use by the surrounding module or function.
const CartContext = createContext();



// Define CartProvider; its parameters and body implement this operation.
export function CartProvider({
  children
}) {


  // Declare [cart,setCart] for use by the surrounding module or function.
  const [cart,setCart] = useState(
    []
  );



  // Perform the side effect or state update expressed on the following line.
  useEffect(()=>{


    // Declare savedCart for use by the surrounding module or function.
    const savedCart =
      localStorage.getItem(
        "cart"
      );


    // Check the condition (savedCart) and run the matching branch.
    if(savedCart){

      // Perform the side effect or state update expressed on the following line.
      queueMicrotask(() => {
        // Perform the side effect or state update expressed on the following line.
        setCart(JSON.parse(savedCart));
      });

    }


  },[]);





  // Perform the side effect or state update expressed on the following line.
  useEffect(()=>{


    // Perform the side effect or state update expressed on the following line.
    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );


  },[cart]);







  // Declare addToCart for use by the surrounding module or function.
  const addToCart = (item)=>{


    // Perform the side effect or state update expressed on the following line.
    setCart((prev)=>{


      // Declare exists for use by the surrounding module or function.
      const exists =
        prev.find(
          product =>
          product._id === item._id
        );


      // Check the condition (exists) and run the matching branch.
      if(exists){

        // Return the value of prev to the caller.
        return prev;

      }


      // Return the collection assembled below to the caller.
      return [
        ...prev,
        item
      ];


    });


  };







  // Declare removeFromCart for use by the surrounding module or function.
  const removeFromCart = (id)=>{


    // Perform the side effect or state update expressed on the following line.
    setCart(
      prev =>
      prev.filter(
        item =>
        item._id !== id
      )
    );


  };







  // Declare clearCart for use by the surrounding module or function.
  const clearCart = ()=>{

    // Perform the side effect or state update expressed on the following line.
    setCart([]);

  };






  // Declare total for use by the surrounding module or function.
  const total = cart.reduce(

    (sum,item)=>

      sum +
      Number(
        item.price || 0
      ),

    0

  );





  // Return the expression shown below to the caller.
  return (

    <CartContext.Provider

      value={{

        cart,

        addToCart,

        removeFromCart,

        clearCart,

        total

      }}

    >

      {children}

    </CartContext.Provider>

  );

}





// Define useCart; its parameters and body implement this operation.
export function useCart(){

  // Return the result of useContext() to the caller.
  return useContext(
    CartContext
  );

}
