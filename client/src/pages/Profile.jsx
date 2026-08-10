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
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(user);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [loading, setLoading] = useState(Boolean(user));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
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

        if (mounted && nextProfile) {
          setProfile(nextProfile);
          setForm({
            name: nextProfile.name || "",
            phone: nextProfile.phone || "",
          });
          setUser(nextProfile);
          localStorage.setItem("user", JSON.stringify(nextProfile));
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        if (error.response?.status !== 401) {
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
  }, [user, setUser]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and phone number are required.");
      return;
    }

    setSaving(true);

    try {
      const response = await api.put("/users/profile", {
        name: form.name.trim(),
        phone: form.phone.trim(),
      });

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-4xl font-bold text-green-800">My Profile</h1>
        <p className="mb-8 text-gray-600">
          Keep your contact information up to date.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-600">
                Full Name
              </span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-600">
                Phone Number
              </span>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </label>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="mt-2 break-all text-lg font-bold">
                {profile.email || "N/A"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="mt-2 text-lg font-bold capitalize">{role}</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="mt-2 text-lg font-bold">
                {profile.createdAt
                  ? new Date(profile.createdAt).toDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-yellow-100 to-green-100 p-6">
            <h2 className="text-2xl font-bold">Loyalty Rewards</h2>
            <p className="mt-4 text-lg">
              Points:
              <span className="ml-2 font-bold text-green-700">
                {profile.loyaltyPoints || 0}
              </span>
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-green-700 px-6 py-3 font-bold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
