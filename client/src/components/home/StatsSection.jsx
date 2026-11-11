/**
 * Purpose: Stats Section reusable UI component. Main declarations: StatsSection.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { motion } from "framer-motion";
// Load ../../context/SettingsContext so this module can use its exported dependencies.
import { useSettings } from "../../context/SettingsContext";

// Declare StatsSection for use by the surrounding module or function.
const StatsSection = () => {
  // Declare { settings = {} } for use by the surrounding module or function.
  const { settings = {} } = useSettings() || {};
  // Declare configured for use by the surrounding module or function.
  const configured = Array.isArray(settings.homepageStats) ? settings.homepageStats : [];
  // Never publish invented customer, tour, destination or company-age claims.
  // Declare stats for use by the surrounding module or function.
  const stats = configured
    .map((item) => ({
      number: Number(item?.number),
      label: String(item?.label || "").trim(),
    }))
    .filter((item) => item.label && Number.isFinite(item.number) && item.number >= 0)
    .slice(0, 4);

  // Check the condition (!stats.length) and run the matching branch.
  if (!stats.length) return null;

  // Return the expression shown below to the caller.
  return (
    <section className="bg-white py-16 text-slate-900 sm:py-20" aria-label="Travel company statistics">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <p className="text-3xl font-black tracking-tight text-emerald-700 sm:text-4xl">
                {stat.number.toLocaleString("en-KE")}
              </p>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-700 sm:text-base">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
