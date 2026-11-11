/**
 * Purpose: Forgot Password page-level UI component. Main declarations: ForgotPassword, requestCode, reset, resend.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useState } from "react";
// Load react-router-dom so this module can use its exported dependencies.
import { useNavigate } from "react-router-dom";
// Load react-toastify so this module can use its exported dependencies.
import { toast } from "react-toastify";
// Load ../context/SettingsContext so this module can use its exported dependencies.
import { useSettings } from "../context/SettingsContext";
// Load ../context/TenantContext so this module can use its exported dependencies.
import { useTenant } from "../context/TenantContext";
// Load ../api/passwordResetApi so this module can use its exported dependencies.
import { requestPasswordReset, resetPasswordWithCode } from "../api/passwordResetApi";

// Define ForgotPassword; its parameters and body implement this operation.
export default function ForgotPassword() {
  // Declare navigate for use by the surrounding module or function.
  const navigate = useNavigate();
  // Declare { settings = {} } for use by the surrounding module or function.
  const { settings = {} } = useSettings() || {};
  // Declare { tenant = {} } for use by the surrounding module or function.
  const { tenant = {} } = useTenant() || {};
  // Declare companyName for use by the surrounding module or function.
  const companyName = String(settings?.companyName || tenant?.name || tenant?.companyName || "Hussein Mboya Tours").trim();
  // Declare [step, setStep] for use by the surrounding module or function.
  const [step, setStep] = useState(1);
  // Declare [email, setEmail] for use by the surrounding module or function.
  const [email, setEmail] = useState("");
  // Declare [code, setCode] for use by the surrounding module or function.
  const [code, setCode] = useState("");
  // Declare [newPassword, setNewPassword] for use by the surrounding module or function.
  const [newPassword, setNewPassword] = useState("");
  // Declare [confirm, setConfirm] for use by the surrounding module or function.
  const [confirm, setConfirm] = useState("");
  // Declare [loading, setLoading] for use by the surrounding module or function.
  const [loading, setLoading] = useState(false);
  // Declare [resendLoading, setResendLoading] for use by the surrounding module or function.
  const [resendLoading, setResendLoading] = useState(false);

  // Declare requestCode for use by the surrounding module or function.
  const requestCode = async (event) => {
    // Perform the side effect or state update expressed on the following line.
    event.preventDefault();
    // Declare normalizedEmail for use by the surrounding module or function.
    const normalizedEmail = email.trim().toLowerCase();
    // Check the condition (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) and run the matching branch.
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return toast.error("Enter a valid email address.");
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Perform the side effect or state update expressed on the following line.
      setLoading(true);
      // Declare data for use by the surrounding module or function.
      const data = await requestPasswordReset({ email: normalizedEmail });
      // Perform the side effect or state update expressed on the following line.
      toast.success(data?.message || "If an account exists, a reset code has been sent to your email.");
      // Perform the side effect or state update expressed on the following line.
      setStep(2);
    } catch (error) {
      // Perform the side effect or state update expressed on the following line.
      toast.error(error?.response?.data?.message || "Could not send the reset email.");
    } finally { setLoading(false); }
  };

  // Declare reset for use by the surrounding module or function.
  const reset = async (event) => {
    // Perform the side effect or state update expressed on the following line.
    event.preventDefault();
    // Check the condition (!/^\d{6}$/.test(code)) and run the matching branch.
    if (!/^\d{6}$/.test(code)) return toast.error("Enter the 6-digit reset code from your email.");
    // Check the condition (newPassword !== confirm) and run the matching branch.
    if (newPassword !== confirm) return toast.error("Passwords do not match.");
    // Check the condition (newPassword.length < 8 || !/\d/.test(newPassword) || !/[A-Z]/.test(new) and run the matching branch.
    if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[A-Z]/.test(newPassword)) return toast.error("Password must be at least 8 characters and include an uppercase letter and a number.");
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Perform the side effect or state update expressed on the following line.
      setLoading(true);
      // Declare data for use by the surrounding module or function.
      const data = await resetPasswordWithCode({ email: email.trim().toLowerCase(), code, newPassword });
      // Perform the side effect or state update expressed on the following line.
      toast.success(data?.message || "Password reset successfully.");
      // Perform the side effect or state update expressed on the following line.
      navigate("/login", { replace: true });
    } catch (error) {
      // Perform the side effect or state update expressed on the following line.
      toast.error(error?.response?.data?.message || "Password reset failed.");
    } finally { setLoading(false); }
  };

  // Declare resend for use by the surrounding module or function.
  const resend = async () => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Perform the side effect or state update expressed on the following line.
      setResendLoading(true);
      // Declare data for use by the surrounding module or function.
      const data = await requestPasswordReset({ email: email.trim().toLowerCase() });
      // Perform the side effect or state update expressed on the following line.
      toast.success(data?.message || "A new reset code has been sent.");
    } catch (error) {
      // Perform the side effect or state update expressed on the following line.
      toast.error(error?.response?.data?.message || "Could not resend the reset email.");
    } finally { setResendLoading(false); }
  };

  // Return the expression shown below to the caller.
  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-green-900">Reset your password</h1>
        <p className="mt-2 text-gray-600">Enter the email address on your {companyName} account. We will send a secure reset code by email.</p>
        {step === 1 ? (
          <form onSubmit={requestCode} className="mt-6 space-y-4">
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Registered email address" className="w-full rounded-lg border p-3" required />
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-green-700 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Sending reset email…" : "Email me a reset code"}</button>
          </form>
        ) : (
          <form onSubmit={reset} className="mt-6 space-y-4">
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Check <strong>{email}</strong> for your 6-digit reset code. It expires in 10 minutes.</div>
            <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code" className="w-full rounded-lg border p-3 text-center tracking-widest" required />
            <input type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="w-full rounded-lg border p-3" required />
            <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" className="w-full rounded-lg border p-3" required />
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-green-700 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Resetting password…" : "Reset password"}</button>
            <button type="button" onClick={resend} disabled={resendLoading || loading} className="w-full rounded-lg border py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50">{resendLoading ? "Resending…" : "Resend reset code"}</button>
            <button type="button" onClick={() => setStep(1)} disabled={loading || resendLoading} className="w-full rounded-lg border py-3 disabled:opacity-50">Use a different email</button>
          </form>
        )}
        <button type="button" onClick={() => navigate("/login")} className="mt-5 w-full text-sm font-semibold text-green-700">Back to login</button>
      </div>
    </div>
  );
}
