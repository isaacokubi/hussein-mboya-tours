/**
 * Purpose: Profile page-level UI component. Main declarations: normalizeProfile, Profile, fetchProfile, handleChange, handleSubmit.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useEffect, useState } from "react";
// Load react-toastify so this module can use its exported dependencies.
import { toast } from "react-toastify";

// Load ../api/axios so this module can use its exported dependencies.
import api from "../api/axios";
// Load ../context/AuthContext so this module can use its exported dependencies.
import { useAuth } from "../context/AuthContext";
// Load lucide-react so this module can use its exported dependencies.
import { Mail, ShieldCheck, KeyRound } from "lucide-react";

// Declare normalizeProfile for use by the surrounding module or function.
const normalizeProfile = (response) =>
  response?.data?.user ||
  response?.data?.data ||
  response?.user ||
  response?.data ||
  null;

// Define Profile; its parameters and body implement this operation.
export default function Profile() {
  // Declare { user, setUser, loading: authLoading } for use by the surrounding module or function.
  const { user, setUser, loading: authLoading } = useAuth();
  // Declare userId for use by the surrounding module or function.
  const userId = user?._id || user?.id || null;
  // Declare [profile, setProfile] for use by the surrounding module or function.
  const [profile, setProfile] = useState(user);
  // Declare [form, setForm] for use by the surrounding module or function.
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  // Declare [emailForm, setEmailForm] for use by the surrounding module or function.
  const [emailForm, setEmailForm] = useState({ newEmail: "", currentPassword: "" });
  // Declare [emailVerificationCode, setEmailVerificationCode] for use by the surrounding module or function.
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  // Declare [emailPending, setEmailPending] for use by the surrounding module or function.
  const [emailPending, setEmailPending] = useState(false);
  // Declare [emailConfirming, setEmailConfirming] for use by the surrounding module or function.
  const [emailConfirming, setEmailConfirming] = useState(false);
  // Declare [loading, setLoading] for use by the surrounding module or function.
  const [loading, setLoading] = useState(true);
  // Declare [saving, setSaving] for use by the surrounding module or function.
  const [saving, setSaving] = useState(false);

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Check the condition (authLoading) and run the matching branch.
    if (authLoading) return;

    // Check the condition (!userId) and run the matching branch.
    if (!userId) {
      // Perform the side effect or state update expressed on the following line.
      setProfile(null);
      // Perform the side effect or state update expressed on the following line.
      setLoading(false);
      // Return the result to the caller.
      return;
    }

    // Declare mounted for use by the surrounding module or function.
    let mounted = true;

    // Declare fetchProfile for use by the surrounding module or function.
    const fetchProfile = async () => {
      // Perform the side effect or state update expressed on the following line.
      setLoading(true);

      // Run this operation with a dedicated error-handling path for failures.
      try {
        // Declare response for use by the surrounding module or function.
        const response = await api.get("/users/profile");
        // Declare nextProfile for use by the surrounding module or function.
        const nextProfile = normalizeProfile(response);

        // Check the condition (!mounted) and run the matching branch.
        if (!mounted) return;

        // Check the condition (!nextProfile) and run the matching branch.
        if (!nextProfile) {
          // Stop the current operation by raising a new Error instance.
          throw new Error("The profile response did not contain user data.");
        }

        // Perform the side effect or state update expressed on the following line.
        setProfile(nextProfile);
        // Perform the side effect or state update expressed on the following line.
        setForm({
          name: nextProfile.name || "",
          phone: nextProfile.phone || "",
        });
        // Perform the side effect or state update expressed on the following line.
        setUser(nextProfile);
        // Perform the side effect or state update expressed on the following line.
        localStorage.setItem("user", JSON.stringify(nextProfile));
      } catch (error) {
        // Perform the side effect or state update expressed on the following line.
        console.error("Profile fetch error:", error);
        // Check the condition (mounted && error.response?.status !== 401) and run the matching branch.
        if (mounted && error.response?.status !== 401) {
          // Perform the side effect or state update expressed on the following line.
          toast.error(
            error.response?.data?.message || "Unable to load your profile."
          );
        }
      } finally {
        // Check the condition (mounted) and run the matching branch.
        if (mounted) setLoading(false);
      }
    };

    // Perform the side effect or state update expressed on the following line.
    fetchProfile();

    // Return the expression shown below to the caller.
    return () => {
      // Perform the side effect or state update expressed on the following line.
      mounted = false;
    };
    // setUser is intentionally excluded: AuthContext recreates that wrapper
    // function when auth state changes, which previously caused this request
    // to run repeatedly and made the profile appear to keep loading.

  }, [authLoading, userId]);

  // Declare handleChange for use by the surrounding module or function.
  const handleChange = (event) => {
    // Declare { name, value } for use by the surrounding module or function.
    const { name, value } = event.target;
    // Perform the side effect or state update expressed on the following line.
    setForm((current) => ({ ...current, [name]: value }));
  };

  // Declare handleSubmit for use by the surrounding module or function.
  const handleSubmit = async (event) => {
    // Perform the side effect or state update expressed on the following line.
    event.preventDefault();

    // Declare name for use by the surrounding module or function.
    const name = form.name.trim();
    // Declare phone for use by the surrounding module or function.
    const phone = form.phone.trim();

    // Check the condition (!name || !phone) and run the matching branch.
    if (!name || !phone) {
      // Perform the side effect or state update expressed on the following line.
      toast.error("Name and phone number are required.");
      // Return the result to the caller.
      return;
    }

    // Check the condition (!/^\d{10}$/.test(phone)) and run the matching branch.
    if (!/^\d{10}$/.test(phone)) {
      // Perform the side effect or state update expressed on the following line.
      toast.error("Phone number must contain exactly 10 digits.");
      // Return the result to the caller.
      return;
    }

    // Perform the side effect or state update expressed on the following line.
    setSaving(true);

    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare response for use by the surrounding module or function.
      const response = await api.put("/users/profile", { name, phone });
      // Declare updatedProfile for use by the surrounding module or function.
      const updatedProfile = normalizeProfile(response);

      // Check the condition (updatedProfile) and run the matching branch.
      if (updatedProfile) {
        // Perform the side effect or state update expressed on the following line.
        setProfile(updatedProfile);
        // Perform the side effect or state update expressed on the following line.
        setForm({
          name: updatedProfile.name || "",
          phone: updatedProfile.phone || "",
        });
        // Perform the side effect or state update expressed on the following line.
        setUser(updatedProfile);
        // Perform the side effect or state update expressed on the following line.
        localStorage.setItem("user", JSON.stringify(updatedProfile));
      }

      // Perform the side effect or state update expressed on the following line.
      toast.success("Profile updated successfully.");
    } catch (error) {
      // Perform the side effect or state update expressed on the following line.
      toast.error(
        error.response?.data?.message || "Unable to update your profile."
      );
    } finally {
      // Perform the side effect or state update expressed on the following line.
      setSaving(false);
    }
  };

  // Check the condition (authLoading || loading) and run the matching branch.
  if (authLoading || loading) {
    // Return the expression shown below to the caller.
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="rounded-2xl bg-white px-8 py-7 text-center shadow-lg">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-green-700" />
          <p className="text-lg font-semibold text-gray-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Check the condition (!profile) and run the matching branch.
  if (!profile) {
    // Return the expression shown below to the caller.
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="font-semibold text-red-600">
          Please login to view your profile.
        </p>
      </div>
    );
  }

  // Declare role for use by the surrounding module or function.
  const role =
    profile.role?.name ||
    profile.role ||
    profile.legacyRole ||
    profile.roleId?.name ||
    "customer";

  // Return the expression shown below to the caller.
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
