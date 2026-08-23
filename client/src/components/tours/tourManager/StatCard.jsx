import PropTypes from "prop-types";

export default function StatCard({
  title,
  value,
  icon,
  color = "bg-green-600",
  subtitle,
  loading = false,
}) {
  return (
    <div
      className="
        bg-white
        rounded-xl
        shadow-sm
        hover:shadow-lg
        transition-shadow
        duration-300
        border
        border-gray-100
        p-6
        flex
        items-center
        justify-between
      "
    >
      <div className="flex-1">
        <p className="text-sm text-gray-500 font-medium">
          {title}
        </p>

        {loading ? (
          <div className="mt-3 h-8 w-24 rounded bg-gray-200 animate-pulse" />
        ) : (
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {value}
          </h2>
        )}

        {subtitle && (
          <p className="mt-2 text-sm text-gray-500">
            {subtitle}
          </p>
        )}
      </div>

      <div
        className={`
          ${color}
          h-14
          w-14
          rounded-full
          flex
          items-center
          justify-center
          text-white
          shadow-md
          flex-shrink-0
        `}
      >
        {icon}
      </div>
    </div>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  icon: PropTypes.node,
  color: PropTypes.string,
  subtitle: PropTypes.string,
  loading: PropTypes.bool,
};

StatCard.defaultProps = {
  value: "-",
  icon: null,
  color: "bg-green-600",
  subtitle: "",
  loading: false,
};
