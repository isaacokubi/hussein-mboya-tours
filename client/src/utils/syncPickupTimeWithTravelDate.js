const CHECKOUT_PATH_PATTERN = /\/checkout\//;

const isCheckoutPage = () => CHECKOUT_PATH_PATTERN.test(window.location.pathname);

const getDateInput = () => document.querySelector('input[type="date"]');
const getPickupDateTimeInput = () => document.querySelector('input[type="datetime-local"]');

const syncPickupDate = () => {
  if (!isCheckoutPage()) return;

  const travelDateInput = getDateInput();
  const pickupInput = getPickupDateTimeInput();
  if (!travelDateInput || !pickupInput || !travelDateInput.value) return;

  const selectedDate = travelDateInput.value;
  const current = pickupInput.value;
  const time = current && /^\d{4}-\d{2}-\d{2}T(\d{2}:\d{2})/.test(current)
    ? current.slice(11, 16)
    : "09:00";
  const expected = `${selectedDate}T${time}`;

  if (pickupInput.value !== expected) {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    )?.set;
    setter?.call(pickupInput, expected);
    pickupInput.dispatchEvent(new Event("input", { bubbles: true }));
    pickupInput.dispatchEvent(new Event("change", { bubbles: true }));
  }
};

const installPickupDateSync = () => {
  if (!isCheckoutPage()) return;

  const observer = new MutationObserver(syncPickupDate);
  observer.observe(document.body, { childList: true, subtree: true });

  document.addEventListener("change", (event) => {
    if (event.target?.matches?.('input[type="date"]')) {
      requestAnimationFrame(syncPickupDate);
    }
  }, true);

  document.addEventListener("input", (event) => {
    if (event.target?.matches?.('input[type="date"]')) {
      requestAnimationFrame(syncPickupDate);
    }
  }, true);

  syncPickupDate();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", installPickupDateSync, { once: true });
} else {
  installPickupDateSync();
}
