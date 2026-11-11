/**
 * Purpose: use Vehicles reusable React hook. Main declarations: useVehicles.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/hooks/useVehicles.js

// Load @tanstack/react-query so this module can use its exported dependencies.
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

// Load ../api/vehicleApi so this module can use its exported dependencies.
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../api/vehicleApi";


// Define useVehicles; its parameters and body implement this operation.
export default function useVehicles() {

  // Declare queryClient for use by the surrounding module or function.
  const queryClient = useQueryClient();


  /*
  |--------------------------------------------------------------------------
  | GET VEHICLES
  |--------------------------------------------------------------------------
  */

  // Declare vehiclesQuery for use by the surrounding module or function.
  const vehiclesQuery = useQuery({
    queryKey: ["vehicles"],

    queryFn: async () => {
      // Declare response for use by the surrounding module or function.
      const response = await getVehicles();

      // Return the expression shown below to the caller.
      return response?.data || response?.vehicles || [];
    },
  });



  /*
  |--------------------------------------------------------------------------
  | CREATE VEHICLE
  |--------------------------------------------------------------------------
  */

  // Declare createMutation for use by the surrounding module or function.
  const createMutation = useMutation({

    mutationFn: createVehicle,

    onSuccess: () => {
      // Perform the side effect or state update expressed on the following line.
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
      });
    },

  });



  /*
  |--------------------------------------------------------------------------
  | UPDATE VEHICLE
  |--------------------------------------------------------------------------
  */

  // Declare updateMutation for use by the surrounding module or function.
  const updateMutation = useMutation({

    mutationFn: ({ id, data }) =>
      updateVehicle(id, data),

    onSuccess: () => {
      // Perform the side effect or state update expressed on the following line.
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
      });
    },

  });



  /*
  |--------------------------------------------------------------------------
  | DELETE VEHICLE
  |--------------------------------------------------------------------------
  */

  // Declare deleteMutation for use by the surrounding module or function.
  const deleteMutation = useMutation({

    mutationFn: deleteVehicle,

    onSuccess: () => {
      // Perform the side effect or state update expressed on the following line.
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
      });
    },

  });



  // Return the object assembled below to the caller.
  return {

    // data
    vehicles: vehiclesQuery.data || [],


    // states
    isLoading: vehiclesQuery.isLoading,
    isError: vehiclesQuery.isError,
    refetch: vehiclesQuery.refetch,


    // actions
    createVehicle: createMutation.mutate,
    updateVehicle: updateMutation.mutate,
    deleteVehicle: deleteMutation.mutate,


    // mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

  };
}
