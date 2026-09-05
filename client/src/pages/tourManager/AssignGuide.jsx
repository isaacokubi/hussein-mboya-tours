// client/src/pages/tourManager/AssignGuide.jsx

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getGuides, assignGuide, getTour } from "../../api/tourApi";

const normalizeRole = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

const isActualGuide = (item) => {
  // Staff responses can expose the role in several shapes.
  // Only users explicitly identified as guides may appear here.
  const roleCandidates = [
    item?.position,
    item?.role,
    item?.role?.name,
    item?.role?.slug,
    item?.user?.role,
    item?.user?.role?.name,
    item?.user?.role?.slug,
    item?.designation,
    item?.staffRole,
  ]
    .map(normalizeRole)
    .filter(Boolean);

  // Never allow administrative accounts into a guide assignment list.
  if (roleCandidates.some((role) => role === "admin" || role === "superadmin" || role === "superadministrator")) {
    return false;
  }

  return roleCandidates.some((role) => role === "guide" || role === "tourguide");
};

const AssignGuide = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [guide, setGuide] = useState("");

  const { data: guidesData } = useQuery({
    queryKey: ["guides"],
    queryFn: getGuides,
  });

  const { data: tourData, isLoading } = useQuery({
    queryKey: ["tour", id],
    queryFn: () => getTour(id),
    enabled: Boolean(id),
  });

  const tour = tourData?.tour || tourData?.data?.tour || tourData?.data || null;

  const guidesRaw =
    Array.isArray(guidesData?.data)
      ? guidesData.data
      : Array.isArray(guidesData)
        ? guidesData
        : Array.isArray(guidesData?.guides)
          ? guidesData.guides
          : [];

  const guides = guidesRaw.filter(isActualGuide);

  const { mutate: saveGuide, isPending } = useMutation({
    mutationFn: () => assignGuide(id, guide),
    onSuccess: () => {
      toast.success("Guide assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["tour", id] });
      queryClient.invalidateQueries({ queryKey: ["guides"] });
      queryClient.invalidateQueries({ queryKey: ["availableGuides"] });
      queryClient.invalidateQueries({ queryKey: ["assignment-guides"] });
      navigate("/tour-manager/tours");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || "Assignment failed");
    },
  });

  if (isLoading) {
    return <div className="p-6">Loading tour...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-xl rounded-xl bg-white p-8 shadow">
        <h1 className="mb-5 text-2xl font-bold">Assign Guide</h1>

        {tour && (
          <p className="mb-5 text-gray-600">
            Tour:
            <strong className="ml-2">{tour.title}</strong>
          </p>
        )}

        <select
          value={guide}
          onChange={(e) => setGuide(e.target.value)}
          className="w-full rounded-lg border p-3"
        >
          <option value="">Select Guide</option>
          {guides.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name || `${item.firstName || ""} ${item.lastName || ""}`.trim() || "Unnamed Guide"}
            </option>
          ))}
        </select>

        {guides.length === 0 && (
          <p className="mt-3 text-sm text-gray-500">No available guides found.</p>
        )}

        <button
          type="button"
          onClick={() => saveGuide()}
          disabled={!guide || isPending}
          className="mt-6 w-full rounded-lg bg-green-600 py-3 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isPending ? "Assigning..." : "Assign Guide"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/tour-manager/tours")}
          className="mt-3 w-full rounded-lg bg-gray-700 py-3 text-white hover:bg-gray-800"
        >
          Back to Tours
        </button>
      </div>
    </div>
  );
};

export default AssignGuide;
