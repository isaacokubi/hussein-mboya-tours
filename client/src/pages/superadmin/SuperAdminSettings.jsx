import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import {
  Save, RefreshCw, Shield, Database, Bell, CreditCard, Building2, Settings, CheckCircle, AlertTriangle, Percent
} from "lucide-react";
import { getSettings, updateSettings } from "../../api/superAdminApi";

const Card = ({ icon: Icon, title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
    <div className="flex items-center gap-3">
      <div className="p-3 rounded-xl bg-gray-100"><Icon size={22} /></div>
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
    {children}
  </div>
);

const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center justify-between p-3 rounded-xl border cursor-pointer">
    <span className="text-sm">{label}</span>
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="w-5 h-5" />
  </label>
);

const RateInput = ({ label, description, value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium">{label}</label>
    <div className="relative">
      <input type="number" min="0" max="100" step="0.01" className="w-full border rounded-xl p-3 pr-10" value={value ?? 0} onChange={e => onChange(Number(e.target.value))} />
      <span className="absolute right-3 top-3 text-gray-500">%</span>
    </div>
    <p className="text-xs text-gray-500">{description}</p>
  </div>
);

export default function SuperAdminSettings() {
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      setSettings(data.settings || data || {});
    } catch (err) {
      console.error(err);
      toast.error("Failed to load system settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const save = async () => {
    try {
      setSaving(true);
      await updateSettings({
        ...settings,
        taxRate: Number(settings.taxRate ?? 0),
        taxServiceType: settings.taxServiceType || "service_fee",
        bookingDepositPercentage: Number(settings.bookingDepositPercentage ?? 30),
        defaultCommissionRate: Number(settings.defaultCommissionRate ?? 10),
      });
      toast.success("Global system rates and settings saved successfully.");
      await load();
    } catch (err) {
      console.error("SUPERADMIN SETTINGS SAVE ERROR", err);
      toast.error(err?.response?.data?.message || "Failed saving settings.");
    } finally { setSaving(false); }
  };

  const runMaintenance = async action => {
    try {
      if (!window.confirm(action === "backup" ? "Create database backup now?" : "Clear system cache now?")) return;
      toast.info("Processing maintenance request...");
      const endpoint = action === "backup" ? "/api/superadmin/maintenance/backup" : "/api/superadmin/maintenance/cache";
      const response = await fetch(endpoint, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" } });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Maintenance failed");
      toast.success(action === "backup" ? "Database backup completed successfully." : "System cache cleared successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Maintenance failed. Check system logs.");
    }
  };

  if (loading) return <div className="p-8 flex items-center gap-3"><RefreshCw className="animate-spin" /> Loading settings...</div>;

  return (
    <div className="space-y-8 p-6">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Platform Settings</h1>
            <p className="text-gray-500 mt-2">Manage {settings?.companyName || "Company"} global configuration.</p>
          </div>
          <button onClick={load} className="flex gap-2 items-center border px-4 py-2 rounded-xl"><RefreshCw size={18} /> Refresh</button>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm"><CheckCircle size={16} /> System configuration active</div>
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <Percent className="mt-1 text-blue-700" size={22} />
          <div>
            <h2 className="font-semibold text-blue-900">Global Business Rates</h2>
            <p className="mt-1 text-sm text-blue-800">These rates are controlled centrally by SuperAdmin and are used throughout eligible booking, payment, commission and reporting calculations. Individual agents cannot override the global commission rate.</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card icon={Percent} title="Agent Commission">
          <RateInput label="Global agent commission" description="Applied to every new agent commission calculation. This is the system-wide default." value={settings.defaultCommissionRate} onChange={v => update("defaultCommissionRate", v)} />
        </Card>
        <Card icon={CreditCard} title="Booking Deposit">
          <RateInput label="Default booking deposit" description="The default percentage of a booking total requested as the initial deposit. The remaining balance can be paid later." value={settings.bookingDepositPercentage} onChange={v => update("bookingDepositPercentage", v)} />
        </Card>
        <Card icon={CreditCard} title="Tax / Service Rate">
          <RateInput label="Global tax/service rate" description="A centrally controlled percentage added to eligible booking totals when the booking/payment calculation uses the global rate." value={settings.taxRate} onChange={v => update("taxRate", v)} />
          <div className="space-y-2">
            <label className="block text-sm font-medium">Charge type</label>
            <select className="w-full border rounded-xl p-3" value={settings.taxServiceType || "service_fee"} onChange={e => update("taxServiceType", e.target.value)}>
              <option value="service_fee">Service fee</option>
              <option value="tax">Tax</option>
              <option value="tax_and_service">Tax / service charge</option>
            </select>
            <p className="text-xs text-gray-500">This controls how the global percentage is identified in system configuration. It does not automatically make a charge mandatory on bookings that do not use the rate.</p>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card icon={Building2} title="General Configuration">
          <input className="w-full border rounded-xl p-3" placeholder="Company Name" value={settings.companyName || ""} onChange={e => update("companyName", e.target.value)} />
          <input className="w-full border rounded-xl p-3" placeholder="Support Email" value={settings.supportEmail || ""} onChange={e => update("supportEmail", e.target.value)} />
          <input className="w-full border rounded-xl p-3" placeholder="Support Phone" value={settings.supportPhone || ""} onChange={e => update("supportPhone", e.target.value)} />
          <select className="w-full border rounded-xl p-3" value={settings.currency || "KES"} onChange={e => update("currency", e.target.value)}><option>KES</option><option>USD</option><option>EUR</option></select>
        </Card>
        <Card icon={CreditCard} title="Booking & Payments">
          <select className="w-full border rounded-xl p-3" value={settings.bookingStatus || "confirmed"} onChange={e => update("bookingStatus", e.target.value)}><option value="pending">Pending</option><option value="confirmed">Confirmed</option></select>
          <input className="w-full border rounded-xl p-3" placeholder="Payment Provider" value={settings.paymentProvider || ""} onChange={e => update("paymentProvider", e.target.value)} />
        </Card>
        <Card icon={Bell} title="Notifications">
          <Toggle checked={settings.emailNotifications ?? true} label="Booking and payment email notifications" onChange={v => update("emailNotifications", v)} />
          <Toggle checked={settings.systemAlerts ?? true} label="System alerts" onChange={v => update("systemAlerts", v)} />
        </Card>
        <Card icon={Shield} title="Security Controls">
          <Toggle checked={settings.twoFactor ?? false} label="Enable Two Factor Authentication" onChange={v => update("twoFactor", v)} />
          <div className="flex gap-2 text-sm text-gray-600"><AlertTriangle size={16} /> Security changes are recorded in audit logs</div>
        </Card>
        <Card icon={Database} title="System Maintenance">
          <button onClick={() => runMaintenance("backup")} className="w-full border rounded-xl p-3 hover:bg-gray-100">Create Database Backup</button>
          <button onClick={() => runMaintenance("cache")} className="w-full border rounded-xl p-3 hover:bg-gray-100">Clear System Cache</button>
        </Card>
        <Card icon={Settings} title="System Information">
          <div className="text-sm space-y-2"><p>Environment: Production</p><p>Configuration management enabled</p><p>Global rates controlled by SuperAdmin</p><p>Audit logging active</p></div>
        </Card>
      </div>

      <div className="flex justify-end"><button disabled={saving} onClick={save} className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-xl disabled:opacity-50"><Save size={18} /> {saving ? "Saving..." : "Save Settings"}</button></div>
    </div>
  );
}
