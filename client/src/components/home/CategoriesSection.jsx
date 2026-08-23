import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FaBinoculars,
  FaUmbrellaBeach,
  FaMountain,
  FaPeopleGroup,
  FaMap,
} from "react-icons/fa6";

import { getCategories } from "../../api/categoryApi";


const iconMap = {
  Binoculars: FaBinoculars,
  Beach: FaUmbrellaBeach,
  Mountain: FaMountain,
  People: FaPeopleGroup,
  Map: FaMap,
};


export default function CategoriesSection() {

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);


  const loadCategories = async () => {

    try {

      const data = await getCategories();




      // Supports:
      // []
      // { categories: [] }

      setCategories(
        Array.isArray(data)
          ? data
          : data.categories || []
      );


    } catch (error) {

      console.error(
        "Failed to load categories:",
        error
      );

      setCategories([]);

    } finally {

      setLoading(false);

    }

  };

useEffect(() => {
    void Promise.resolve().then(() => loadCategories());
  }, []);





  if (loading) {

    return (
      <section className="py-20 text-center">
        Loading experiences...
      </section>
    );

  }


  return (

    <section className="py-20 bg-gray-100">

      <div className="container mx-auto px-6">


        <h2
          className="
          text-4xl
          font-bold
          text-center
          mb-12
          "
        >
          Explore Travel Experiences
        </h2>



        {
          categories.length === 0 ? (

            <p
              className="
              text-center
              text-gray-600
              "
            >
              No experiences available.
            </p>


          ) : (


            <div
              className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              gap-6
              "
            >


              {
                (Array.isArray(categories) ? categories : []).map((category) => {


                  const Icon =
                    iconMap[category.icon] || FaMap;


                  return (


                    <div
                      key={category._id}
                      className="
                      bg-white
                      rounded-xl
                      shadow-lg
                      p-8
                      text-center
                      hover:-translate-y-2
                      transition
                      duration-300
                      "
                    >


                      <div
                        className="
                        text-green-600
                        text-4xl
                        flex
                        justify-center
                        mb-5
                        "
                      >

                        <Icon />

                      </div>



                      <h3
                        className="
                        font-bold
                        text-xl
                        "
                      >
                        {category.name}
                      </h3>



                      <p
                        className="
                        mt-3
                        text-gray-600
                        "
                      >
                        {category.description}
                      </p>



                      <Link
                        to={`/tours/category/${category.filter}`}
                        className="
                        inline-block
                        mt-5
                        text-yellow-700
                        font-semibold
                        hover:text-green-700
                        "
                      >
                        View Tours →
                      </Link>


                    </div>


                  );

                })
              }


            </div>


          )
        }


      </div>


    </section>

  );

}
