import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  Plus,
  RefreshCw,
  Route,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { createCalendarReminder, deleteCalendarReminder, getCalendarReminders, getManagerTours } from "../../api/tourManagerApi";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const normalizeResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.tours)) return response.tours;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.tours)) return response.data.tours;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.results)) return response.results;
  return [];
};

const loadAllTenantTours = async () => {
  const firstPage = await getManagerTours({ page: 1, limit: 50 });
  const firstTours = normalizeResponse(firstPage);
  const pageCount = Math.max(
    1,
    Number(firstPage?.pagination?.pages) ||
      Math.ceil(Number(firstPage?.total || firstPage?.pagination?.total || firstTours.length) / 50)
  );
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
      getManagerTours({ page: index + 2, limit: 50 })
    )
  );
  const allTours = [firstPage, ...remainingPages].flatMap(normalizeResponse);
  return Array.from(
    new Map(allTours.filter(Boolean).map((tour, index) => [
      String(tour?._id || tour?.id || tour?.slug || `tour-${index}`),
      tour,
    ])).values()
  );
};

const tourId = (tour, index) => String(tour?._id || tour?.id || tour?.slug || `tour-${index}`);

const tourTitle = (tour) =>
  tour?.title || tour?.name || tour?.tourName || tour?.destination?.name || "Untitled tour";

const parseDate = (value) => {
  if (!value) return null;
  // Treat YYYY-MM-DD as a local calendar date instead of UTC midnight, which
  // can shift the displayed day in time zones west of UTC.
  const dateOnlyMatch = typeof value === "string" && value.match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);
  const date = dateOnlyMatch
    ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startDateOf = (tour) =>
  parseDate(tour?.startDate || tour?.date || tour?.departureDate || tour?.travelDate || tour?.tourDate);

const durationDaysOf = (tour) => {
  const raw = tour?.durationDetails?.days ?? tour?.durationDays ?? tour?.duration ?? 1;
  const match = String(raw).match(/\\d+/);
  const days = Number(match?.[0] || 1);
  return Number.isFinite(days) && days >= 1 ? Math.min(days, 365) : 1;
};

const endDateOf = (tour) => {
  const start = startDateOf(tour);
  if (!start) return null;
  const explicitEnd = parseDate(tour?.endDate || tour?.returnDate);
  if (explicitEnd && explicitEnd >= start) return explicitEnd;

  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  end.setDate(end.getDate() + durationDaysOf(tour) - 1);
  return end;
};

const dateOnly = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const scheduledDateKeys = (tour) => {
  const keys = new Set();
  const start = startDateOf(tour);
  const end = endDateOf(tour);

  // Mark every day of a multi-day tour, including both departure and return.
  if (start && end) {
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const finalDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    for (; cursor <= finalDay; cursor.setDate(cursor.getDate() + 1)) {
      keys.add(dateOnly(cursor));
    }
  }

  // Some tours are sold on specific departure dates in the availability list.
  // Include those dates too, even when the tour has no single startDate.
  const availability = [
    ...(Array.isArray(tour?.availability) ? tour.availability : []),
    ...(Array.isArray(tour?.availableDates) ? tour.availableDates : []),
    ...(Array.isArray(tour?.travelDates) ? tour.travelDates : []),
  ];
  for (const item of availability) {
    const date = parseDate(typeof item === "object" ? item?.date || item?.startDate || item?.departureDate : item);
    if (date) keys.add(dateOnly(date));
  }

  return keys;
};

const statusOf = (tour) => String(tour?.status || "scheduled").toLowerCase().replace(/[_-]/g, " ");

const statusClasses = (status) => {
  if (status.includes("completed")) return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status.includes("cancel")) return "bg-rose-50 text-rose-700 ring-rose-200";
  if (status.includes("ongoing") || status.includes("active")) return "bg-blue-50 text-blue-700 ring-blue-200";
  return "bg-indigo-50 text-indigo-700 ring-indigo-200";
};

export default function TourManagerCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [savingReminder, setSavingReminder] = useState(false);
  const [deletingReminderId, setDeletingReminderId] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [title, setTitle] = useState("");

  const toursQuery = useQuery({
    queryKey: ["tour-manager-calendar-tours"],
    queryFn: loadAllTenantTours,
    staleTime: 30_000,
    retry: 1,
  });

  const tours = useMemo(() => normalizeResponse(toursQuery.data), [toursQuery.data]);
  const remindersQuery = useQuery({
    queryKey: ["tour-manager-calendar-reminders"],
    queryFn: () => getCalendarReminders(),
    staleTime: 15_000,
    retry: 1,
  });
  const reminders = useMemo(() => normalizeResponse(remindersQuery.data), [remindersQuery.data]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const todayKey = dateOnly(new Date());

  const days = useMemo(
    () => [
      ...Array.from({ length: firstDay }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ],
    [firstDay, daysInMonth]
  );

  const dateKey = (day) => (day ? dateOnly(new Date(year, month, day)) : "");

  const eventsFor = (day) => {
    const keyDate = dateKey(day);
    if (!keyDate) return [];

    const tourEvents = tours
      .filter((tour) => scheduledDateKeys(tour).has(keyDate))
      .map((tour, index) => ({
        kind: "tour",
        id: tourId(tour, index),
        title: tourTitle(tour),
        status: statusOf(tour),
        tour,
      }));

    const reminderEvents = reminders
      .filter((reminder) => reminder?.date === keyDate)
      .map((reminder) => ({ kind: "reminder", ...reminder, id: String(reminder?._id || reminder?.id || "") }));

    return [...tourEvents, ...reminderEvents];
  };

  const selectedDate = selectedDay ? new Date(year, month, selectedDay) : null;
  const selectedEvents = selectedDay ? eventsFor(selectedDay) : [];
  const scheduledTourCount = selectedEvents.filter((event) => event.kind === "tour").length;
  const reminderCount = selectedEvents.filter((event) => event.kind === "reminder").length;

  const monthTourCount = useMemo(
    () => new Set(
      days.flatMap((day) => eventsFor(day).filter((event) => event.kind === "tour").map((event) => event.id))
    ).size,
    [days, reminders, tours, year, month]
  );

  const changeMonth = (offset) => {
    setCurrentDate(new Date(year, month + offset, 1));
    setSelectedDay(null);
  };

  const addReminder = async () => {
    if (!selectedDay || !title.trim() || savingReminder) return;
    const item = { date: dateKey(selectedDay), title: title.trim() };
    const duplicate = reminders.some(
      (reminder) => reminder.date === item.date && reminder.title?.trim().toLowerCase() === item.title.toLowerCase()
    );
    if (duplicate) {
      toast.info("That reminder already exists on this date.");
      return;
    }

    setSavingReminder(true);
    try {
      await createCalendarReminder(item);
      await remindersQuery.refetch();
      setTitle("");
      toast.success("Reminder saved to your team calendar.");
    } catch (error) {
      const message = error?.response?.data?.message || "Could not save the reminder. Please try again.";
      toast.error(message);
    } finally {
      setSavingReminder(false);
    }
  };

  const removeReminder = async (id) => {
    if (!id || deletingReminderId) return;
    setDeletingReminderId(id);
    try {
      await deleteCalendarReminder(id);
      await remindersQuery.refetch();
      toast.success("Reminder removed.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not remove the reminder. Please try again.");
    } finally {
      setDeletingReminderId("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-xl sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
                <CalendarDays size={14} /> Operations planning
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Tour Manager Calendar</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                View multi-day tours, identify operational load by date, and share saved reminders across your tenant team.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tours this month</div>
                <div className="mt-1 text-xl font-black">{toursQuery.isLoading || toursQuery.isError ? "—" : monthTourCount}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCurrentDate(new Date());
                  setSelectedDay(new Date().getDate());
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-400"
              >
                <CalendarDays size={17} /> Today
              </button>
            </div>
          </div>
        </header>

        {toursQuery.isError && (
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 shrink-0 text-rose-600" size={20} />
              <div>
                <p className="font-bold">Tour schedule unavailable</p>
                <p className="mt-1 text-sm text-rose-800">
                  The tours service returned an error, so the calendar is not presenting an empty month as if no tours exist.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toursQuery.refetch()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        )}

        {toursQuery.isLoading && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm font-semibold text-indigo-800">
            <Loader2 className="animate-spin" size={18} /> Loading the tenant tour schedule…
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">Planning view</p>
                <h2 className="mt-1 text-xl font-black text-slate-900">
                  {currentDate.toLocaleString("default", { month: "long" })} {year}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month" className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                  <ChevronLeft size={18} />
                </button>
                <button type="button" onClick={() => changeMonth(1)} aria-label="Next month" className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
              {WEEKDAYS.map((day) => (
                <div key={day} className="p-2 text-center text-[11px] font-black uppercase tracking-wider text-slate-500 sm:p-3">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {days.map((day, index) => {
                const events = eventsFor(day);
                const currentKey = dateKey(day);
                const isToday = currentKey === todayKey;
                const selected = day === selectedDay;

                return (
                  <button
                    type="button"
                    key={`${year}-${month}-${index}`}
                    onClick={() => day && setSelectedDay(day)}
                    disabled={!day}
                    className={`min-h-28 border-b border-r border-slate-100 p-1.5 text-left align-top transition sm:min-h-36 sm:p-2 ${
                      !day ? "cursor-default bg-slate-50/60" : selected ? "bg-indigo-50/80 ring-2 ring-inset ring-indigo-400" : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    {day && (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black sm:h-8 sm:w-8 sm:text-sm ${isToday ? "bg-emerald-600 text-white shadow-sm" : selected ? "bg-indigo-600 text-white" : "text-slate-700"}`}>
                            {day}
                          </span>
                          {events.length > 0 && (
                            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                              {events.length}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 space-y-1">
                          {events.slice(0, 3).map((event) => (
                            <div
                              key={`${event.kind}-${event.id}`}
                              className={`truncate rounded-lg px-2 py-1.5 text-[10px] font-bold ring-1 sm:text-[11px] ${
                                event.kind === "tour" ? `${statusClasses(event.status)} ring-inset` : "bg-amber-50 text-amber-800 ring-amber-200"
                              }`}
                            >
                              {event.kind === "tour" ? "Tour · " : "Reminder · "}{event.title}
                            </div>
                          ))}
                          {events.length > 3 && <div className="px-1 text-[10px] font-bold text-slate-400">+{events.length - 3} more</div>}
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Scheduled / upcoming</span>
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Active</span>
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Completed</span>
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Reminder</span>
            </div>
          </section>

          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Daily operations</p>
                <h2 className="mt-1 text-xl font-black text-slate-900">Day details</h2>
              </div>
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-700"><CalendarDays size={19} /></div>
            </div>

            {!selectedDay ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <CalendarDays className="mx-auto text-slate-400" size={28} />
                <p className="mt-3 font-bold text-slate-700">Select a date</p>
                <p className="mt-1 text-sm leading-5 text-slate-500">Choose a calendar day to inspect tours and manage operational reminders.</p>
              </div>
            ) : (
              <>
                <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Selected date</p>
                  <p className="mt-1 text-lg font-black">
                    {selectedDate.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-white/10 p-2.5"><div className="text-[10px] font-bold uppercase text-slate-400">Tours</div><div className="mt-1 text-lg font-black">{toursQuery.isError ? "—" : scheduledTourCount}</div></div>
                    <div className="rounded-xl bg-white/10 p-2.5"><div className="text-[10px] font-bold uppercase text-slate-400">Reminders</div><div className="mt-1 text-lg font-black">{reminderCount}</div></div>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {selectedEvents.map((event) => (
                    <div key={`${event.kind}-${event.id}`} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 rounded-xl p-2 ${event.kind === "tour" ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700"}`}>
                          {event.kind === "tour" ? <Route size={16} /> : <Bell size={16} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{event.kind === "tour" ? "Scheduled tour" : "Reminder"}</span>
                            {event.kind === "tour" && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ring-1 ${statusClasses(event.status)}`}>{event.status}</span>}
                          </div>
                          <p className="mt-1 font-bold text-slate-800">{event.title}</p>
                          {event.kind === "tour" && startDateOf(event.tour) && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock3 size={13} /> Starts {startDateOf(event.tour).toLocaleDateString()}</p>
                          )}
                          {event.kind === "reminder" && (
                            <button type="button" onClick={() => removeReminder(event.id)} disabled={deletingReminderId === event.id} className="mt-2 text-xs font-bold text-rose-600 transition hover:text-rose-700 disabled:opacity-50">{deletingReminderId === event.id ? "Removing…" : "Remove reminder"}</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {selectedEvents.length === 0 && !toursQuery.isError && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                      <CheckCircle2 className="mx-auto text-emerald-500" size={25} />
                      <p className="mt-2 font-bold text-slate-700">Nothing scheduled</p>
                      <p className="mt-1 text-xs text-slate-500">This date has no loaded tours or reminders.</p>
                    </div>
                  )}

                  {toursQuery.isError && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                      <div className="flex gap-2"><AlertTriangle className="mt-0.5 shrink-0" size={17} /><span>Tour events are hidden because the schedule request failed.</span></div>
                    </div>
                  )}
                </div>

                <div className="mt-5 border-t border-slate-200 pt-5">
                  <div className="flex items-center gap-2"><Bell className="text-amber-600" size={17} /><label htmlFor="tour-manager-reminder" className="text-sm font-black text-slate-800">Add reminder</label></div>
                  <div className="mt-2 flex gap-2">
                    <input
                      id="tour-manager-reminder"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      onKeyDown={(event) => event.key === "Enter" && addReminder()}
                      placeholder="e.g. Confirm driver pickup"
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    />
                    <button type="button" onClick={addReminder} disabled={!title.trim() || savingReminder || remindersQuery.isLoading} className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3 text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40" title="Add reminder">
                      {savingReminder ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    </button>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-xs text-slate-500"><Bell size={12} /> Reminders are stored securely on the server and shared with authorized managers in this tenant.</p>
                  {remindersQuery.isLoading && <p className="mt-2 text-xs text-slate-500">Loading saved reminders…</p>}
                  {remindersQuery.isError && <p className="mt-2 text-xs font-semibold text-rose-600">Saved reminders could not be loaded. Please retry or refresh.</p>}
                  {remindersQuery.isSuccess && reminders.length === 0 && <p className="mt-2 text-xs text-slate-500">No saved reminders yet.</p>}
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
