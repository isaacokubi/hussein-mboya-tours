const CHECKOUT_PATH_PATTERN = /\/checkout\//;
const isCheckoutPage = () => CHECKOUT_PATH_PATTERN.test(window.location.pathname);
const getDateInput = () => document.querySelector('input[type="date"]');
const getPickupDateTimeInput = () => document.querySelector('input[type="datetime-local"]');
const setNativeValue = (input, value) => {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
};
const syncPickupDate = () => {
  if (!isCheckoutPage()) return;
  const travelDateInput = getDateInput();
  const pickupInput = getPickupDateTimeInput();
  if (!travelDateInput || !pickupInput || !travelDateInput.value) return;
  const selectedDate = travelDateInput.value;
  const current = pickupInput.value;
  const time = current && /^\d{4}-\d{2}-\d{2}T(\d{2}:\d{2})/.test(current) ? current.slice(11, 16) : "09:00";
  const expected = `${selectedDate}T${time}`;
  pickupInput.min = `${selectedDate}T00:00`;
  pickupInput.max = `${selectedDate}T23:59`;
  pickupInput.step = "900";
  if (pickupInput.value !== expected) setNativeValue(pickupInput, expected);
};
const installPickupDateSync = () => {
  if (!isCheckoutPage()) return;
  const observer = new MutationObserver(syncPickupDate);
  observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener("change", (event) => {
    const target = event.target;
    if (target?.matches?.('input[type="date"]')) { requestAnimationFrame(syncPickupDate); return; }
    if (target?.matches?.('input[type="datetime-local"]')) {
      const travelDateInput = getDateInput();
      if (!travelDateInput || !target.value) return;
      const selectedDate = travelDateInput.value;
      if (!target.value.startsWith(`${selectedDate}T`)) {
        const time = target.value.includes("T") ? target.value.slice(11, 16) : "09:00";
        setNativeValue(target, `${selectedDate}T${time}`);
      }
    }
  }, true);
  document.addEventListener("input", (event) => {
    if (event.target?.matches?.('input[type="date"]')) requestAnimationFrame(syncPickupDate);
  }, true);
  syncPickupDate();
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", installPickupDateSync, { once: true });
else installPickupDateSync();
