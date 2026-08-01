import { useQuery } from "@tanstack/react-query";

import { Swiper, SwiperSlide } from "swiper/react";

import { Autoplay, EffectFade } from "swiper/modules";

import { Link } from "react-router-dom";

import { getHeroSlides } from "../../api/heroApi";

import "swiper/css";

import "swiper/css/effect-fade";

export default function HeroSlider() {
  const {
    data: slides = [],

    isLoading,
  } = useQuery({
    queryKey: ["heroSlides"],

    queryFn: getHeroSlides,
  });

  if (isLoading) {
    return (
      <section
        className="
h-screen
bg-black
flex
items-center
justify-center
text-white
"
      >
        Loading...
      </section>
    );
  }

  return (
    <section
      className="
relative
h-screen
overflow-hidden
"
    >
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        autoplay={{
          delay: 5000,

          disableOnInteraction: false,
        }}
        loop
        className="h-full"
      >
        {slides?.map((slide) => (
          <SwiperSlide key={slide._id}>
            <div
              className="
relative
h-screen
"
            >
              <video
                className="
absolute
inset-0
w-full
h-full
object-cover
"
                src={slide.video?.url}
                autoPlay
                muted
                loop
                playsInline
              />

              <div
                className="
absolute
inset-0
bg-black/55
"
              />

              <div
                className="
relative
z-10
flex
flex-col
items-center
justify-center
h-full
text-center
text-white
px-6
"
              >
                <span
                  className="
uppercase
tracking-[6px]
text-green-400
mb-4
"
                >
                  {slide.badge}
                </span>

                <h1
                  className="
text-5xl
md:text-7xl
font-extrabold
leading-tight
"
                >
                  {slide.title}
                </h1>

                <p
                  className="
mt-6
max-w-2xl
text-lg
md:text-2xl
text-gray-200
"
                >
                  {slide.subtitle}
                </p>

                <div
                  className="
flex
gap-4
mt-10
flex-wrap
justify-center
"
                >
                  <Link
                    to={slide.buttonOne.link}
                    className="
bg-green-600
hover:bg-green-700
px-8
py-4
rounded-full
font-semibold
"
                  >
                    {slide.buttonOne.text}
                  </Link>

                  <Link
                    to={slide.buttonTwo.link}
                    className="
border
border-white
hover:bg-white
hover:text-black
px-8
py-4
rounded-full
font-semibold
"
                  >
                    {slide.buttonTwo.text}
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
