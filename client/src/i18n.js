import { useTenant } from '../context/TenantContext';
import i18n from "i18next";

import { initReactI18next } from "react-i18next";

import LanguageDetector from "i18next-browser-languagedetector";

i18n

  .use(LanguageDetector)

  .use(initReactI18next)

  .init({
    resources: {
      en: {
        translation: {
          welcome: "Discover unforgettable journeys with us",

          home: "Home",

          tours: "Tours",

          destinations: "Destinations",

          bookNow: "Book Now",

          myBookings: "My Bookings",

          profile: "Profile",

          login: "Login",

          logout: "Logout",

          explore: "Explore unforgettable African adventures",

          paymentSuccess: "Payment Successful",

          paymentPending: "Waiting for payment confirmation",

          contact: "Contact Support",
        },
      },

      sw: {
        translation: {
          welcome: "Gundua Afrika Nasi",

          home: "Nyumbani",

          tours: "Ziara",

          destinations: "Maeneo",

          bookNow: "Weka Nafasi Sasa",

          myBookings: "Safari Zangu",

          profile: "Wasifu",

          login: "Ingia",

          logout: "Toka",

          explore: "Gundua safari zisizosahaulika Afrika",

          paymentSuccess: "Malipo Yamefanikiwa",

          paymentPending: "Inasubiri uthibitisho wa malipo",

          contact: "Wasiliana Nasi",
        },
      },
    },

    fallbackLng: "en",

    supportedLngs: ["en", "sw"],

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: true,
    },
  });

export default i18n;
