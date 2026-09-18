import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSettings } from "../context/SettingsContext";
import { useTenant } from "../context/TenantContext";
import { requestPasswordReset, resetPasswordWithCode } from "../api/passwordResetApi";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { settings = {} } = useSettings() || {};
  const { tenant = {} } = useTenant() || {};
  const companyName = String(settings?.companyName || tenant?.name || tenant?.companyName || "Global Tours").trim();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const requestCode = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return toast.error("Enter a valid email address.");
    try {
      setLoading(true);
      const data = await requestPasswordReset({ email: normalizedEmail });
      toast.success(data?.message || "If an account exists, a reset code has been sent to your email.");
      setStep(2);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not send the reset email.");
    } finally { setLoading(false); }
  };

  const reset = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) return toast.error("Enter the 6-digit reset code from your email.");
    if (newPassword !== confirm) return toast.error("Passwords do not match.");
    if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[A-Z]/.test(newPassword)) return toast.error("Password must be at least 8 characters and include an uppercase letter and a number.");
    try {
      setLoading(true);
      const data = await resetPasswordWithCode({ email: email.trim().toLowerCase(), code, newPassword });
      toast.success(data?.message || "Password reset successfully.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Password reset failed.");
    } finally { setLoading(false); }
  };

  const resend = async () => {
    try {
      setResendLoading(true);
      const data = await requestPasswordReset({ email: email.trim().toLowerCase() });
      toast.success(data?.message || "A new reset code has been sent.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not resend the reset email.");
    } finally { setResendLoading(false); }
  };

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
