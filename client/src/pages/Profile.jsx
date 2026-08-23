import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

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

            <div className="min-w-0 rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="mt-2 break-all text-lg font-bold">{profile.email || "N/A"}</p>
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
