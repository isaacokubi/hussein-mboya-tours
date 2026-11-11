/**
 * Purpose: Destination Details page-level UI component. Main declarations: DestinationDetails.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useQuery } from "@tanstack/react-query";
// Load react-router-dom so this module can use its exported dependencies.
import { Link, useParams } from "react-router-dom";
// Load ../../api/adminDestinationApi so this module can use its exported dependencies.
import { getAdminDestinationById } from "../../api/adminDestinationApi";

// Define DestinationDetails; its parameters and body implement this operation.
export default function DestinationDetails() {
  // Declare { id } for use by the surrounding module or function.
  const { id } = useParams();
  // Declare { data, isLoading, isError, error } for use by the surrounding module or function.
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-destination", id],
    queryFn: () => getAdminDestinationById(id),
    enabled: Boolean(id),
  });

  // Check the condition (isLoading) and run the matching branch.
  if (isLoading) return <div className="p-6">Loading destination...</div>;
  // Check the condition (isError || !data) and run the matching branch.
  if (isError || !data) return <div className="p-6 text-red-600">{error?.response?.data?.message || "Destination not found."}</div>;

  // Declare images for use by the surrounding module or function.
  const images = Array.isArray(data.images) ? data.images : [];
  // Return the expression shown below to the caller.
  return (
    <div className="p-6">
      <div className="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-3xl font-bold">{data.name || "Destination"}</h1><p className="text-gray-500">{data.country || ""}</p></div>
          <Link to={`/admin/edit-destination/${id}`} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white">Edit Destination</Link>
        </div>
        {images.length > 0 && <div className="grid gap-4 md:grid-cols-3">{images.map((image,index)=>{ const src=typeof image === "string" ? image : image?.url; return src ? <img key={index} src={src.startsWith("http") ? src : `${import.meta.env.VITE_API_URL?.replace("/api","") || window.location.origin}${src}`} alt={data.name || "Destination"} className="h-48 w-full rounded-lg object-cover"/> : null; })}</div>}
        <p className="mt-6 whitespace-pre-wrap text-gray-700">{data.description || "No description available."}</p>
      </div>
    </div>
  );
}
