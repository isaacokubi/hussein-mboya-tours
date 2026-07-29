import useAgentPackages from "../../hooks/useAgentPackages";

export default function AgentPackages() {
  const { data = [], isLoading, error } = useAgentPackages();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-lg font-medium text-gray-600">
          Loading tours...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="
          bg-red-50
          border
          border-red-200
          text-red-700
          p-6
          rounded-xl
        "
      >
        Failed to load tour packages.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1
        className="
          text-2xl
          font-bold
          mb-6
        "
      >
        Tour Packages
      </h1>

      {data.length === 0 ? (
        <div
          className="
            bg-white
            rounded-xl
            shadow
            p-8
            text-center
          "
        >
          <p className="text-gray-500">
            No tour packages available.
          </p>
        </div>
      ) : (
        <div
          className="
            grid
            md:grid-cols-2
            lg:grid-cols-3
            gap-6
          "
        >
          {data.map((pkg) => (
            <div
              key={pkg._id}
              className="
                bg-white
                rounded-xl
                shadow
                overflow-hidden
                hover:shadow-lg
                transition-shadow
              "
            >
              <img
                src={
                  pkg.coverImage ||
                  pkg.images?.[0]?.url ||
                  "https://via.placeholder.com/600x400"
                }
                alt={pkg.title}
                className="
                  h-48
                  w-full
                  object-cover
                "
              />

              <div className="p-5">
                <h2
                  className="
                    font-bold
                    text-lg
                    mb-2
                  "
                >
                  {pkg.title}
                </h2>

                <p className="text-gray-600">
                  📍{" "}
                  {typeof pkg.destination === "object"
                    ? pkg.destination?.name
                    : pkg.destination}
                </p>

                {pkg.description && (
                  <p
                    className="
                      text-sm
                      text-gray-500
                      mt-3
                      line-clamp-3
                    "
                  >
                    {pkg.description}
                  </p>
                )}

                <p
                  className="
                    font-semibold
                    mt-4
                    text-green-700
                  "
                >
                  Agent Price: KES{" "}
                  {pkg.agentPrice?.toLocaleString() || 0}
                </p>

                <button
                  className="
                    mt-4
                    w-full
                    bg-green-700
                    hover:bg-green-800
                    text-white
                    px-4
                    py-2
                    rounded-lg
                    transition
                  "
                >
                  Create Booking
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}