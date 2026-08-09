import { useState } from "react";

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem("adminSettings") || "{}"); }
    catch { return {}; }
  });

  const save = () => {
    localStorage.setItem("adminSettings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">System Settings</h1>
      <div className="bg-white rounded-xl shadow p-6 space-y-5">
        <label className="block">
          <span className="font-medium">Company display name</span>
          <input className="mt-2 w-full border rounded-lg p-3" value={settings.companyName || "Coherent Tours"} onChange={(e) => setSettings({...settings, companyName: e.target.value})} />
        </label>
        <label className="block">
          <span className="font-medium">Support email</span>
          <input className="mt-2 w-full border rounded-lg p-3" value={settings.supportEmail || ""} onChange={(e) => setSettings({...settings, supportEmail: e.target.value})} placeholder="support@example.com" />
        </label>
        <button onClick={save} className="px-5 py-3 rounded-lg bg-blue-600 text-white">Save settings</button>
        {saved && <span className="ml-3 text-green-600">Saved.</span>}
      </div>
    </div>
  );
}
