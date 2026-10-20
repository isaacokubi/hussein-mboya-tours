// Import the tenant context hook used by tenant-aware frontend features.
import { useTenant } from '../context/TenantContext';
// Import the i18next translation engine.
import i18n from "i18next";

// Connect i18next with React's translation hooks and components.
import { initReactI18next } from "react-i18next";

// Detect a preferred language from the user's browser settings.
import LanguageDetector from "i18next-browser-languagedetector";

// Configure the translation engine with supported languages and message dictionaries.
i18n
  // Enable automatic browser-language detection.
  .use(LanguageDetector)
  // Enable React bindings such as translation hooks and components.
  .use(initReactI18next)
  // Initialize translations, fallback behavior and interpolation settings.
  .init({
    // Register the dictionaries that the application can translate from.
    resources: {
      // English is the default language and fallback when no translation is found.
      en: {
        // Keep all English message keys together for use by translation calls.
        translation: {
          welcome: "Discover unforgettable journeys with us", // Landing-page welcome message.
          home: "Home", // Label for the home navigation item.
          tours: "Tours", // Label for tour browsing.
          destinations: "Destinations", // Label for destination browsing.
          bookNow: "Book Now", // Call-to-action for starting a booking.
          myBookings: "My Bookings", // Label for the user's booking list.
          profile: "Profile", // Label for the user's profile area.
          login: "Login", // Label for signing in.
          logout: "Logout", // Label for signing out.
          explore: "Explore unforgettable African adventures", // Promotional exploration message.
          paymentSuccess: "Payment Successful", // Message shown after a confirmed payment.
          paymentPending: "Waiting for payment confirmation", // Message shown while payment is pending.
          contact: "Contact Support", // Label for the support contact action.
        },
      },

      // Swahili provides localized labels for Kenyan users.
      sw: {
        // Keep the Swahili message keys aligned with the English dictionary.
        translation: {
          welcome: "Gundua Afrika Nasi", // Swahili welcome message.
          home: "Nyumbani", // Label for home.
          tours: "Ziara", // Label for tours.
          destinations: "Maeneo", // Label for destinations.
          bookNow: "Weka Nafasi Sasa", // Label for starting a booking.
          myBookings: "Safari Zangu", // Label for the user's bookings.
          profile: "Wasifu", // Label for profile.
          login: "Ingia", // Label for signing in.
          logout: "Toka", // Label for signing out.
          explore: "Gundua safari zisizosahaulika Afrika", // Promotional exploration message.
          paymentSuccess: "Malipo Yamefanikiwa", // Message shown after successful payment.
          paymentPending: "Inasubiri uthibitisho wa malipo", // Message shown while waiting for payment confirmation.
          contact: "Wasiliana Nasi", // Label for contacting support.
        },
      },
    },

    // Use English whenever a key is missing in the active language.
    fallbackLng: "en",

    // Limit language selection to English and Swahili.
    supportedLngs: ["en", "sw"],

    // Configure how variables inserted into translations are handled.
    interpolation: {
      // React escapes rendered text by default, so i18next escaping is disabled here to avoid double escaping.
      escapeValue: false,
    },

    // Configure React integration behavior.
    react: {
      // Allow translation-aware components to suspend while translation resources load.
      useSuspense: true,
    },
  });

// Export the initialized translator for use throughout the frontend.
export default i18n;
