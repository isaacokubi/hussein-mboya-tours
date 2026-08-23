export default function PopularTours({ tours = [] }) {
  const list = Array.isArray(tours) ? tours : [];

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Top Performing Tours</h2>
        <p className="mt-1 text-sm text-gray-500">Ranked by booking activity.</p>
      </div>
      {list.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">No tour booking data available yet.</div>
      ) : (
        <div className="space-y-3">
          {list.map((tour, index) => (
            <div key={tour?._id || index} className="flex items-center justify-between gap-4 rounded-lg border p-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold">{index + 1}</span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{tour?.title || "Untitled tour"}</p>
                  <p className="text-xs text-slate-500">{Number(tour?.confirmedPaidBookings || 0).toLocaleString()} paid bookings</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{Number(tour?.totalBookings || 0).toLocaleString()}</p>
                <p className="text-xs text-slate-500">bookings</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
