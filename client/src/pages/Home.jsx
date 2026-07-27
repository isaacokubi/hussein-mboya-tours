import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import SEO from "../components/seo/SEO";


export default function Home() {


  const destinations = [

    {
      name: "Maasai Mara",
      image: "/destinations/maasai-mara.jpg",
      description:
        "Experience the Great Migration and unforgettable wildlife encounters.",
    },


    {
      name: "Amboseli National Park",
      image: "/destinations/amboseli.jpg",
      description:
        "Enjoy breathtaking views of Mount Kilimanjaro and amazing wildlife.",
    },


    {
      name: "Diani Beach",
      image: "/destinations/diani.jpg",
      description:
        "Relax on Kenya's most beautiful white sandy beaches.",
    },

  ];





  const tours = [

    {
      title: "Luxury Maasai Mara Safari",
      price: "From $999",
      image: "/mara.jpeg",
    },


    {
      title: "Kenya Beach Holiday",
      price: "From $699",
      image: "/beach.jpg",
    },


    {
      title: "Ultimate Kenya Adventure",
      price: "From $1499",
      image: "/adventure.webp",
    },

  ];





  const features = [

    "Professional local guides",

    "Luxury accommodation",

    "Customized travel packages",

    "24/7 travel support",

  ];





  return (

    <div className="overflow-hidden">



      <SEO

        title="Hussein Mboya Tours | Luxury African Safaris"

        description="
        Experience luxury Kenya safaris,
        beach holidays,
        cultural tours
        and unforgettable African adventures.
        "

        image="/logo.png"

      />





      {/* HERO SECTION */}


      <section

        className="
        relative
        min-h-screen
        bg-cover
        bg-center
        flex
        items-center
        justify-center
        "

        style={{

          backgroundImage:
            "url('/hero1.jpeg')",

        }}

      >


        <div

          className="
          absolute
          inset-0
          bg-black/40
          "

        />




        <div

          className="
          relative
          z-10
          px-6
          "

        >



          <motion.div

            initial={{
              opacity:0,
              scale:0.9,
            }}

            animate={{
              opacity:1,
              scale:1,
            }}

            transition={{
              duration:0.8,
            }}


            className="
            max-w-md
            bg-white/20
            border
            border-white/30
            text-white
            p-6
            rounded-3xl
            backdrop-blur-xl
            shadow-2xl
            text-center
            "

          >



            <h1

              className="
              text-3xl
              md:text-5xl
              font-bold
              leading-tight
              "

            >

              Explore Africa With

              <br/>

              Hussein Mboya Tours

            </h1>





            <p

              className="
              mt-4
              text-lg
              "

            >

              Luxury Safaris,
              Beach Holidays &
              Authentic African Experiences

            </p>






            <div

              className="
              mt-6
              flex
              justify-center
              gap-4
              flex-wrap
              "

            >



              <Link

                to="/tours"

                className="
                bg-green-600
                px-6
                py-3
                rounded-full
                font-semibold
                hover:bg-green-700
                transition
                shadow-lg
                "

              >

                Explore Tours

              </Link>






              {/* FIXED ROUTE */}

              <Link

                to="/tours"

                className="
                bg-white
                text-black
                px-6
                py-3
                rounded-full
                font-semibold
                hover:bg-gray-100
                transition
                shadow-lg
                "

              >

                Book Adventure

              </Link>




            </div>




          </motion.div>




        </div>



      </section>





      {/* DESTINATIONS SECTION */}



      <section

        className="
        py-20
        container
        mx-auto
        px-6
        "

      >



        <h2

          className="
          text-4xl
          font-bold
          text-center
          mb-12
          "

        >

          Popular Destinations

        </h2>





        <div

          className="
          grid
          md:grid-cols-3
          gap-8
          "

        >



          {
            destinations.map(destination => (


              <motion.div

                key={destination.name}

                whileHover={{
                  y:-10
                }}

                className="
                bg-white
                rounded-xl
                overflow-hidden
                shadow-lg
                "

              >


                <img

                  src={destination.image}

                  alt={destination.name}

                  className="
                  h-64
                  w-full
                  object-cover
                  "

                />




                <div className="p-6">


                  <h3

                    className="
                    text-2xl
                    font-bold
                    "

                  >

                    {destination.name}

                  </h3>





                  <p

                    className="
                    mt-3
                    text-gray-600
                    "

                  >

                    {destination.description}

                  </p>






                  <Link

                    to="/tours"

                    className="
                    mt-5
                    inline-block
                    text-green-600
                    font-semibold
                    "

                  >

                    Explore Tours →

                  </Link>



                </div>



              </motion.div>



            ))
          }



        </div>




      </section>
            {/* FEATURED TOURS */}


      <section

        className="
        bg-gray-100
        py-20
        "

      >


        <div

          className="
          container
          mx-auto
          px-6
          "

        >



          <h2

            className="
            text-4xl
            font-bold
            text-center
            mb-12
            "

          >

            Featured Tours

          </h2>





          <div

            className="
            grid
            md:grid-cols-3
            gap-8
            "

          >



            {
              tours.map((tour)=>(



                <motion.div

                  key={tour.title}

                  whileHover={{
                    scale:1.03
                  }}

                  className="
                  bg-white
                  rounded-xl
                  shadow-lg
                  overflow-hidden
                  "

                >



                  <img

                    src={tour.image}

                    alt={tour.title}

                    className="
                    h-60
                    w-full
                    object-cover
                    "

                  />





                  <div className="p-6">



                    <h3

                      className="
                      text-xl
                      font-bold
                      "

                    >

                      {tour.title}

                    </h3>





                    <p

                      className="
                      mt-3
                      text-green-700
                      font-bold
                      "

                    >

                      {tour.price}

                    </p>






                    {/* FIXED ROUTE */}

                    <Link

                      to="/tours"

                      className="
                      block
                      mt-5
                      text-center
                      bg-green-600
                      text-white
                      py-3
                      rounded-lg
                      hover:bg-green-700
                      transition
                      "

                    >

                      View Tour Packages

                    </Link>



                  </div>




                </motion.div>


              ))
            }




          </div>




        </div>



      </section>









      {/* WHY CHOOSE US */}



      <section

        className="
        py-20
        container
        mx-auto
        px-6
        "

      >



        <h2

          className="
          text-4xl
          font-bold
          text-center
          mb-12
          "

        >

          Why Choose Hussein Mboya Tours?

        </h2>






        <div

          className="
          grid
          md:grid-cols-4
          gap-6
          "

        >



          {
            features.map((feature)=>(



              <motion.div

                key={feature}

                whileHover={{
                  y:-8
                }}

                className="
                bg-white
                rounded-xl
                shadow
                p-6
                text-center
                "

              >


                <div

                  className="
                  text-3xl
                  mb-3
                  "

                >

                  ✓

                </div>



                <h3

                  className="
                  font-semibold
                  "

                >

                  {feature}

                </h3>



              </motion.div>



            ))
          }





        </div>





      </section>









      {/* CALL TO ACTION */}



      <section

        className="
        bg-green-700
        text-white
        py-20
        text-center
        "

      >



        <h2

          className="
          text-4xl
          font-bold
          "

        >

          Ready For Your African Adventure?

        </h2>





        <p

          className="
          mt-5
          text-xl
          "

        >

          Let Hussein Mboya Tours create a memorable
          journey designed around you.

        </p>







        <Link

          to="/tours"

          className="
          inline-block
          mt-8
          bg-white
          text-black
          px-10
          py-4
          rounded-full
          font-semibold
          hover:bg-gray-100
          transition
          "

        >

          Start Booking

        </Link>





      </section>





    </div>

  );

}