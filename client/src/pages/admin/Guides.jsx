import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getGuides } from "../../api/adminTourApi";

const Guides = () => {

  const {
    data: guides = [],
    isLoading,
    error
  } = useQuery({
    queryKey:["admin-guides"],
    queryFn:getGuides
  });


  if(isLoading){
    return <div>Loading guides...</div>;
  }


  if(error){
    return (
      <div>
        Failed loading guides.
      </div>
    );
  }


  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Tour Guides
      </h1>


      {guides.length === 0 ? (

        <p>
          No guides found.
        </p>

      ) : (

        <div className="grid gap-4">

          {guides.map((guide)=>(

            <div
              key={guide._id}
              className="border rounded p-4"
            >

              <h2 className="font-semibold">
                {guide.name ||
                 `${guide.firstName || ""} ${guide.lastName || ""}`
                }
              </h2>

              <p>
                Email: {guide.email || "-"}
              </p>

              <p>
                Phone: {guide.phone || "-"}
              </p>

            </div>

          ))}

        </div>

      )}

    </div>
  );
};


export default Guides;
