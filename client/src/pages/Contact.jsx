import { useSettings } from "../context/SettingsContext";

import { Phone, Mail, MapPin, Send, MessageCircle, Globe,Clock } from "lucide-react";

import { FaFacebook, FaInstagram } from "react-icons/fa";

import { motion } from "framer-motion";
import { useState } from "react";

export default function Contact(
) {
  const { supportPhone, supportEmail } = useSettings();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();

    

    alert("Thank you for contacting Coherent Tours. We will respond shortly.");
  };

  const details = [
    {
      icon: Phone,
      title: "Phone",
      value: supportPhone,
    },

    {
      icon: Mail,
      title: "Email",
      value: supportEmail || "support@example.com",
    },

    {
      icon: MapPin,
      title: "Office",
      value: "Nairobi, Kenya",
    },

    {
      icon: Clock,
      title: "Working Hours",
      value: "Mon - Sat | 8AM - 6PM",
    },
  ];

  return (
    <div className="bg-white">
      {/* HERO */}

      <section
        className="
        relative
        h-[480px]
        bg-cover
        bg-center
        flex
        items-center
        "
        style={{
          backgroundImage: "url('/hero4.jpeg')",
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
              y: 40,
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
            Contact Us
          </motion.h1>

          <p
            className="
          text-xl
          text-gray-200
          max-w-3xl
          "
          >
            Let our travel experts help you plan your next unforgettable African
            adventure.
          </p>
        </div>
      </section>

      {/* CONTACT INFORMATION */}

      <section
        className="
      py-16
      "
      >
        <div
          className="
      max-w-7xl
      mx-auto
      px-6
      grid
      md:grid-cols-4
      gap-8
      "
        >
          {details.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={index}
                whileHover={{
                  y: -8,
                }}
                className="
          bg-white
          shadow-lg
          rounded-xl
          p-8
          text-center
          border
          "
              >
                <Icon
                  size={40}
                  className="
          mx-auto
          text-yellow-500
          mb-4
          "
                />

                <h3
                  className="
          text-xl
          font-bold
          text-green-900
          mb-2
          "
                >
                  {item.title}
                </h3>

                <p
                  className="
          text-gray-600
          "
                >
                  {item.value}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* FORM AREA */}

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
      grid
      md:grid-cols-2
      gap-12
      "
        >
          {/* TEXT */}

          <div>
            <h2
              className="
      text-4xl
      font-bold
      text-green-900
      mb-6
      "
            >
              Start Planning Your Journey
            </h2>

            <p
              className="
      text-gray-600
      leading-relaxed
      mb-8
      "
            >
              Whether you want corporate travel management services,airport
              transfers,car hire and transport services ,meet and assist
              services,conference and events services , a luxury safari, beach
              holiday, honeymoon experience, mountain adventure or customized
              tour, our team will create the perfect package for you.
            </p>

            <div
              className="
      space-y-5
      "
            >
              <div className="flex gap-3 items-center">
                <MessageCircle className="text-yellow-500" />

                <span>Fast response from our travel consultants</span>
              </div>

              <div className="flex gap-3 items-center">
                <MapPin className="text-yellow-500" />

                <span>Explore Africa with local experts</span>
              </div>
            </div>
          </div>

          {/* FORM */}

          <motion.form
            onSubmit={submitHandler}
            initial={{
              opacity: 0,
              x: 50,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            className="
      bg-white
      rounded-2xl
      shadow-xl
      p-8
      "
          >
            <h3
              className="
      text-2xl
      font-bold
      text-green-900
      mb-6
      "
            >
              Send An Inquiry
            </h3>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="
      w-full
      border
      rounded-lg
      p-3
      mb-4
      "
            />

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email Address"
              type="email"
              className="
      w-full
      border
      rounded-lg
      p-3
      mb-4
      "
            />

            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="
      w-full
      border
      rounded-lg
      p-3
      mb-4
      "
            />

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us about your trip..."
              rows="5"
              className="
      w-full
      border
      rounded-lg
      p-3
      mb-5
      "
            />

            <button
              className="
      w-full
      bg-green-900
      hover:bg-green-800
      text-white
      py-4
      rounded-xl
      font-bold
      flex
      justify-center
      gap-3
      items-center
      transition
      "
            >
              <Send size={20} />
              Send Message
            </button>
          </motion.form>
        </div>
      </section>

      {/* SOCIAL */}

      <section
        className="
      bg-green-950
      py-14
      text-white
      "
      >
        <div
          className="
      text-center
      "
        >
          <h2
            className="
      text-3xl
      font-bold
      mb-6
      "
          >
            Follow Our Adventures
          </h2>

          <div
            className="
      flex
      justify-center
      gap-5
      "
          >
            <a
              href="#"
              className="
      p-4
      bg-white/10
      rounded-full
      hover:bg-yellow-500
      "
            >
              <FaFacebook size={24}/>
            </a>

            <a
              href="#"
              className="
      p-4
      bg-white/10
      rounded-full
      hover:bg-yellow-500
      "
            >
              <FaInstagram size={24} />
            </a>

            <a
              href="#"
              className="
      p-4
      bg-white/10
      rounded-full
      hover:bg-yellow-500
      "
            >
              <Globe />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
