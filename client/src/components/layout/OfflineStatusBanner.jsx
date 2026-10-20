import { useEffect, useState } from "react";

/**
 * Tell the user when the browser is offline or a public catalogue page is using
 * previously saved data. This banner never claims a booking or payment was synced.
 */
export default function OfflineStatusBanner() {
  const [isOffline, setIsOffline] = useState(
    () => typeof navigator !== "undefined" && !navigator.onLine
  );
  const [cachedResource, setCachedResource] = useState("");

  useEffect(() => {
    // Browser events keep the message current as connectivity changes.
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    const handleCachedFallback = (event) => {
      setCachedResource(String(event?.detail?.resource || "public catalogue"));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("app:offline-cache-used", handleCachedFallback);

    // Remove listeners when the app shell unmounts so the component does not leak handlers.
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("app:offline-cache-used", handleCachedFallback);
    };
  }, []);

  if (!isOffline && !cachedResource) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="sticky top-0 z-[100] border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm font-semibold text-amber-950"
    >
      {isOffline
        ? "You are offline. Saved public tour information may be available; bookings, updates and M-Pesa payments require internet."
        : `Showing saved ${cachedResource} because the server could not be reached. Reconnect to refresh current information.`}
      {!isOffline && cachedResource && (
        <button
          type="button"
          className="ml-3 underline"
          onClick={() => setCachedResource("")}
        >
          Dismiss
        </button>
      )}
    </aside>
  );
}
