export default function StatCard({ title, value = 0, icon }) {
  return (
    <div className="dashboard-stat-card bg-white rounded-xl shadow p-5 sm:p-6 border hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-gray-500 font-medium leading-snug break-words">
            {title}
          </p>
          <h2 className="dashboard-value mt-2 font-bold text-gray-900 break-words">
            {typeof value === "object" ? "0" : value}
          </h2>
        </div>
        {icon && (
          <div className="shrink-0 text-2xl sm:text-3xl text-gray-400" aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
