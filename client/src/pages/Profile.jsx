import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Mail, ShieldCheck, KeyRound } from "lucide-react";

const normalizeProfile = (response) =>
  response?.data?.user ||
  response?.data?.data ||
  response?.user ||
  response?.data ||
  null;

export default function Profile() {
  const { user, setUser, loading: authLoading } = useAuth();
  const userId = user?._id || user?.id || null;
  const [profile, setProfile] = useState(user);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [emailForm, setEmailForm] = useState({ newEmail: "", currentPassword: "" });
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [emailPending, setEmailPending] = useState(false);
  const [emailConfirming, setEmailConfirming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchProfile = async () => {
      setLoading(true);

      try {
        const response = await api.get("/users/profile");
        const nextProfile = normalizeProfile(response);

        if (!mounted) return;

        if (!nextProfile) {
          throw new Error("The profile response did not contain user data.");
        }

        setProfile(nextProfile);
        setForm({
          name: nextProfile.name || "",
          phone: nextProfile.phone || "",
        });
        setUser(nextProfile);
        localStorage.setItem("user", JSON.stringify(nextProfile));
      } catch (error) {
        console.error("Profile fetch error:", error);
        if (mounted && error.response?.status !== 401) {
          toast.error(
            error.response?.data?.message || "Unable to load your profile."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
    // setUser is intentionally excluded: AuthContext recreates that wrapper
    // function when auth state changes, which previously caused this request
    // to run repeatedly and made the profile appear to keep loading.

  }, [authLoading, userId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const phone = form.phone.trim();

    if (!name || !phone) {
      toast.error("Name and phone number are required.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      toast.error("Phone number must contain exactly 10 digits.");
      return;
    }

    setSaving(true);

    try {
      const response = await api.put("/users/profile", { name, phone });
      const updatedProfile = normalizeProfile(response);

      if (updatedProfile) {
        setProfile(updatedProfile);
        setForm({
          name: updatedProfile.name || "",
          phone: updatedProfile.phone || "",
        });
        setUser(updatedProfile);
        localStorage.setItem("user", JSON.stringify(updatedProfile));
      }

      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="rounded-2xl bg-white px-8 py-7 text-center shadow-lg">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-green-700" />
          <p className="text-lg font-semibold text-gray-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="font-semibold text-red-600">
          Please login to view your profile.
        </p>
      </div>
    );
  }

  const role =
    profile.role?.name ||
    profile.role ||
    profile.legacyRole ||
    profile.roleId?.name ||
    "customer";

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-xl sm:p-8">
        <h1 className="mb-2 text-3xl font-bold text-green-800 sm:text-4xl">My Profile</h1>
        <p className="mb-8 text-gray-600">Keep your contact information up to date.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block min-w-0">
              <span className="mb-2 block text-sm font-medium text-gray-600">Full Name</span>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                className="input w-full"
                required
              />
            </label>

            <label className="block min-w-0">
              <span className="mb-2 block text-sm font-medium text-gray-600">Phone Number</span>
              <input
                name="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
                className="input w-full"
                required
              />
            </label>

            <div className="min-w-0 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 md:col-span-2">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-700 p-2 text-white"><Mail size={20} /></div>
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Account Email</p>
                <p className="mt-1 break-all text-lg font-bold text-slate-900">{profile.email || "N/A"}</p>
                <p className="mt-1 text-sm text-slate-600">This email is used for login and password recovery.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">New email address</span>
                <input
                  type="email"
                  value={emailForm.newEmail}
                  onChange={(event) => setEmailForm((current) => ({ ...current, newEmail: event.target.value }))}
                  autoComplete="email"
                  placeholder="new@email.com"
                  className="input w-full"
                  disabled={emailPending || emailConfirming}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Current password</span>
                <input
                  type="password"
                  value={emailForm.currentPassword}
                  onChange={(event) => setEmailForm((current) => ({ ...current, currentPassword: event.target.value }))}
                  autoComplete="current-password"
                  placeholder="Confirm your current password"
                  className="input w-full"
                  disabled={emailPending || emailConfirming}
                />
              </label>
            </div>

            {!emailPending ? (
              <button
                type="button"
                onClick={async () => {
                  const newEmail = emailForm.newEmail.trim().toLowerCase();
                  if (!/^\S+@\S+\.\S+$/.test(newEmail)) return toast.error("Enter a valid new email address.");
                  if (!emailForm.currentPassword) return toast.error("Enter your current password to authorize the change.");
                  setEmailPending(true);
                  try {
                    const response = await api.post("/auth/email-change/request", {
                      newEmail,
                      currentPassword: emailForm.currentPassword,
                    });
                    toast.success(response.data?.message || "Verification code sent.");
                  } catch (error) {
                    setEmailPending(false);
                    toast.error(error.response?.data?.message || "Unable to start the email change.");
                  }
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                <ShieldCheck size={18} /> Send verification code
              </button>
            ) : (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">Check your new email</p>
                <p className="mt-1 text-sm text-slate-600">Enter the 6-digit code we sent to {emailForm.newEmail.trim().toLowerCase()}. The code expires in 10 minutes.</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={emailVerificationCode}
                    onChange={(event) => setEmailVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    className="input w-full sm:max-w-xs"
                    autoComplete="one-time-code"
                    disabled={emailConfirming}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!/^\d{6}$/.test(emailVerificationCode)) return toast.error("Enter the 6-digit verification code.");
                      setEmailConfirming(true);
                      try {
                        const response = await api.post("/auth/email-change/confirm", { code: emailVerificationCode });
                        const updatedUser = normalizeProfile(response) || response.data?.user;
                        if (updatedUser) {
                          setProfile(updatedUser);
                          setUser(updatedUser);
                          localStorage.setItem("user", JSON.stringify(updatedUser));
                        }
                        setEmailForm({ newEmail: "", currentPassword: "" });
                        setEmailVerificationCode("");
                        setEmailPending(false);
                        toast.success(response.data?.message || "Email address changed successfully.");
                      } catch (error) {
                        toast.error(error.response?.data?.message || "Unable to confirm the email change.");
                      } finally {
                        setEmailConfirming(false);
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                    disabled={emailConfirming}
                  >
                    <KeyRound size={18} /> {emailConfirming ? "Verifying..." : "Confirm email"}
                  </button>
                </div>
              </div>
            )}
          </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="mt-2 break-words text-lg font-bold capitalize">{role}</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="mt-2 text-lg font-bold">
                {profile.createdAt ? new Date(profile.createdAt).toDateString() : "N/A"}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-yellow-100 to-green-100 p-5 sm:p-6">
            <h2 className="text-xl font-bold sm:text-2xl">Loyalty Rewards</h2>
            <p className="mt-4 text-lg">
              Points:
              <span className="ml-2 font-bold text-green-700">{profile.loyaltyPoints || 0}</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
