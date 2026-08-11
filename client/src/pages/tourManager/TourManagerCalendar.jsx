import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, ChevronLeft, ChevronRight, CalendarDays, Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import { getManagerTours } from "../../api/tourApi";

const key = "coherent-tour-manager-reminders";

const loadReminders = () => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); }
  catch { return []; }
};

const startDateOf = (tour) => new Date(tour.startDate || tour.date);
const endDateOf = (tour) => {
  const start = startDateOf(tour);
  if (tour.endDate) return new Date(tour.endDate);
  const days = Math.max(1, Number(tour.durationDetails?.days || tour.duration || 1));
  const end = new Date(start);
  end.setDate(end.getDate() + days - 1);
  return end;
};

export default function TourManagerCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reminders, setReminders] = useState(loadReminders);
  const [selectedDay, setSelectedDay] = useState(null);
  const [title, setTitle] = useState("");

  const { data } = useQuery({
    queryKey: ["tour-manager-calendar-tours"],
    queryFn: () => getManagerTours({ limit: 100 }),
  });

  const tours = Array.isArray(data?.tours) ? data.tours : Array.isArray(data?.data) ? data.data : [];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = useMemo(() => [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ], [firstDay, daysInMonth]);

  const dateKey = (day) => day ? `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}` : "";
  const eventsFor = (day) => {
    const keyDate = dateKey(day);
    if (!keyDate) return [];
    const target = new Date(`${keyDate}T00:00:00`);
    const tourEvents = tours.filter(t => {
      const start = new Date(startDateOf(t)); start.setHours(0,0,0,0);
      const end = new Date(endDateOf(t)); end.setHours(0,0,0,0);
      return target >= start && target <= end;
    }).map(t => ({ kind:"tour", id:t._id, title:t.title, tour:t }));
    const reminderEvents = reminders.filter(r => r.date === keyDate).map(r => ({ kind:"reminder", ...r }));
    return [...tourEvents, ...reminderEvents];
  };

  const addReminder = () => {
    if (!selectedDay || !title.trim()) return;
    const item = { id: `${Date.now()}`, date: dateKey(selectedDay), title: title.trim() };
    const next = [...reminders, item];
    setReminders(next);
    localStorage.setItem(key, JSON.stringify(next));
    setTitle("");
    toast.success("Reminder added to your tour manager calendar.");
  };

  const removeReminder = (id) => {
    const next = reminders.filter(r => r.id !== id);
    setReminders(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Operations</p>
            <h1 className="text-3xl font-bold text-slate-900">Tour Manager Calendar</h1>
            <p className="mt-1 text-sm text-slate-500">See multi-day tours and add operational reminders to any date.</p>
          </div>
          <button onClick={()=>setCurrentDate(new Date())} className="rounded-lg border bg-white px-4 py-2 font-semibold">Today</button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b p-4">
              <button onClick={()=>setCurrentDate(new Date(year,month-1,1))} className="rounded-lg border p-2"><ChevronLeft size={18}/></button>
              <h2 className="text-lg font-bold">{currentDate.toLocaleString("default",{month:"long"})} {year}</h2>
              <button onClick={()=>setCurrentDate(new Date(year,month+1,1))} className="rounded-lg border p-2"><ChevronRight size={18}/></button>
            </div>
            <div className="grid grid-cols-7 border-b bg-slate-50">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} className="p-3 text-center text-xs font-bold text-slate-500">{d}</div>)}</div>
            <div className="grid grid-cols-7">
              {days.map((day,index)=>{
                const events=eventsFor(day);
                const selected=day===selectedDay;
                return <button type="button" key={`${year}-${month}-${index}`} onClick={()=>day&&setSelectedDay(day)} className={`min-h-32 border-b border-r p-2 text-left transition ${selected?"bg-emerald-50":"hover:bg-slate-50"}`}>
                  {day && <><div className="flex items-center justify-between"><span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${new Date().toDateString()===new Date(year,month,day).toDateString()?"bg-emerald-700 text-white":"text-slate-700"}`}>{day}</span>{events.length>0&&<span className="text-xs text-slate-400">{events.length}</span>}</div>
                    <div className="mt-2 space-y-1">{events.slice(0,3).map(e=><div key={`${e.kind}-${e.id}`} className={`truncate rounded px-2 py-1 text-[11px] font-semibold ${e.kind==="tour"?"bg-blue-100 text-blue-700":"bg-amber-100 text-amber-800"}`}>{e.kind==="tour"?"Tour: ":"Reminder: "}{e.title}</div>)}{events.length>3&&<div className="text-xs text-slate-400">+{events.length-3} more</div>}</div>
                  </>}
                </button>;
              })}
            </div>
          </div>

          <aside className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-2"><CalendarDays className="text-emerald-700"/><h2 className="text-xl font-bold">Day details</h2></div>
            {!selectedDay ? <p className="mt-5 text-sm text-slate-500">Select a date to view tours and manage reminders.</p> : <>
              <p className="mt-4 font-semibold">{new Date(year,month,selectedDay).toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
              <div className="mt-4 space-y-2">{eventsFor(selectedDay).map(e=><div key={`${e.kind}-${e.id}`} className="rounded-lg border p-3"><div className="text-xs font-bold uppercase text-slate-400">{e.kind==="tour"?"Scheduled tour":"Reminder"}</div><div className="font-semibold">{e.title}</div>{e.kind==="reminder"&&<button onClick={()=>removeReminder(e.id)} className="mt-1 text-xs text-red-600">Remove reminder</button>}</div>)}{eventsFor(selectedDay).length===0&&<p className="text-sm text-slate-500">Nothing scheduled.</p>}</div>
              <div className="mt-5 border-t pt-5"><label className="text-sm font-semibold">Add reminder</label><div className="mt-2 flex gap-2"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Call driver" className="min-w-0 flex-1 rounded-lg border p-2"/><button onClick={addReminder} className="rounded-lg bg-emerald-700 p-2 text-white" title="Add reminder"><Plus size={18}/></button></div><p className="mt-2 flex items-center gap-1 text-xs text-slate-400"><Bell size={13}/> Saved on this browser.</p></div>
            </>}
          </aside>
        </div>
      </div>
    </div>
  );
}
