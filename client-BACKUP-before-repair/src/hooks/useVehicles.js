// client/src/hooks/useVehicles.js

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../api/vehicleApi";


export default function useVehicles() {

  const queryClient = useQueryClient();


  /*
  |--------------------------------------------------------------------------
  | GET VEHICLES
  |--------------------------------------------------------------------------
  */

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles"],

    queryFn: async () => {
      const response = await getVehicles();

      return response?.data || response?.vehicles || [];
    },
  });



  /*
  |--------------------------------------------------------------------------
  | CREATE VEHICLE
  |--------------------------------------------------------------------------
  */

  const createMutation = useMutation({

    mutationFn: createVehicle,

    onSuccess: () => {
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

  const updateMutation = useMutation({

    mutationFn: ({ id, data }) =>
      updateVehicle(id, data),

    onSuccess: () => {
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

  const deleteMutation = useMutation({

    mutationFn: deleteVehicle,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
      });
    },

  });



  return {

    // data
    vehicles: vehiclesQuery.data || [],


    // states
    isLoading: vehiclesQuery.isLoading,
    isError: vehiclesQuery.isError,


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