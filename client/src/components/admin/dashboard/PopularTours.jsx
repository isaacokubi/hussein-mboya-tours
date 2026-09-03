export default function PopularTours({ tours = [] }) {
  const list = Array.isArray(tours) ? tours : [];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Top Performing Tours</h2>
          <p className="mt-1 text-sm text-slate-500">Ranked by booking activity and paid bookings.</p>
        </div>
        {list.length > 0 && (
          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Top {list.length}
          </span>
        )}
      </div>
      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-gray-500">No tour booking data available yet.</div>
      ) : (
        <div className="space-y-3">
          {list.map((tour, index) => {
            const totalBookings = Number(tour?.totalBookings || 0);
            const paidBookings = Number(tour?.paidBookings ?? tour?.confirmedPaidBookings ?? 0);
            return (
              <div key={tour?._id || index} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-3.5 transition hover:border-slate-300 hover:bg-slate-50/60">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{tour?.title || "Untitled tour"}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {paidBookings.toLocaleString()} paid {paidBookings === 1 ? "booking" : "bookings"}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 rounded-lg bg-slate-50 px-3 py-2 text-right">
                  <p className="text-lg font-bold leading-none text-slate-900">{totalBookings.toLocaleString()}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{totalBookings === 1 ? "booking" : "bookings"}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
