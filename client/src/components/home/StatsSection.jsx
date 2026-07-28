import React from "react";
import CountUpImport from "react-countup";

console.log("CountUp =", CountUpImport);

const CountUp =
  typeof CountUpImport === "function"
    ? CountUpImport
    : CountUpImport?.default;

const StatsSection = () => {
  const stats = [
    {
      number: 5000,
      label: "Happy Travelers",
    },
    {
      number: 300,
      label: "Tours Completed",
    },
    {
      number: 50,
      label: "Destinations",
    },
    {
      number: 10,
      label: "Years Experience",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid gap-8 text-center md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <h2 className="text-5xl font-bold text-green-600">
                {CountUp ? (
                  <>
                    <CountUp
                      end={stat.number}
                      duration={3}
                    />
                    +
                  </>
                ) : (
                  `${stat.number}+`
                )}
              </h2>

              <p className="mt-2 text-gray-600">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;