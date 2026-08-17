import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function CustomerMfa() {
  const navigate = useNavigate();
  const location = useLocation();

  const userId = location.state?.userId || "";

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const verify = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!/^\d{4}$/.test(pin)) {
      setError("Enter the 4-digit PIN sent to your registered phone.");
      return;
    }

    if (!userId) {
      setError("Your login session is incomplete. Please log in again.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/mfa/customer/verify-pin",
        {
          userId,
          pin,
        }
      );

      if (response.data?.success) {
        /*
         * The existing login implementation should establish the
         * authenticated session/token after MFA verification.
         *
         * Reload the application so AuthContext can re-evaluate
         * the authenticated state.
         */
        window.location.href = "/dashboard";
      } else {
        setError(
          response.data?.message ||
            "Unable to verify the PIN."
        );
      }
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Incorrect or expired PIN."
      );
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError("");
    setMessage("");

    if (!userId) {
      setError("Your login session is incomplete. Please log in again.");
      return;
    }

    try {
      setResending(true);

      const response = await api.post(
        "/mfa/customer/send-pin",
        {
          userId,
        }
      );

      setMessage(
        response.data?.message ||
          "A new PIN has been sent."
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to send a new PIN."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
            Security Verification
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Verify your login
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            We sent a 4-digit verification PIN to your registered
            mobile number.
          </p>
        </div>

        <form
          onSubmit={verify}
          className="mt-8 space-y-5"
        >
          <div>
            <label
              htmlFor="login-pin"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              4-digit PIN
            </label>

            <input
              id="login-pin"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              value={pin}
              onChange={(event) =>
                setPin(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 4)
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="••••"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-700 px-5 py-4 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Verifying..."
              : "Verify & Continue"}
          </button>

          <button
            type="button"
            onClick={resend}
            disabled={resending}
            className="w-full rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {resending
              ? "Sending..."
              : "Send New PIN"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full text-sm font-semibold text-slate-500 hover:text-slate-900"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}
