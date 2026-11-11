/**
 * Purpose: Tour Manager Calendar page-level UI component. Main declarations: normalizeResponse, loadAllTenantTours, tourId, tourTitle, parseDate.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useMemo, useState } from "react";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useQuery } from "@tanstack/react-query";
// Load lucide-react so this module can use its exported dependencies.
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
// Load react-toastify so this module can use its exported dependencies.
import { toast } from "react-toastify";
// Load ../../api/tourManagerApi so this module can use its exported dependencies.
import { createCalendarReminder, deleteCalendarReminder, getCalendarReminders, getManagerTours } from "../../api/tourManagerApi";

// Declare WEEKDAYS for use by the surrounding module or function.
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Declare normalizeResponse for use by the surrounding module or function.
const normalizeResponse = (response) => {
  // Check the condition (Array.isArray(response)) and run the matching branch.
  if (Array.isArray(response)) return response;
  // Check the condition (Array.isArray(response?.tours)) and run the matching branch.
  if (Array.isArray(response?.tours)) return response.tours;
  // Check the condition (Array.isArray(response?.data)) and run the matching branch.
  if (Array.isArray(response?.data)) return response.data;
  // Check the condition (Array.isArray(response?.data?.tours)) and run the matching branch.
  if (Array.isArray(response?.data?.tours)) return response.data.tours;
  // Check the condition (Array.isArray(response?.items)) and run the matching branch.
  if (Array.isArray(response?.items)) return response.items;
  // Check the condition (Array.isArray(response?.results)) and run the matching branch.
  if (Array.isArray(response?.results)) return response.results;
  // Return the collection assembled below to the caller.
  return [];
};

// Declare loadAllTenantTours for use by the surrounding module or function.
const loadAllTenantTours = async () => {
  // Declare firstPage for use by the surrounding module or function.
  const firstPage = await getManagerTours({ page: 1, limit: 50 });
  // Declare firstTours for use by the surrounding module or function.
  const firstTours = normalizeResponse(firstPage);
  // Declare pageCount for use by the surrounding module or function.
  const pageCount = Math.max(
    1,
    Number(firstPage?.pagination?.pages) ||
      Math.ceil(Number(firstPage?.total || firstPage?.pagination?.total || firstTours.length) / 50)
  );
  // Declare remainingPages for use by the surrounding module or function.
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
      getManagerTours({ page: index + 2, limit: 50 })
    )
  );
  // Declare allTours for use by the surrounding module or function.
  const allTours = [firstPage, ...remainingPages].flatMap(normalizeResponse);
  // Return the result of Array.from() to the caller.
  return Array.from(
    new Map(allTours.filter(Boolean).map((tour, index) => [
      String(tour?._id || tour?.id || tour?.slug || `tour-${index}`),
      tour,
    ])).values()
  );
};

// Declare tourId for use by the surrounding module or function.
const tourId = (tour, index) => String(tour?._id || tour?.id || tour?.slug || `tour-${index}`);

// Declare tourTitle for use by the surrounding module or function.
const tourTitle = (tour) =>
  tour?.title || tour?.name || tour?.tourName || tour?.destination?.name || "Untitled tour";

// Declare parseDate for use by the surrounding module or function.
const parseDate = (value) => {
  // Check the condition (!value) and run the matching branch.
  if (!value) return null;
  // Treat YYYY-MM-DD as a local calendar date instead of UTC midnight, which
  // can shift the displayed day in time zones west of UTC.
  // Declare dateOnlyMatch for use by the surrounding module or function.
  const dateOnlyMatch = typeof value === "string" && value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  // Declare date for use by the surrounding module or function.
  const date = dateOnlyMatch
    ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
    : new Date(value);
  // Return the expression shown below to the caller.
  return Number.isNaN(date.getTime()) ? null : date;
};

// Declare startDateOf for use by the surrounding module or function.
const startDateOf = (tour) =>
  parseDate(tour?.startDate || tour?.date || tour?.departureDate || tour?.travelDate || tour?.tourDate);

// Declare durationDaysOf for use by the surrounding module or function.
const durationDaysOf = (tour) => {
  // Declare raw for use by the surrounding module or function.
  const raw = tour?.durationDetails?.days ?? tour?.durationDays ?? tour?.duration ?? 1;
  // Declare match for use by the surrounding module or function.
  const match = String(raw).match(/\d+/);
  // Declare days for use by the surrounding module or function.
  const days = Number(match?.[0] || 1);
  // Return the expression shown below to the caller.
  return Number.isFinite(days) && days >= 1 ? Math.min(days, 365) : 1;
};

// Declare endDateOf for use by the surrounding module or function.
const endDateOf = (tour) => {
  // Declare start for use by the surrounding module or function.
  const start = startDateOf(tour);
  // Check the condition (!start) and run the matching branch.
  if (!start) return null;
  // Declare explicitEnd for use by the surrounding module or function.
  const explicitEnd = parseDate(tour?.endDate || tour?.returnDate);
  // Check the condition (explicitEnd && explicitEnd >= start) and run the matching branch.
  if (explicitEnd && explicitEnd >= start) return explicitEnd;

  // Declare end for use by the surrounding module or function.
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  // Perform the side effect or state update expressed on the following line.
  end.setDate(end.getDate() + durationDaysOf(tour) - 1);
  // Return the value of end to the caller.
  return end;
};

// Declare dateOnly for use by the surrounding module or function.
const dateOnly = (date) => {
  // Check the condition (!date) and run the matching branch.
  if (!date) return "";
  // Declare year for use by the surrounding module or function.
  const year = date.getFullYear();
  // Declare month for use by the surrounding module or function.
  const month = String(date.getMonth() + 1).padStart(2, "0");
  // Declare day for use by the surrounding module or function.
  const day = String(date.getDate()).padStart(2, "0");
  // Return the expression shown below to the caller.
  return `${year}-${month}-${day}`;
};

// Declare scheduledDateKeys for use by the surrounding module or function.
const scheduledDateKeys = (tour) => {
  // Declare keys for use by the surrounding module or function.
  const keys = new Set();
  // Declare start for use by the surrounding module or function.
  const start = startDateOf(tour);
  // Declare end for use by the surrounding module or function.
  const end = endDateOf(tour);

  // Mark every day of a multi-day tour, including both departure and return.
  // Check the condition (start && end) and run the matching branch.
  if (start && end) {
    // Declare cursor for use by the surrounding module or function.
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    // Declare finalDay for use by the surrounding module or function.
    const finalDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    // Repeat the enclosed work for each required iteration.
    for (; cursor <= finalDay; cursor.setDate(cursor.getDate() + 1)) {
      // Perform the side effect or state update expressed on the following line.
      keys.add(dateOnly(cursor));
    }
  }

  // Some tours are sold on specific departure dates in the availability list.
  // Include those dates too, even when the tour has no single startDate.
  // Declare availability for use by the surrounding module or function.
  const availability = [
    ...(Array.isArray(tour?.availability) ? tour.availability : []),
    ...(Array.isArray(tour?.availableDates) ? tour.availableDates : []),
    ...(Array.isArray(tour?.travelDates) ? tour.travelDates : []),
  ];
  // Repeat the enclosed work for each required iteration.
  for (const item of availability) {
    // Declare date for use by the surrounding module or function.
    const date = parseDate(typeof item === "object" ? item?.date || item?.startDate || item?.departureDate : item);
    // Check the condition (date) and run the matching branch.
    if (date) keys.add(dateOnly(date));
  }

  // Return the value of keys to the caller.
  return keys;
};

// Declare statusOf for use by the surrounding module or function.
const statusOf = (tour) => String(tour?.status || "scheduled").toLowerCase().replace(/[_-]/g, " ");

// Declare statusClasses for use by the surrounding module or function.
const statusClasses = (status) => {
  // Check the condition (status.includes("completed")) and run the matching branch.
  if (status.includes("completed")) return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  // Check the condition (status.includes("cancel")) and run the matching branch.
  if (status.includes("cancel")) return "bg-rose-50 text-rose-700 ring-rose-200";
  // Check the condition (status.includes("ongoing") || status.includes("active")) and run the matching branch.
  if (status.includes("ongoing") || status.includes("active")) return "bg-blue-50 text-blue-700 ring-blue-200";
  // Return a configured text value to the caller.
  return "bg-indigo-50 text-indigo-700 ring-indigo-200";
};

// Define TourManagerCalendar; its parameters and body implement this operation.
export default function TourManagerCalendar() {
  // Declare [currentDate, setCurrentDate] for use by the surrounding module or function.
  const [currentDate, setCurrentDate] = useState(new Date());
  // Declare [savingReminder, setSavingReminder] for use by the surrounding module or function.
  const [savingReminder, setSavingReminder] = useState(false);
  // Declare [deletingReminderId, setDeletingReminderId] for use by the surrounding module or function.
  const [deletingReminderId, setDeletingReminderId] = useState("");
  // Declare [selectedDay, setSelectedDay] for use by the surrounding module or function.
  const [selectedDay, setSelectedDay] = useState(null);
  // Declare [title, setTitle] for use by the surrounding module or function.
  const [title, setTitle] = useState("");

  // Declare toursQuery for use by the surrounding module or function.
  const toursQuery = useQuery({
    queryKey: ["tour-manager-calendar-tours"],
    queryFn: loadAllTenantTours,
    staleTime: 30_000,
    retry: 1,
  });

  // Declare tours for use by the surrounding module or function.
  const tours = useMemo(() => normalizeResponse(toursQuery.data), [toursQuery.data]);
  // Declare remindersQuery for use by the surrounding module or function.
  const remindersQuery = useQuery({
    queryKey: ["tour-manager-calendar-reminders"],
    queryFn: () => getCalendarReminders(),
    staleTime: 15_000,
    retry: 1,
  });
  // Declare reminders for use by the surrounding module or function.
  const reminders = useMemo(() => normalizeResponse(remindersQuery.data), [remindersQuery.data]);

  // Declare year for use by the surrounding module or function.
  const year = currentDate.getFullYear();
  // Declare month for use by the surrounding module or function.
  const month = currentDate.getMonth();
  // Declare daysInMonth for use by the surrounding module or function.
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Declare firstDay for use by the surrounding module or function.
  const firstDay = new Date(year, month, 1).getDay();
  // Declare todayKey for use by the surrounding module or function.
  const todayKey = dateOnly(new Date());

  // Declare days for use by the surrounding module or function.
  const days = useMemo(
    () => [
      ...Array.from({ length: firstDay }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ],
    [firstDay, daysInMonth]
  );

  // Declare dateKey for use by the surrounding module or function.
  const dateKey = (day) => (day ? dateOnly(new Date(year, month, day)) : "");

  // Declare eventsFor for use by the surrounding module or function.
  const eventsFor = (day) => {
    // Declare keyDate for use by the surrounding module or function.
    const keyDate = dateKey(day);
    // Check the condition (!keyDate) and run the matching branch.
    if (!keyDate) return [];

    // Declare tourEvents for use by the surrounding module or function.
    const tourEvents = tours
      .filter((tour) => scheduledDateKeys(tour).has(keyDate))
      .map((tour, index) => ({
        kind: "tour",
        id: tourId(tour, index),
        title: tourTitle(tour),
        status: statusOf(tour),
        tour,
      }));

    // Declare reminderEvents for use by the surrounding module or function.
    const reminderEvents = reminders
      .filter((reminder) => reminder?.date === keyDate)
      .map((reminder) => ({ kind: "reminder", ...reminder, id: String(reminder?._id || reminder?.id || "") }));

    // Return the collection assembled below to the caller.
    return [...tourEvents, ...reminderEvents];
  };

  // Declare selectedDate for use by the surrounding module or function.
  const selectedDate = selectedDay ? new Date(year, month, selectedDay) : null;
  // Declare selectedEvents for use by the surrounding module or function.
  const selectedEvents = selectedDay ? eventsFor(selectedDay) : [];
  // Declare scheduledTourCount for use by the surrounding module or function.
  const scheduledTourCount = selectedEvents.filter((event) => event.kind === "tour").length;
  // Declare reminderCount for use by the surrounding module or function.
  const reminderCount = selectedEvents.filter((event) => event.kind === "reminder").length;

  // Declare monthTourCount for use by the surrounding module or function.
  const monthTourCount = useMemo(
    () => new Set(
      days.flatMap((day) => eventsFor(day).filter((event) => event.kind === "tour").map((event) => event.id))
    ).size,
    [days, reminders, tours, year, month]
  );

  // Declare changeMonth for use by the surrounding module or function.
  const changeMonth = (offset) => {
    // Perform the side effect or state update expressed on the following line.
    setCurrentDate(new Date(year, month + offset, 1));
    // Perform the side effect or state update expressed on the following line.
    setSelectedDay(null);
  };

  // Declare addReminder for use by the surrounding module or function.
  const addReminder = async () => {
    // Check the condition (!selectedDay || !title.trim() || savingReminder) and run the matching branch.
    if (!selectedDay || !title.trim() || savingReminder) return;
    // Declare item for use by the surrounding module or function.
    const item = { date: dateKey(selectedDay), title: title.trim() };
    // Declare duplicate for use by the surrounding module or function.
    const duplicate = reminders.some(
      (reminder) => reminder.date === item.date && reminder.title?.trim().toLowerCase() === item.title.toLowerCase()
    );
    // Check the condition (duplicate) and run the matching branch.
    if (duplicate) {
      // Perform the side effect or state update expressed on the following line.
      toast.info("That reminder already exists on this date.");
      // Return the result to the caller.
      return;
    }

    // Perform the side effect or state update expressed on the following line.
    setSavingReminder(true);
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Perform the side effect or state update expressed on the following line.
      await createCalendarReminder(item);
      // Perform the side effect or state update expressed on the following line.
      await remindersQuery.refetch();
      // Perform the side effect or state update expressed on the following line.
      setTitle("");
      // Perform the side effect or state update expressed on the following line.
      toast.success("Reminder saved to your team calendar.");
    } catch (error) {
      // Declare message for use by the surrounding module or function.
      const message = error?.response?.data?.message || "Could not save the reminder. Please try again.";
      // Perform the side effect or state update expressed on the following line.
      toast.error(message);
    } finally {
      // Perform the side effect or state update expressed on the following line.
      setSavingReminder(false);
    }
  };

  // Declare removeReminder for use by the surrounding module or function.
  const removeReminder = async (id) => {
    // Check the condition (!id || deletingReminderId) and run the matching branch.
    if (!id || deletingReminderId) return;
    // Perform the side effect or state update expressed on the following line.
    setDeletingReminderId(id);
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Perform the side effect or state update expressed on the following line.
      await deleteCalendarReminder(id);
      // Perform the side effect or state update expressed on the following line.
      await remindersQuery.refetch();
      // Perform the side effect or state update expressed on the following line.
      toast.success("Reminder removed.");
    } catch (error) {
      // Perform the side effect or state update expressed on the following line.
      toast.error(error?.response?.data?.message || "Could not remove the reminder. Please try again.");
    } finally {
      // Perform the side effect or state update expressed on the following line.
      setDeletingReminderId("");
    }
  };

  // Return the expression shown below to the caller.
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

                  {selectedEvents.length === 0 && !toursQuery.isError && !remindersQuery.isError && (
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
