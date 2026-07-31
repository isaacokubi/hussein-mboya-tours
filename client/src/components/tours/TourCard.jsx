// client/src/components/TourCard.jsx

import { Link } from "react-router-dom";


export default function TourCard({
  tour
}) {


  const price = Number(tour.price || 0);


  const discountedPrice = tour.discount
    ? price - (
        price *
        Number(tour.discount) /
        100
      )
    : price;



  const tourImage =
    typeof tour.images?.[0] === "object"
      ? tour.images?.[0]?.url
      :
      tour.images?.[0]
      ||
      tour.image
      ||
      "/placeholder.jpg";



  const tourTitle =
    tour.title
    ||
    tour.name
    ||
    "Amazing Safari Experience";



  const rating =
    typeof tour.rating === "object"
      ? tour.rating?.average
      :
      tour.rating;



  return (

    <div

      className="
      bg-white
      rounded-2xl
      shadow-lg
      overflow-hidden
      hover:shadow-xl
      transition
      "

    >



      <div className="relative">


        <img

          src={tourImage}

          alt={tourTitle}

          className="
          w-full
          h-64
          object-cover
          "

          onError={(e)=>{

            e.currentTarget.src =
              "/placeholder.jpg";

          }}

        />



        {
          tour.discount > 0 && (

            <span

              className="
              absolute
              top-4
              left-4
              bg-red-600
              text-white
              px-3
              py-1
              rounded-full
              text-sm
              font-semibold
              "

            >

              {tour.discount}% OFF

            </span>

          )
        }


      </div>






      <div className="p-6">





        <div

          className="
          flex
          justify-between
          "

        >



          <span

            className="
            text-sm
            text-gray-500
            "

          >

            {tour.country || tour.destination?.name}

          </span>





          <span

            className="
            text-yellow-600
            "

          >

            ⭐ {rating || 0}

          </span>



        </div>






        <h2

          className="
          text-xl
          font-bold
          mt-3
          "

        >

          {tourTitle}

        </h2>






        <p

          className="
          text-gray-600
          mt-2
          line-clamp-3
          "

        >

          {tour.description ||
          "Explore unforgettable destinations with our guided travel experience."}

        </p>







        <div

          className="
          mt-5
          flex
          justify-between
          items-center
          "

        >






          <div>



            {
              tour.discount > 0 && (

                <p

                  className="
                  text-gray-400
                  line-through
                  "

                >

                  KES {price.toLocaleString("en-US")}

                </p>

              )
            }





            <p

              className="
              text-2xl
              font-bold
              text-green-700
              "

            >

              KES {discountedPrice.toLocaleString("en-US")}

            </p>



          </div>







          <Link

            to={`/tours/${tour.slug || tour._id}`}

            className="
            bg-yellow-600
            text-white
            px-5
            py-2
            rounded-lg
            hover:bg-yellow-700
            transition
            "

          >

            View Trip

          </Link>





        </div>





      </div>





    </div>

  );


}