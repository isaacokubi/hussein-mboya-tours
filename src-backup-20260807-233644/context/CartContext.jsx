import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";


const CartContext = createContext();



export function CartProvider({
  children
}) {


  const [cart,setCart] = useState(
    []
  );



  useEffect(()=>{


    const savedCart =
      localStorage.getItem(
        "cart"
      );


    if(savedCart){

      setCart(
        JSON.parse(savedCart)
      );

    }


  },[]);





  useEffect(()=>{


    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );


  },[cart]);







  const addToCart = (item)=>{


    setCart((prev)=>{


      const exists =
        prev.find(
          product =>
          product._id === item._id
        );


      if(exists){

        return prev;

      }


      return [
        ...prev,
        item
      ];


    });


  };







  const removeFromCart = (id)=>{


    setCart(
      prev =>
      prev.filter(
        item =>
        item._id !== id
      )
    );


  };







  const clearCart = ()=>{

    setCart([]);

  };






  const total = cart.reduce(

    (sum,item)=>

      sum +
      Number(
        item.price || 0
      ),

    0

  );





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





export function useCart(){

  return useContext(
    CartContext
  );

}