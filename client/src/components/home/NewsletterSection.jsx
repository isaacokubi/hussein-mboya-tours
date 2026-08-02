import { motion } from "framer-motion";
import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);


  const handleSubmit = (e) => {
    e.preventDefault();


    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }


    setLoading(true);


    setTimeout(() => {
      setMessage(
        "Thank you for subscribing to our travel updates!"
      );

      setEmail("");

      setLoading(false);

    }, 1000);
  };


  return (
    <section
      className="
      py-20
      bg-gray-900
      text-white
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

        <motion.div
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
        >

          <h2
            className="
            text-3xl
            md:text-5xl
            font-bold
            mb-5
            "
          >
            Subscribe To Our Travel Updates
          </h2>


          <p
            className="
            text-gray-300
            text-lg
            max-w-2xl
            mx-auto
            "
          >
            Get exclusive safari offers, holiday packages,
            travel tips, and destination inspiration from
            Hussein Mboya Tours.
          </p>



          <form
            onSubmit={handleSubmit}
            className="
            mt-10
            flex
            flex-col
            md:flex-row
            gap-4
            justify-center
            "
          >

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email address"
              className="
              px-6
              py-4
              rounded-full
              w-full
              md:w-[420px]
              bg-white
              text-gray-900
              placeholder:text-gray-500
              border
              border-gray-300
              outline-none
              focus:ring-2
              focus:ring-green-500
              "
            />



            <button
              type="submit"
              disabled={loading}
              className="
              bg-green-600
              hover:bg-green-700
              px-10
              py-4
              rounded-full
              font-bold
              transition
              disabled:opacity-50
              "
            >
              {
                loading
                  ? "Subscribing..."
                  : "Subscribe"
              }

            </button>


          </form>



          {
            message && (

              <motion.p
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                className="
                mt-6
                text-green-400
                font-semibold
                "
              >
                {message}

              </motion.p>

            )
          }




          <div
            className="
            mt-8
            text-sm
            text-gray-400
            "
          >
            ✓ No spam &nbsp; • &nbsp;
            ✓ Exclusive travel offers &nbsp; • &nbsp;
            ✓ Kenya safari updates
          </div>


        </motion.div>

      </div>

    </section>
  );
}