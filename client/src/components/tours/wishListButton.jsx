import {
useMutation,
useQueryClient
}
from "@tanstack/react-query";


import {
addWishlist
}
from "../../api/wishlistApi";


import {
toast
}
from "react-toastify";



export default function WishlistButton({
tourId
}){


const queryClient =
useQueryClient();



const mutation =
useMutation({

mutationFn:
()=>addWishlist(tourId),


onSuccess:()=>{


toast.success(
"Added to wishlist"
);


queryClient.invalidateQueries(
[
"wishlist"
]
);


}

});



return (

<button

onClick={
mutation.mutate
}

className="
text-red-600
text-2xl
"

>

♥

</button>

);

}