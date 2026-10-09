import CountUp from "react-countup";
import { motion } from "framer-motion";
import { useSettings } from "../../context/SettingsContext";

const StatsSection = () => {
  const { settings = {} } = useSettings() || {};
  const configured = Array.isArray(settings.homepageStats) ? settings.homepageStats : [];
  // Never invent business metrics. Only explicitly verified, tenant-configured figures may be published.
  const stats = configured
    .filter((item) => item && item.verified === true)
    .map((item) => ({ number: Number(item.number), label: String(item.label || "").trim() }))
    .filter((item) => Number.isFinite(item.number) && item.number >= 0 && item.label);

  if (!stats.length) return null;

  return (
    <section className="py-20 bg-white text-slate-900" aria-label="Verified travel company statistics">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-2 md:grid-cols-4">
          {stats.slice(0, 4).map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-emerald-600 md:text-5xl">
                <CountUp end={stat.number} duration={3} separator="," />
              </h2>
              <p className="mt-3 font-semibold text-slate-700">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
