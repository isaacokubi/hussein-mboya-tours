import { useMemo, useState } from "react";

export default function TourManagerCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = useMemo(() => {
    const result = [];

    for (let i = 0; i < firstDay; i += 1) {
      result.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      result.push(day);
    }

    return result;
  }, [firstDay, daysInMonth]);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date();

  const isToday = (day) =>
    day &&
    today.getDate() === day &&
    today.getMonth() === month &&
    today.getFullYear() === year;

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tour Calendar
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage scheduled tours and activities.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurrentDate(new Date())}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Today
        </button>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <button
            type="button"
            onClick={previousMonth}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            aria-label="Previous month"
          >
            ←
          </button>

          <h2 className="text-lg font-semibold text-gray-900">
            {monthName} {year}
          </h2>

          <button
            type="button"
            onClick={nextMonth}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            aria-label="Next month"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-200">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
            (day) => (
              <div
                key={day}
                className="border-r border-gray-200 px-2 py-3 text-center text-xs font-semibold uppercase text-gray-500 last:border-r-0"
              >
                {day}
              </div>
            )
          )}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, index) => (
            <div
              key={`${year}-${month}-${index}`}
              className="min-h-28 border-b border-r border-gray-200 p-2 last:border-r-0"
            >
              {day && (
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    isToday(day)
                      ? "bg-blue-600 text-white"
                      : "text-gray-700"
                  }`}
                >
                  {day}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
