// client/src/components/WishlistButton.jsx

import {
  useMutation,
  useQueryClient
} from "@tanstack/react-query";


import {
  addWishlist
} from "../../api/wishlistApi";


import {
  toast
} from "react-toastify";



export default function WishlistButton({
  tourId
}) {


  const queryClient = useQueryClient();



  const mutation = useMutation({

    mutationFn: () =>
      addWishlist(tourId),



    onSuccess: () => {


      toast.success(
        "Added to wishlist"
      );


      queryClient.invalidateQueries({

        queryKey: [
          "wishlist"
        ]

      });


      queryClient.invalidateQueries({

        queryKey: [
          "tours"
        ]

      });


    },



    onError: (error) => {


      toast.error(

        error?.response?.data?.message
        ||
        "Failed to add wishlist"

      );


    }


  });





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