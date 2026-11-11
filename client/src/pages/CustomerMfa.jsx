/**
 * Purpose: Customer Mfa page-level UI component. Main declarations: CustomerMfa, handleVerify, resendPin.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useState } from "react";
// Load react-router-dom so this module can use its exported dependencies.
import { useNavigate } from "react-router-dom";
// Load react-toastify so this module can use its exported dependencies.
import { toast } from "react-toastify";
// Load ../api/axios so this module can use its exported dependencies.
import api from "../api/axios";

// Define CustomerMfa; its parameters and body implement this operation.
export default function CustomerMfa({ userId, devPin }) {
  // Declare navigate for use by the surrounding module or function.
  const navigate = useNavigate();
  // Declare [pin, setPin] for use by the surrounding module or function.
  const [pin, setPin] = useState("");
  // Declare [error, setError] for use by the surrounding module or function.
  const [error, setError] = useState("");
  // Declare [loading, setLoading] for use by the surrounding module or function.
  const [loading, setLoading] = useState(false);

  // Declare handleVerify for use by the surrounding module or function.
  const handleVerify = async (e) => {
    // Perform the side effect or state update expressed on the following line.
    e.preventDefault();
    // Perform the side effect or state update expressed on the following line.
    setError("");
    // Check the condition (!userId) and run the matching branch.
    if (!userId) return setError("Your login verification session has expired. Please login again.");
    // Check the condition (!/^\d{4}$/.test(pin)) and run the matching branch.
    if (!/^\d{4}$/.test(pin)) return setError("Enter the 4-digit PIN sent to your registered phone.");

    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Perform the side effect or state update expressed on the following line.
      setLoading(true);
      // Declare { data } for use by the surrounding module or function.
      const { data } = await api.post("/mfa/customer/verify-pin", { userId, pin });
      // Check the condition (data.user) and run the matching branch.
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      // Check the condition (data.user?.tenantId) and run the matching branch.
      if (data.user?.tenantId) localStorage.setItem("tenantId", String(data.user.tenantId?._id || data.user.tenantId));
      // Check the condition (data.user?.tenantSlug) and run the matching branch.
      if (data.user?.tenantSlug) localStorage.setItem("tenantSlug", String(data.user.tenantSlug));

      // Perform the side effect or state update expressed on the following line.
      toast.success("Login successful");
      // Perform the side effect or state update expressed on the following line.
      window.location.replace("/customer/dashboard");
    } catch (err) {
      // Perform the side effect or state update expressed on the following line.
      setError(err?.response?.data?.message || err?.message || "Incorrect or expired PIN.");
    } finally {
      // Perform the side effect or state update expressed on the following line.
      setLoading(false);
    }
  };

  // Declare resendPin for use by the surrounding module or function.
  const resendPin = async () => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Perform the side effect or state update expressed on the following line.
      setError("");
      // Perform the side effect or state update expressed on the following line.
      setLoading(true);
      // Declare { data } for use by the surrounding module or function.
      const { data } = await api.post("/mfa/customer/send-pin", { userId });
      // Perform the side effect or state update expressed on the following line.
      toast.info(data?.message || "A new verification PIN has been sent.");
    } catch (err) {
      // Perform the side effect or state update expressed on the following line.
      setError(err?.response?.data?.message || "Unable to send a new PIN.");
    } finally {
      // Perform the side effect or state update expressed on the following line.
      setLoading(false);
    }
  };

  // Return the expression shown below to the caller.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center">Verify your login</h1>
        <p className="text-center mt-3 text-gray-600">Enter the 4-digit verification PIN sent to your registered mobile number.</p>
        {devPin && <div className="mt-4 rounded-xl bg-yellow-100 p-3 text-center font-bold text-yellow-900">Development PIN: {devPin}</div>}
        <form onSubmit={handleVerify}>
          <input
            aria-label="Login verification PIN"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="border rounded-lg w-full p-3 mt-6 text-center text-xl tracking-widest"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          />
          {error && <p className="text-red-600 mt-3 text-center">{error}</p>}
          <button disabled={loading} className="bg-blue-600 text-white w-full mt-5 p-3 rounded-lg">
            {loading ? "Checking..." : "Verify & Continue"}
          </button>
        </form>
        <button onClick={resendPin} disabled={loading} className="w-full mt-3 text-blue-600 disabled:opacity-50">Send New PIN</button>
        <button onClick={() => navigate("/login")} className="w-full mt-3 text-gray-500">Back to Login</button>
      </div>
    </div>
  );
}
