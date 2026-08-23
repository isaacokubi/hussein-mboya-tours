// client/src/components/TourFilters.jsx

export default function TourFilters({
  filters,
  setFilters
}) {


  const updateFilter = (
    key,
    value
  ) => {

    setFilters({

      ...filters,

      [key]: value

    });

  };



  const clearFilters = () => {

    setFilters({

      country: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      duration: ""

    });

  };



  return (

    <div

      className="
      bg-white
      shadow-md
      rounded-xl
      p-5
      grid
      md:grid-cols-6
      gap-4
      "

    >





      <input

        placeholder="Search country"

        className="
        border
        p-3
        rounded
        "

        value={
          filters.country || ""
        }

        onChange={
          (e)=>
          updateFilter(
            "country",
            e.target.value
          )
        }

      />







      <select

        className="
        border
        p-3
        rounded
        "

        value={
          filters.category || ""
        }

        onChange={
          (e)=>
          updateFilter(
            "category",
            e.target.value
          )
        }

      >


        <option value="">
          All Categories
        </option>


        <option value="Safari">
          Safari
        </option>


        <option value="Beach">
          Beach
        </option>


        <option value="Adventure">
          Adventure
        </option>


        <option value="Honeymoon">
          Honeymoon
        </option>


      </select>







      <input

        type="number"

        placeholder="Min price"

        className="
        border
        p-3
        rounded
        "

        value={
          filters.minPrice || ""
        }

        onChange={
          (e)=>
          updateFilter(
            "minPrice",
            e.target.value
          )
        }

      />







      <input

        type="number"

        placeholder="Max price"

        className="
        border
        p-3
        rounded
        "

        value={
          filters.maxPrice || ""
        }

        onChange={
          (e)=>
          updateFilter(
            "maxPrice",
            e.target.value
          )
        }

      />







      <input

        type="number"

        placeholder="Duration days"

        className="
        border
        p-3
        rounded
        "

        value={
          filters.duration || ""
        }

        onChange={
          (e)=>
          updateFilter(
            "duration",
            e.target.value
          )
        }

      />







      <button

        onClick={clearFilters}

        className="
        bg-gray-800
        text-white
        rounded
        px-4
        hover:bg-gray-900
        "

      >

        Clear

      </button>





    </div>

  );

}
