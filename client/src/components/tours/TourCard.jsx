import { Link } from "react-router-dom";


export default function TourCard({
  tour
}) {



  const discountedPrice =

    tour.discount

      ?

      tour.price -
      (
        tour.price *
        tour.discount /
        100
      )

      :

      tour.price;





  const tourImage =

    typeof tour.images?.[0] === "object"

      ?

      tour.images?.[0]?.url

      :

      tour.images?.[0]

      ||

      tour.image

      ||

      "/placeholder.jpg";





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





      <img

        src={tourImage}

        alt={tour.title || "Tour"}

        className="
        w-full
        h-64
        object-cover
        "

      />







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

            {tour.country}

          </span>





          <span

            className="
            text-yellow-600
            "

          >

            ⭐ {tour.rating || 0}

          </span>



        </div>







        <h2

          className="
          text-xl
          font-bold
          mt-3
          "

        >

          {tour.title}

        </h2>







        <p

          className="
          text-gray-600
          mt-2
          line-clamp-3
          "

        >

          {tour.description}

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





            <p

              className="
              text-gray-400
              line-through
              "

            >

              {
                tour.discount

                  ?

                  `KES ${tour.price}`

                  :

                  ""
              }

            </p>







            <p

              className="
              text-2xl
              font-bold
              text-green-700
              "

            >

              KES {discountedPrice?.toLocaleString("en-US")}

            </p>





          </div>







          <Link

            to={`/tours/${tour.slug}`}

            className="
            bg-yellow-600
            text-white
            px-5
            py-2
            rounded-lg
            "

          >

            View Trip

          </Link>





        </div>





      </div>





    </div>

  );


}