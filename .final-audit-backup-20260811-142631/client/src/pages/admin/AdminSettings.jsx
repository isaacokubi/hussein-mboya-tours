import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSettings,
  updateSettings,
} from "../../api/settingsApi";

const DEFAULTS = {
  companyName: "Coherent Tours",
  supportEmail: "",
  supportPhone: "+254 733 439 362",
  currency: "KES",
  timezone: "Africa/Nairobi",
  bookingNotifications: true,
  paymentNotifications: true,
};

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: getSettings,
  });

  useEffect(() => {
    const serverSettings = data?.data || data?.settings;
    if (serverSettings) {
      setSettings((current) => ({
        ...current,
        ...serverSettings,
      }));
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (response) => {
      const savedSettings = response?.data || response?.settings;
      if (savedSettings) {
        setSettings((current) => ({
          ...current,
          ...savedSettings,
        }));
      }
      queryClient.invalidateQueries({
        queryKey: ["admin-settings"],
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    },
    onError: (error) => {
      setSaved(false);
      console.error("SETTINGS SAVE ERROR:", error?.response?.data || error);
    },
  });

  const update = (key, value) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  if (isLoading) {
    return <div className="p-6">Loading system settings...</div>;
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600">
        Failed to load system settings.
      </div>
    );
  }

  return (
    <section className="p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">System Settings</h1>
      <p className="text-gray-600 mb-6">
        Manage the operational settings used by the tours system.
      </p>

      <div className="bg-white rounded-xl shadow p-6 space-y-5">
        <label className="block">
          <span className="font-medium">Company display name</span>
          <input
            className="mt-2 w-full border rounded-lg p-3"
            value={settings.companyName}
            onChange={(e) => update("companyName", e.target.value)}
          />
        </label>

        <label className="block">
          <span className="font-medium">Support email</span>
          <input
            type="email"
            className="mt-2 w-full border rounded-lg p-3"
            value={settings.supportEmail}
            onChange={(e) => update("supportEmail", e.target.value)}
            placeholder="support@example.com"
          />
        </label>

        <label className="block">
          <span className="font-medium">Support phone</span>
          <input
            className="mt-2 w-full border rounded-lg p-3"
            value={settings.supportPhone}
            onChange={(e) => update("supportPhone", e.target.value)}
          />
        </label>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="font-medium">Currency</span>
            <input
              className="mt-2 w-full border rounded-lg p-3"
              value={settings.currency}
              onChange={(e) =>
                update("currency", e.target.value.toUpperCase())
              }
            />
          </label>

          <label className="block">
            <span className="font-medium">Timezone</span>
            <input
              className="mt-2 w-full border rounded-lg p-3"
              value={settings.timezone}
              onChange={(e) => update("timezone", e.target.value)}
            />
          </label>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={Boolean(settings.bookingNotifications)}
            onChange={(e) =>
              update("bookingNotifications", e.target.checked)
            }
          />
          <span>Enable booking notifications</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={Boolean(settings.paymentNotifications)}
            onChange={(e) =>
              update("paymentNotifications", e.target.checked)
            }
          />
          <span>Enable payment notifications</span>
        </label>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => mutation.mutate(settings)}
            disabled={mutation.isPending}
            className="px-5 py-3 rounded-lg bg-blue-600 text-white disabled:opacity-50"
          >
            {mutation.isPending ? "Saving..." : "Save settings"}
          </button>

          {saved && (
            <span className="text-green-600">
              Settings saved successfully.
            </span>
          )}

          {mutation.isError && (
            <span className="text-red-600">
              Failed to save settings.
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
