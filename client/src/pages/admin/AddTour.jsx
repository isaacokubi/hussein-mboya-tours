import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import { createTour } from "../../api/adminTourApi";

import { getDestinations } from "../../api/adminDestinationApi";



export default function AddTour() {


  const navigate = useNavigate();



  const {
    data: destinationsData,
    isLoading: destinationsLoading,
  } = useQuery({

    queryKey:["destinations"],

    queryFn:getDestinations,

  });



  const destinations =
    Array.isArray(destinationsData)
      ? destinationsData
      : destinationsData?.destinations || [];





  const [form,setForm] = useState({

    title:"",

    description:"",

    destination:"",

    country:"Kenya",

    date:"",

    duration:"",

    price:"",

    category:"Safari",

    featured:false,

  });



  const [images,setImages] = useState([]);





  const handleChange = (e)=>{


    const {
      name,
      value,
      type,
      checked
    } = e.target;



    setForm({

      ...form,

      [name]:
        type === "checkbox"
          ? checked
          : value

    });


  };






  const submit = async(e)=>{


    e.preventDefault();



    const data = new FormData();



    Object.entries(form)
      .forEach(([key,value])=>{

        data.append(
          key,
          value
        );

      });



    images.forEach((image)=>{

      data.append(
        "images",
        image
      );

    });



    await createTour(data);



    navigate(
      "/admin/tours"
    );


  };






  return (

    <form
      onSubmit={submit}
      className="
      max-w-xl
      space-y-5
      "
    >



      <input

        name="title"

        placeholder="Tour title"

        className="input"

        value={form.title}

        onChange={handleChange}

      />




      <textarea

        name="description"

        placeholder="Description"

        className="input"

        value={form.description}

        onChange={handleChange}

      />





      <select

        name="destination"

        className="input"

        value={form.destination}

        onChange={handleChange}

        required

      >

        <option value="">

          Select Destination

        </option>


        {destinationsLoading && (

          <option>

            Loading destinations...

          </option>

        )}



        {destinations.map((destination)=>(

          <option

            key={destination._id}

            value={destination._id}

          >

            {destination.name}

          </option>

        ))}


      </select>






      <input

        name="country"

        placeholder="Country"

        className="input"

        value={form.country}

        onChange={handleChange}

        required

      />






      <input

        type="date"

        name="date"

        className="input"

        value={form.date}

        onChange={handleChange}

        required

      />






      <input

        name="duration"

        placeholder="Duration in days"

        className="input"

        value={form.duration}

        onChange={handleChange}

      />






      <input

        name="price"

        placeholder="Price"

        className="input"

        value={form.price}

        onChange={handleChange}

      />






      <select

        name="category"

        className="input"

        value={form.category}

        onChange={handleChange}

      >

        <option value="Safari">

          Safari

        </option>


        <option value="Beach">

          Beach

        </option>


        <option value="Mountain">

          Mountain

        </option>


        <option value="Culture">

          Culture

        </option>


      </select>






      <label className="flex gap-2">


        <input

          type="checkbox"

          name="featured"

          checked={form.featured}

          onChange={handleChange}

        />


        Featured Tour


      </label>






      <input

        type="file"

        multiple

        onChange={(e)=>

          setImages(
            [...e.target.files]
          )

        }

      />







      <button

        className="
        bg-green-600
        text-white
        px-8
        py-3
        rounded
        "

      >

        Save Tour

      </button>




    </form>

  );

}