import {
  Award,
  Globe2,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Users,
  Compass,
  Plane,
  Star,
} from "lucide-react";

import { motion } from "framer-motion";

import { Link } from "react-router-dom";

export default function About() {
  const values = [
    {
      icon: HeartHandshake,
      title: "Personalized Experiences",
      text: "Every journey is carefully designed around your interests, comfort, and travel dreams.",
    },

    {
      icon: ShieldCheck,
      title: "Trusted Travel Partner",
      text: "We provide safe, reliable, and professionally managed tours across Africa.",
    },

    {
      icon: Globe2,
      title: "Authentic Adventures",
      text: "Discover real African cultures, landscapes, wildlife, and unforgettable moments.",
    },

    {
      icon: Users,
      title: "Expert Team",
      text: "Our experienced guides and travel specialists ensure every trip runs smoothly.",
    },
  ];

  const destinations = [
    "Maasai Mara Wildlife Safari",
    "Amboseli National Park",
    "Diani Beach Holidays",
    "Mount Kenya Adventures",
    "Cultural Heritage Tours",
    "Luxury African Safaris",
  ];

  return (
    <div className="bg-white">
      {/* HERO */}

      <section
        className="
        relative
        h-[520px]
        bg-cover
        bg-center
        flex
        items-center
        "
        style={{
          backgroundImage: "url('/hero1.jpeg')",
        }}
      >
        <div
          className="
          absolute
          inset-0
          bg-black/60
          "
        />

        <div
          className="
          relative
          max-w-7xl
          mx-auto
          px-6
          text-white
          "
        >
          <motion.h1
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
          text-5xl
          md:text-6xl
          font-extrabold
          mb-6
          "
          >
            About Coherent Tours
          </motion.h1>

          <p
            className="
          max-w-3xl
          text-lg
          md:text-xl
          text-gray-200
          "
          >
            Creating unforgettable African travel experiences through luxury
            safaris, beach holidays, cultural adventures and tailor-made
            journeys.
          </p>
        </div>
      </section>

      {/* INTRODUCTION */}

      <section
        className="
      py-20
      "
      >
        <div
          className="
        max-w-7xl
        mx-auto
        px-6
        grid
        md:grid-cols-2
        gap-12
        items-center
        "
        >
          <div>
            <h2
              className="
            text-4xl
            font-bold
            text-green-900
            mb-6
            "
            >
              Your Gateway To Africa
            </h2>

            <p
              className="
            text-gray-600
            leading-relaxed
            mb-5
            "
            >
              Coherent Tours is a premier African travel company dedicated to
              creating exceptional journeys for travelers seeking adventure,
              relaxation, and cultural discovery.
            </p>

            <p
              className="
            text-gray-600
            leading-relaxed
            mb-5
            "
            >
              From the breathtaking wildlife of Kenya's national parks to the
              beautiful beaches of the Indian Ocean, we connect travelers with
              Africa's most remarkable destinations.
            </p>

            <p
              className="
            text-gray-600
            leading-relaxed
            "
            >
              Our mission is simple: deliver safe, memorable and authentic
              travel experiences that guests will treasure forever.
            </p>
          </div>

          <div
            className="
          rounded-2xl
          overflow-hidden
          shadow-xl
          "
          >
            <img
              src="/hero2.jpeg"
              alt="African safari"
              className="
            w-full
            h-[420px]
            object-cover
            "
            />
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}

      <section
        className="
      bg-gray-50
      py-20
      "
      >
        <div
          className="
        max-w-7xl
        mx-auto
        px-6
        "
        >
          <div
            className="
          text-center
          mb-12
          "
          >
            <h2
              className="
          text-4xl
          font-bold
          text-green-900
          "
            >
              Why Travel With Us?
            </h2>
          </div>

          <div
            className="
          grid
          md:grid-cols-4
          gap-8
          "
          >
            {values.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={index}
                  whileHover={{
                    y: -8,
                  }}
                  className="
              bg-white
              p-8
              rounded-xl
              shadow-md
              text-center
              "
                >
                  <Icon
                    size={45}
                    className="
                mx-auto
                mb-5
                text-yellow-500
                "
                  />

                  <h3
                    className="
                font-bold
                text-xl
                text-green-900
                mb-3
                "
                  >
                    {item.title}
                  </h3>

                  <p
                    className="
                text-gray-600
                "
                  >
                    {item.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}

      <section
        className="
      py-20
      "
      >
        <div
          className="
      max-w-7xl
      mx-auto
      px-6
      "
        >
          <div
            className="
      grid
      md:grid-cols-2
      gap-12
      "
          >
            <div>
              <h2
                className="
      text-4xl
      font-bold
      text-green-900
      mb-6
      "
              >
                Explore Our Experiences
              </h2>

              <div
                className="
      space-y-4
      "
              >
                {destinations.map((item, index) => (
                  <div
                    key={index}
                    className="
          flex
          items-center
          gap-3
          "
                  >
                    <MapPin className="text-yellow-500" size={22} />

                    <span
                      className="
          text-gray-700
          "
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="
      bg-green-900
      rounded-2xl
      p-10
      text-white
      "
            >
              <Star
                className="
      text-yellow-400
      mb-5
      "
                size={45}
              />

              <h3
                className="
      text-3xl
      font-bold
      mb-4
      "
              >
                Our Promise
              </h3>

              <p
                className="
      text-gray-200
      leading-relaxed
      "
              >
                We don't just sell holidays. We create stories, memories and
                experiences that last a lifetime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}

      <section
        className="
      bg-yellow-500
      py-16
      "
      >
        <div
          className="
      max-w-5xl
      mx-auto
      px-6
      text-center
      "
        >
          <Compass
            className="
      mx-auto
      mb-5
      text-green-950
      "
            size={50}
          />

          <h2
            className="
      text-4xl
      font-bold
      text-green-950
      mb-5
      "
          >
            Ready For Your African Adventure?
          </h2>

          <p
            className="
      mb-8
      text-green-900
      "
          >
            Let our travel experts create the perfect journey for you.
          </p>

          <Link
            to="/tours"
            className="
      inline-flex
      items-center
      gap-2
      bg-green-900
      text-white
      px-8
      py-4
      rounded-xl
      font-bold
      hover:bg-green-800
      transition
      "
          >
            <Plane size={20} />
            Explore Tours
          </Link>
        </div>
      </section>
    </div>
  );
}
