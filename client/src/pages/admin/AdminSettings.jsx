import { useSettings } from "../../context/SettingsContext";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Globe2, Phone, Save, ShieldCheck, WalletCards } from "lucide-react";
import { toast } from "react-toastify";
import { getSettings, updateSettings } from "../../api/settingsApi";

export default function AdminSettings() {
  const qc = useQueryClient();
  const { settings: globalSettings = {} } = useSettings();
  const DEFAULTS = {
    companyName: globalSettings.companyName || "", companyLogo: "", websiteUrl: "",
    supportEmail: "", supportPhone: "+254 733 439 362", address: "", city: "Nairobi", country: "Kenya",
    currency: "KES", currencySymbol: "KSh", timezone: "Africa/Nairobi", language: "en", taxRate: 0,
    bookingDepositPercentage: 30, defaultCommissionRate: 10, maintenanceMode: false, allowRegistrations: true,
    allowAgentRegistrations: true, requireEmailVerification: true, requirePhoneVerification: false,
    enableMpesa: true, enableStripe: false, enablePaypal: false, enableBankTransfer: true,
    bankName: "", bankAccountName: "", bankAccountNumber: "", bankBranch: "", bankSwiftCode: "",
    emailFromName: globalSettings.companyName || "", emailFromAddress: "", facebook: "", instagram: "",
    twitter: "", youtube: "", seoTitle: "", seoDescription: "", seoKeywords: "",
    bookingNotifications: true, paymentNotifications: true,
  };
  const [settings, setSettings] = useState(DEFAULTS);
  const [logoFile, setLogoFile] = useState(null);
  const { data, isLoading, isError } = useQuery({ queryKey: ["admin-settings"], queryFn: getSettings });

  useEffect(() => {
    const incoming = data?.data || data?.settings;
    if (incoming) setSettings(current => ({ ...current, ...incoming }));
  }, [data]);

  useEffect(() => {
    if (globalSettings.companyName && !settings.companyName) {
      setSettings(current => ({ ...current, companyName: globalSettings.companyName, emailFromName: current.emailFromName || globalSettings.companyName }));
    }
  }, [globalSettings.companyName]);

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: response => {
      const saved = response?.data || response?.settings;
      if (saved) setSettings(current => ({ ...current, ...saved }));
      setLogoFile(null); qc.invalidateQueries({ queryKey: ["admin-settings"] }); toast.success("System settings saved.");
    },
    onError: error => toast.error(error?.response?.data?.message || "Failed to save settings."),
  });
  const update = (key, value) => setSettings(current => ({ ...current, [key]: value }));
  if (isLoading) return <div className="p-8">Loading system settings...</div>;
  if (isError) return <div className="p-8 text-red-600">Failed to load system settings.</div>;
  const submit = e => { e.preventDefault(); mutation.mutate({ ...settings, logoFile }); };

  return <div className="min-h-screen bg-slate-50 p-4 md:p-6"><div className="mx-auto max-w-7xl">
    <div className="mb-6 rounded-3xl bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 p-6 text-white shadow-xl md:p-8"><p className="text-sm font-semibold uppercase tracking-widest text-emerald-300">Administration</p><h1 className="mt-2 text-3xl font-bold md:text-4xl">System Settings</h1><p className="mt-2 max-w-3xl text-slate-300">Configure identity, contact details, booking rules, payments, notifications, social links and SEO.</p></div>
    <form onSubmit={submit} className="space-y-6">
      <Section icon={<Building2 size={20}/>} title="Company identity"><Field label="Company name"><input value={settings.companyName} onChange={e=>update("companyName",e.target.value)}/></Field><Field label="Company logo"><input type="file" accept="image/*" onChange={e=>setLogoFile(e.target.files?.[0] || null)} className="w-full rounded-xl border p-3"/></Field><Field label="Website URL"><input value={settings.websiteUrl} onChange={e=>update("websiteUrl",e.target.value)}/></Field><Field label="Business address"><input value={settings.address} onChange={e=>update("address",e.target.value)}/></Field></Section>
      <Section icon={<Phone size={20}/>} title="Contact & communications"><div className="grid gap-4 md:grid-cols-2"><Field label="Support phone"><input value={settings.supportPhone || ''} onChange={e=>update("supportPhone",e.target.value)}/></Field><Field label="Support email"><input type="email" value={settings.supportEmail} onChange={e=>update("supportEmail",e.target.value)}/></Field><Field label="Email sender name"><input value={settings.emailFromName} onChange={e=>update("emailFromName",e.target.value)}/></Field><Field label="Email sender address"><input type="email" value={settings.emailFromAddress} onChange={e=>update("emailFromAddress",e.target.value)}/></Field></div></Section>
      <Section icon={<WalletCards size={20}/>} title="Regional, pricing & payment rules"><div className="grid gap-4 md:grid-cols-3"><Field label="Currency"><input value={settings.currency} onChange={e=>update("currency",e.target.value.toUpperCase())}/></Field><Field label="Currency symbol"><input value={settings.currencySymbol} onChange={e=>update("currencySymbol",e.target.value)}/></Field><Field label="Timezone"><input value={settings.timezone} onChange={e=>update("timezone",e.target.value)}/></Field><Field label="Tax rate %"><input type="number" min="0" max="100" value={settings.taxRate} onChange={e=>update("taxRate",e.target.value)}/></Field><Field label="Booking deposit %"><input type="number" min="0" max="100" value={settings.bookingDepositPercentage} onChange={e=>update("bookingDepositPercentage",e.target.value)}/></Field><Field label="Default agent commission %"><input type="number" min="0" max="100" value={settings.defaultCommissionRate} onChange={e=>update("defaultCommissionRate",e.target.value)}/></Field></div></Section>
      <Section icon={<ShieldCheck size={20}/>} title="Access & security"><div className="grid gap-3 md:grid-cols-2"><Toggle label="Allow customer registrations" value={settings.allowRegistrations} onChange={v=>update("allowRegistrations",v)}/><Toggle label="Allow agent registrations" value={settings.allowAgentRegistrations} onChange={v=>update("allowAgentRegistrations",v)}/><Toggle label="Require email verification" value={settings.requireEmailVerification} onChange={v=>update("requireEmailVerification",v)}/><Toggle label="Maintenance mode" value={settings.maintenanceMode} onChange={v=>update("maintenanceMode",v)}/></div></Section>
      <Section icon={<Globe2 size={20}/>} title="Social & SEO"><div className="grid gap-4 md:grid-cols-2"><Field label="Facebook"><input value={settings.facebook} onChange={e=>update("facebook",e.target.value)}/></Field><Field label="Instagram"><input value={settings.instagram} onChange={e=>update("instagram",e.target.value)}/></Field><Field label="X / Twitter"><input value={settings.twitter} onChange={e=>update("twitter",e.target.value)}/></Field><Field label="YouTube"><input value={settings.youtube} onChange={e=>update("youtube",e.target.value)}/></Field></div></Section>
      <div className="sticky bottom-4 flex justify-end"><button disabled={mutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white shadow-lg disabled:opacity-50"><Save size={18}/>{mutation.isPending ? "Saving..." : "Save all system settings"}</button></div>
    </form>
  </div></div>;
}
function Section({icon,title,children}) { return <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7"><div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-emerald-50 p-2 text-emerald-700">{icon}</span><h2 className="text-xl font-bold text-slate-900">{title}</h2></div><div className="grid gap-5">{children}</div></section>; }
function Field({label,children}) { return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>{children}</label>; }
function Toggle({label,value,onChange}) { return <label className="flex cursor-pointer items-center justify-between rounded-xl border p-4"><span className="font-medium">{label}</span><input type="checkbox" checked={Boolean(value)} onChange={e=>onChange(e.target.checked)} className="h-5 w-5"/></label>; }
