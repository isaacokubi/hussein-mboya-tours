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



  const {data,isLoading}=useQuery({

    queryKey:["destination",id],

    queryFn:async()=>{

      const res=await axios.get(
        `/destinations/${id}`
      );

      const d=res.data.destination;

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



  const mutation=useMutation({

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


    onError:(err)=>{

      console.error(err);

      alert(
        err.response?.data?.message ||
        "Update failed"
      );

    }

  });



  if(isLoading)
    return <div className="p-6">
      Loading...
    </div>;



  return (

    <div className="p-6">


      <h1 className="text-2xl font-bold mb-6">
        Edit Destination
      </h1>



      <div className="space-y-4">


        <input
          className="border p-3 w-full"
          value={form.name}
          placeholder="Destination name"
          onChange={
            e=>setForm({
              ...form,
              name:e.target.value
            })
          }
        />



        <input
          className="border p-3 w-full"
          value={form.country}
          placeholder="Country"
          onChange={
            e=>setForm({
              ...form,
              country:e.target.value
            })
          }
        />



        <input
          className="border p-3 w-full"
          value={form.city}
          placeholder="City"
          onChange={
            e=>setForm({
              ...form,
              city:e.target.value
            })
          }
        />



        <textarea
          className="border p-3 w-full"
          rows="5"
          value={form.description}
          placeholder="Description"
          onChange={
            e=>setForm({
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
              e=>setForm({
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
