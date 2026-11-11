/**
 * Purpose: Metric Card reusable UI component. Main declarations: MetricCard.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */

// Define MetricCard; its parameters and body implement this operation.
export default function MetricCard({
  title,
  value,
  subtitle,
  icon
}) {
  // Return the expression shown below to the caller.
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5">
      <div className="flex justify-between items-start">

        <div>
          <p className="text-sm text-gray-500">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>

          <p className="text-xs text-gray-500 mt-2">
            {subtitle}
          </p>
        </div>

        <div className="text-3xl">
          {icon}
        </div>

      </div>
    </div>
  );
}
