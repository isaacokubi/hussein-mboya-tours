import CountUp from "react-countup";
import { motion } from "framer-motion";
import { useSettings } from "../../context/SettingsContext";

const StatsSection = () => {
  const { settings = {} } = useSettings() || {};
  const configured = Array.isArray(settings.homepageStats) ? settings.homepageStats : [];
  const defaults = [
    { number: 4486, label: "Happy Customers" },
    { number: 290, label: "Tours Completed" },
    { number: 48, label: "Destinations" },
    { number: 10, label: "Years Serving Travelers" },
  ];
  const stats = defaults.map((fallback, index) => { const item = configured[index] || {}; const number = Number(item.number); return { number: Number.isFinite(number) && number >= 0 ? number : fallback.number, label: item.label || fallback.label }; });

  return (
    <section className="py-20 bg-white text-slate-900" aria-label="Travel company statistics">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-emerald-600">
                <CountUp end={stat.number} duration={3} separator="," />+
              </h2>
              <p className="mt-3 text-slate-700 font-semibold">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
