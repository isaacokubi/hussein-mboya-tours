/**
 * Purpose: wish List Button reusable UI component. Main declarations: WishlistButton.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/components/WishlistButton.jsx

// Load @tanstack/react-query so this module can use its exported dependencies.
import {
  useMutation,
  useQueryClient
} from "@tanstack/react-query";


// Load ../../api/wishlistApi so this module can use its exported dependencies.
import {
  addWishlist
} from "../../api/wishlistApi";


// Load react-toastify so this module can use its exported dependencies.
import {
  toast
} from "react-toastify";



// Define WishlistButton; its parameters and body implement this operation.
export default function WishlistButton({
  tourId
}) {


  // Declare queryClient for use by the surrounding module or function.
  const queryClient = useQueryClient();



  // Declare mutation for use by the surrounding module or function.
  const mutation = useMutation({

    mutationFn: () =>
      addWishlist(tourId),



    onSuccess: () => {


      // Perform the side effect or state update expressed on the following line.
      toast.success(
        "Added to wishlist"
      );


      // Perform the side effect or state update expressed on the following line.
      queryClient.invalidateQueries({

        queryKey: [
          "wishlist"
        ]

      });


      // Perform the side effect or state update expressed on the following line.
      queryClient.invalidateQueries({

        queryKey: [
          "tours"
        ]

      });


    },



    onError: (error) => {


      // Perform the side effect or state update expressed on the following line.
      toast.error(

        error?.response?.data?.message
        ||
        "Failed to add wishlist"

      );


    }


  });





  // Return the expression shown below to the caller.
  return (

    <button


      onClick={() =>
        mutation.mutate()
      }


      disabled={
        mutation.isPending
      }


      className={`
      text-2xl
      transition
      ${
        mutation.isPending
        ?
        "opacity-50 cursor-not-allowed"
        :
        "text-red-600 hover:scale-110"
      }
      `}


      title="Add to wishlist"


    >


      ♥


    </button>

  );

}
