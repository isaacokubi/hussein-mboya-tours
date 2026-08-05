
import React, {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import axios from "../../api/axios";


const EditDestination = () => {

  const {id} = useParams();

  const navigate = useNavigate();

  const queryClient = useQueryClient();


  const [form,setForm] = useState({
    name:"",
    country:"",
    city:"",
    description:"",
    featured:false
  });



  const {isLoading}=useQuery({

    queryKey:["destination",id],

    queryFn:async()=>{

      const res = await axios.get(
        `/destinations/${id}`
      );


      const d = res.data.destination;


      setForm({

        name:d.name || "",

        country:d.country || "",

        city:d.city || "",

        description:d.description || "",

        featured:d.featured || false

      });


      return d;

    }

  });



  const mutation = useMutation({

    mutationFn:(payload)=>

      axios.put(
        `/admin/destinations/${id}`,
        payload
      ),


    onSuccess:()=>{

      queryClient.invalidateQueries([
        "admin-destinations"
      ]);


      alert(
        "Destination updated successfully"
      );


      navigate(
        "/admin/destinations"
      );

    },


    onError:(error)=>{

      console.error(
        "UPDATE DESTINATION ERROR:",
        error
      );


      alert(
        error.response?.data?.message ||
        "Failed updating destination"
      );

    }


  });



  if(isLoading){

    return (
      <div className="p-6">
        Loading...
      </div>
    );

  }



  return (

    <div className="p-6">


      <h1 className="text-2xl font-bold mb-6">
        Edit Destination
      </h1>


      <div className="space-y-4">


        {
        [
          "name",
          "country",
          "city"
        ].map(field=>(

          <input

          key={field}

          className="
          border
          p-3
          w-full
          rounded
          "

          value={form[field]}

          placeholder={field}

          onChange={
            e=>
            setForm({
              ...form,
              [field]:e.target.value
            })
          }

          />

        ))
        }



        <textarea

        className="
        border
        p-3
        w-full
        rounded
        "

        rows="5"

        value={form.description}

        placeholder="Description"

        onChange={
          e=>
          setForm({
            ...form,
            description:e.target.value
          })
        }

        />



        <label>

        <input

        type="checkbox"

        checked={form.featured}

        onChange={
          e=>
          setForm({
            ...form,
            featured:e.target.checked
          })
        }

        />

        {" "}Featured

        </label>



        <button

        onClick={()=>
          mutation.mutate(form)
        }

        className="
        bg-green-600
        text-white
        px-6
        py-3
        rounded
        "

        >

        Save Changes

        </button>


      </div>


    </div>

  );

};


export default EditDestination;
