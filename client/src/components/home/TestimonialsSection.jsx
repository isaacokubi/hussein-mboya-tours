import { useSettings } from "../../context/SettingsContext";
import { motion } from "framer-motion";
import { FaQuoteLeft } from "react-icons/fa";

import LazyImage from "../common/LazyImage";

const testimonials = [
  {
    name: "Sarah Williams",
    country: "United Kingdom",
    image: "/testimonials/sarah.jpg",
    message:
      "Coherent Tours gave us the best safari experience in Kenya. The guides were professional and the entire trip was perfectly organized.",
  },

  {
    name: "James Anderson",
    country: "United States",
    image: "/testimonials/james.jpg",
    message:
      "From airport pickup to the Maasai Mara adventure, everything was handled professionally. Highly recommended.",
  },

  {
    name: "Amina Hassan",
    country: "United Arab Emirates",
    image: "/testimonials/amina.jpg",
    message:
      "The beach holiday package was amazing. Beautiful hotels, friendly guides and unforgettable memories.",
  },
];

export default function TestimonialsSection(
) {
  return (
    <section
      className="
py-20
bg-white
"
    >
      <div
        className="
container
mx-auto
px-6
"
      >
        <motion.h2
          initial={{
            opacity: 0,

            y: 30,
          }}
          whileInView={{
            opacity: 1,

            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="
text-3xl
md:text-4xl
font-bold
text-center
mb-12
"
        >
          Traveler Experiences
        </motion.h2>

        <div
          className="
grid
grid-cols-1
md:grid-cols-3
gap-8
"
        >
          {(Array.isArray(testimonials) ? testimonials : []).map((item, index) => (
            <motion.div
              key={item.name}
              initial={{
                opacity: 0,

                y: 40,
              }}
              whileInView={{
                opacity: 1,

                y: 0,
              }}
              transition={{
                duration: 0.5,

                delay: index * 0.1,
              }}
              whileHover={{
                y: -10,
              }}
              viewport={{
                once: true,
              }}
              className="
bg-gray-50
rounded-2xl
shadow-lg
p-8
text-center
border
border-gray-100
"
            >
              <FaQuoteLeft
                className="
text-green-600
text-3xl
mx-auto
mb-5
"
              />

              <LazyImage
                src={item.image}
                alt={item.name}
                className="
w-20
h-20
rounded-full
object-cover
mx-auto
"
              />

              <h3
                className="
text-xl
font-bold
mt-5
"
              >
                {item.name}
              </h3>

              <p
                className="
text-gray-500
"
              >
                {item.country}
              </p>

              <p
                className="
mt-5
text-gray-600
leading-relaxed
italic
"
              >
                "{item.message}"
              </p>

              <div
                className="
mt-5
text-green-600
text-sm
font-semibold
"
              >
                Verified Traveler
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
