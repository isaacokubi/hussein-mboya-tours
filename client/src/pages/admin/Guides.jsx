/**
 * Purpose: Guides page-level UI component. Main declarations: Guides.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useQuery } from "@tanstack/react-query";
// Load ../../api/adminTourApi so this module can use its exported dependencies.
import { getGuides } from "../../api/adminTourApi";

// Declare Guides for use by the surrounding module or function.
const Guides = () => {

  // Declare { data: guides = [], isLoading, error } for use by the surrounding module or function.
  const {
    data: guides = [],
    isLoading,
    error
  } = useQuery({
    queryKey:["admin-guides"],
    queryFn:getGuides
  });


  // Check the condition (isLoading) and run the matching branch.
  if(isLoading){
    // Return the expression shown below to the caller.
    return <div>Loading guides...</div>;
  }


  // Check the condition (error) and run the matching branch.
  if(error){
    // Return the expression shown below to the caller.
    return (
      <div>
        Failed loading guides.
      </div>
    );
  }


  // Return the expression shown below to the caller.
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
