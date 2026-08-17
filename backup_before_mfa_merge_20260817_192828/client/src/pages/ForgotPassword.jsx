import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { requestPasswordReset, resetPasswordWithCode } from "../api/passwordResetApi";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const requestCode = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return toast.error("Enter a valid email address.");
    if (!/^\d{10}$/.test(normalizedPhone)) return toast.error("Enter your 10-digit registered phone number.");

    try {
      setLoading(true);
      const data = await requestPasswordReset({ email: normalizedEmail, phone: normalizedPhone });
      toast.success(data?.message || "If the account details are valid, a reset code has been sent.");
      setStep(2);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const reset = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) return toast.error("Enter the 6-digit reset code.");
    if (newPassword !== confirm) return toast.error("Passwords do not match.");
    if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[A-Z]/.test(newPassword)) return toast.error("Password must be at least 8 characters and include an uppercase letter and a number.");

    try {
      setLoading(true);
      const data = await resetPasswordWithCode({ email: email.trim().toLowerCase(), phone: phone.trim(), code, newPassword });
      toast.success(data?.message || "Password reset successfully.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-green-900">Reset your password</h1>
        <p className="mt-2 text-gray-600">Verify your registered email and phone before resetting your password.</p>

        {step === 1 ? (
          <form onSubmit={requestCode} className="mt-6 space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Registered email address" className="w-full rounded-lg border p-3" required />
            <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} inputMode="numeric" placeholder="10-digit registered phone" className="w-full rounded-lg border p-3" required />
            <button disabled={loading} className="w-full rounded-lg bg-green-700 py-3 font-semibold text-white disabled:opacity-50">{loading ? "Sending..." : "Send reset code"}</button>
          </form>
        ) : (
          <form onSubmit={reset} className="mt-6 space-y-4">
            <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} inputMode="numeric" placeholder="6-digit code" className="w-full rounded-lg border p-3 text-center tracking-widest" required />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="w-full rounded-lg border p-3" required />
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" className="w-full rounded-lg border p-3" required />
            <button disabled={loading} className="w-full rounded-lg bg-green-700 py-3 font-semibold text-white disabled:opacity-50">{loading ? "Resetting..." : "Reset password"}</button>
            <button type="button" onClick={() => setStep(1)} className="w-full rounded-lg border py-3">Use different account details</button>
          </form>
        )}

        <button type="button" onClick={() => navigate("/login")} className="mt-5 w-full text-sm font-semibold text-green-700">Back to login</button>
      </div>
    </div>
  );
}
