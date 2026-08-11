import { Link } from "react-router-dom";

export default function MpesaCTA() {
  return (
    <section
      className="
py-20
bg-black
text-white
text-center
"
    >
      <div
        className="
max-w-4xl
mx-auto
px-6
"
      >
        <h2
          className="
text-3xl
md:text-4xl
font-bold
"
        >
          Ready To Explore Kenya?
        </h2>

        <p
          className="
mt-5
text-lg
md:text-xl
text-gray-300
"
        >
          Book your adventure today and pay securely using M-Pesa.
        </p>

        <div
          className="
mt-6
flex
justify-center
items-center
gap-3
"
        >
          <span
            className="
bg-green-700
px-4
py-2
rounded-full
text-sm
font-semibold
"
          >
            ✓ Secure M-Pesa Payments
          </span>
        </div>

        <Link
          to="/tours"
          className="
inline-block
mt-8
bg-green-600
px-10
py-4
rounded-full
font-bold
hover:bg-green-700
transition
"
        >
          Explore Tours
        </Link>
      </div>
    </section>
  );
}
