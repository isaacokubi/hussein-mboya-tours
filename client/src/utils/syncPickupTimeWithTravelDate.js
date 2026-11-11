/**
 * Purpose: sync Pickup Time With Travel Date client application module. Main declarations: isCheckoutPage, getDateInput, getPickupDateTimeInput, setNativeValue, syncPickupDate.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
const CHECKOUT_PATH_PATTERN = /\/checkout\//;
// Declare isCheckoutPage for use by the surrounding module or function.
const isCheckoutPage = () => CHECKOUT_PATH_PATTERN.test(window.location.pathname);
// Declare getDateInput for use by the surrounding module or function.
const getDateInput = () => document.querySelector('input[type="date"]');
// Declare getPickupDateTimeInput for use by the surrounding module or function.
const getPickupDateTimeInput = () => document.querySelector('input[type="datetime-local"]');
// Declare setNativeValue for use by the surrounding module or function.
const setNativeValue = (input, value) => {
  // Declare setter for use by the surrounding module or function.
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  // Perform the side effect or state update expressed on the following line.
  setter?.call(input, value);
  // Perform the side effect or state update expressed on the following line.
  input.dispatchEvent(new Event("input", { bubbles: true }));
  // Perform the side effect or state update expressed on the following line.
  input.dispatchEvent(new Event("change", { bubbles: true }));
};
// Declare syncPickupDate for use by the surrounding module or function.
const syncPickupDate = () => {
  // Check the condition (!isCheckoutPage()) and run the matching branch.
  if (!isCheckoutPage()) return;
  // Declare travelDateInput for use by the surrounding module or function.
  const travelDateInput = getDateInput();
  // Declare pickupInput for use by the surrounding module or function.
  const pickupInput = getPickupDateTimeInput();
  // Check the condition (!travelDateInput || !pickupInput || !travelDateInput.value) and run the matching branch.
  if (!travelDateInput || !pickupInput || !travelDateInput.value) return;
  // Declare selectedDate for use by the surrounding module or function.
  const selectedDate = travelDateInput.value;
  // Declare current for use by the surrounding module or function.
  const current = pickupInput.value;
  // Declare time for use by the surrounding module or function.
  const time = current && /^\d{4}-\d{2}-\d{2}T(\d{2}:\d{2})/.test(current) ? current.slice(11, 16) : "09:00";
  // Declare expected for use by the surrounding module or function.
  const expected = `${selectedDate}T${time}`;
  // Perform the side effect or state update expressed on the following line.
  pickupInput.min = `${selectedDate}T00:00`;
  // Perform the side effect or state update expressed on the following line.
  pickupInput.max = `${selectedDate}T23:59`;
  // Perform the side effect or state update expressed on the following line.
  pickupInput.step = "900";
  // Check the condition (pickupInput.value !== expected) and run the matching branch.
  if (pickupInput.value !== expected) setNativeValue(pickupInput, expected);
};
// Declare installPickupDateSync for use by the surrounding module or function.
const installPickupDateSync = () => {
  // Check the condition (!isCheckoutPage()) and run the matching branch.
  if (!isCheckoutPage()) return;
  // Declare observer for use by the surrounding module or function.
  const observer = new MutationObserver(syncPickupDate);
  // Perform the side effect or state update expressed on the following line.
  observer.observe(document.body, { childList: true, subtree: true });
  // Perform the side effect or state update expressed on the following line.
  document.addEventListener("change", (event) => {
    // Declare target for use by the surrounding module or function.
    const target = event.target;
    // Check the condition (target?.matches?.('input[type="date"]')) and run the matching branch.
    if (target?.matches?.('input[type="date"]')) { requestAnimationFrame(syncPickupDate); return; }
    // Check the condition (target?.matches?.('input[type="datetime-local"]')) and run the matching branch.
    if (target?.matches?.('input[type="datetime-local"]')) {
      // Declare travelDateInput for use by the surrounding module or function.
      const travelDateInput = getDateInput();
      // Check the condition (!travelDateInput || !target.value) and run the matching branch.
      if (!travelDateInput || !target.value) return;
      // Declare selectedDate for use by the surrounding module or function.
      const selectedDate = travelDateInput.value;
      // Check the condition (!target.value.startsWith(`${selectedDate}T`)) and run the matching branch.
      if (!target.value.startsWith(`${selectedDate}T`)) {
        // Declare time for use by the surrounding module or function.
        const time = target.value.includes("T") ? target.value.slice(11, 16) : "09:00";
        // Perform the side effect or state update expressed on the following line.
        setNativeValue(target, `${selectedDate}T${time}`);
      }
    }
  }, true);
  // Perform the side effect or state update expressed on the following line.
  document.addEventListener("input", (event) => {
    // Check the condition (event.target?.matches?.('input[type="date"]')) and run the matching branch.
    if (event.target?.matches?.('input[type="date"]')) requestAnimationFrame(syncPickupDate);
  }, true);
  // Perform the side effect or state update expressed on the following line.
  syncPickupDate();
};
// Check the condition (document.readyState === "loading") and run the matching branch.
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", installPickupDateSync, { once: true });
else installPickupDateSync();
