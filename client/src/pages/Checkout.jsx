import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";

import { createBooking } from "../api/bookingApi";
import { initiateMpesa } from "../api/mpesaApi";

import { useCart } from "../context/CartContext";


export default function Checkout() {

  const navigate = useNavigate();

  const {
    cart,
    clearCart,
  } = useCart();


  const tour = cart?.[0];


  const [travelDate,setTravelDate] = useState("");

  const [travellerCount,setTravellerCount] = useState(1);

  const [phone,setPhone] = useState("");



  const bookingMutation = useMutation({

    mutationFn: createBooking,

    onSuccess: async(response)=>{

      const booking =
        response.booking;


      try {

        await initiateMpesa({

          bookingId:
            booking._id,

          phone,

          amount:
            booking.totalAmount

        });


        toast.success(
          "M-Pesa payment request sent"
        );


        clearCart();

        navigate(
          "/dashboard"
        );


      } catch(error){

        toast.error(
          error?.response?.data?.message ||
          "M-Pesa initiation failed"
        );

      }

    },


    onError:(error)=>{

      toast.error(
        error?.response?.data?.message ||
        "Booking failed"
      );

    }

  });





  if(!tour){

    return (
      <div className="p-10 text-center">

        No tour selected

      </div>
    );

  }





  const submitBooking = (e)=>{

    e.preventDefault();



    if(!travelDate){

      toast.error(
        "Please select travel date"
      );

      return;

    }



    if(travellerCount < 1){

      toast.error(
        "At least one traveller is required"
      );

      return;

    }



    /*
    |--------------------------------------------------------------------------
    | IMPORTANT
    | Backend expects travelers array
    |--------------------------------------------------------------------------
    */


    const travelers =
      Array.from(
        {
          length:
          Number(travellerCount)
        },
        (_,index)=>({

          name:
          `Traveller ${index+1}`,

          age:0,

          passport:""

        })
      );




    bookingMutation.mutate({

      tour:
      tour._id,


      travelDate,


      travelers,


      contact:{

        phone

      },


      paymentMethod:
      "MPESA"


    });


  };






  const total =
    Number(tour.price || 0) *
    Number(travellerCount);





  return (

    <div className="max-w-xl mx-auto p-6">


      <h1 className="text-2xl font-bold mb-5">

        Complete Booking

      </h1>




      <form
        onSubmit={submitBooking}
        className="space-y-5"
      >



        <div>

          <label>
            Tour
          </label>


          <input

            value={
              tour.title
            }

            readOnly

            className="border p-2 w-full"

          />

        </div>





        <div>

          <label>
            Travel Date
          </label>


          <input

            type="date"

            value={
              travelDate
            }

            onChange={
              e=>setTravelDate(
                e.target.value
              )
            }

            className="border p-2 w-full"

            required

          />

        </div>






        <div>

          <label>
            Number of Travellers
          </label>


          <input

            type="number"

            min="1"

            value={
              travellerCount
            }

            onChange={
              e=>setTravellerCount(
                e.target.value
              )
            }


            className="border p-2 w-full"

          />

        </div>






        <div>

          <label>
            M-Pesa Phone Number
          </label>


          <input

            value={
              phone
            }

            onChange={
              e=>setPhone(
                e.target.value
              )
            }


            placeholder="0700000000"


            className="border p-2 w-full"


            required

          />

        </div>





        <div className="font-bold text-lg">

          You will pay:

          {" "}

          KES {total.toLocaleString()}


        </div>






        <button

          disabled={
            bookingMutation.isPending
          }

          className="bg-green-600 text-white px-5 py-3 rounded w-full"

        >

          {
            bookingMutation.isPending
            ?
            "Processing..."
            :
            "Pay with M-Pesa"
          }


        </button>




      </form>


    </div>

  );

}