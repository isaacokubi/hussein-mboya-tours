import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";

const initialForm = {
  companyName: "",
  slug: "",
  country: "Kenya",
  timezone: "Africa/Nairobi",
  currency: "KES",
  plan: "starter",
  adminName: "",
  adminEmail: "",
  adminPhone: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterCompany() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const update = (event) => {
    const { name, value } = event.target;
    const next = name === "adminPhone" ? value.replace(/\D/g, "").slice(0, 10) : value;
    setForm((current) => ({ ...current, [name]: next }));
    if (name === "companyName" && !currentSlugEdited) {
      setForm((current) => ({ ...current, [name]: next, slug: next.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") }));
    }
  };

  const [currentSlugEdited, setCurrentSlugEdited] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error("Passwords do not match.");
    if (form.adminPhone.length !== 10) return toast.error("Phone number must contain exactly 10 digits.");
    if (form.password.length < 12 || !/[A-Z]/.test(form.password) || !/\d/.test(form.password)) return toast.error("Password must be at least 12 characters and include an uppercase letter and a number.");

    try {
      setLoading(true);
      const { data } = await api.post("/public/onboarding/register", {
        company: {
          name: form.companyName.trim(),
          slug: form.slug.trim().toLowerCase(),
          country: form.country.trim(),
          timezone: form.timezone.trim(),
          currency: form.currency.trim().toUpperCase(),
        },
        plan: form.plan,
        admin: {
          name: form.adminName.trim(),
          email: form.adminEmail.trim().toLowerCase(),
          phone: form.adminPhone,
          password: form.password,
        },
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("tenantId", String(data.tenant.id));
      localStorage.setItem("tenantSlug", data.tenant.slug);
      toast.success("Company registered. Your trial is active.");
      navigate("/admin", { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Company registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-900">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
        <div className="bg-gradient-to-br from-green-900 via-green-800 to-emerald-700 p-8 text-white md:p-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">Your Travel Company</p>
          <h1 className="text-4xl font-black leading-tight">Launch your travel company workspace.</h1>
          <p className="mt-5 text-emerald-50/90">Create your company, receive your first Administrator account and start a 14-day SaaS trial immediately.</p>
          <ul className="mt-8 space-y-4 text-sm text-white/90">
            <li>✓ Isolated company data and tenant security</li>
            <li>✓ First Admin created automatically</li>
            <li>✓ Platform SuperAdmin provisioned on first installation</li>
            <li>✓ Starter, Professional and Business plans</li>
            <li>✓ Upgrade before the trial expires</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-7 md:p-10">
          <div>
            <h2 className="text-2xl font-bold">Register your company</h2>
            <p className="mt-1 text-sm text-slate-500">Your Administrator account will own this company workspace.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <input name="companyName" value={form.companyName} onChange={update} placeholder="Company name" required className="rounded-xl border p-3 sm:col-span-2" />
            <input name="slug" value={form.slug} onChange={(e) => { setCurrentSlugEdited(true); update(e); }} placeholder="Company slug" required className="rounded-xl border p-3 sm:col-span-2" />
            <input name="country" value={form.country} onChange={update} placeholder="Country" required className="rounded-xl border p-3" />
            <input name="currency" value={form.currency} onChange={update} placeholder="Currency" maxLength={3} required className="rounded-xl border p-3" />
            <input name="timezone" value={form.timezone} onChange={update} placeholder="Timezone" required className="rounded-xl border p-3 sm:col-span-2" />
          </div>

          <select name="plan" value={form.plan} onChange={update} className="w-full rounded-xl border p-3">
            <option value="starter">Starter — 5 seats</option>
            <option value="professional">Professional — 15 seats</option>
            <option value="business">Business — 50 seats</option>
            <option value="enterprise">Enterprise — 250 seats</option>
          </select>

          <div className="border-t pt-5">
            <h3 className="font-bold">First Administrator</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <input name="adminName" value={form.adminName} onChange={update} placeholder="Full name" autoComplete="name" required className="rounded-xl border p-3 sm:col-span-2" />
              <input type="email" name="adminEmail" value={form.adminEmail} onChange={update} placeholder="Email address" autoComplete="email" required className="rounded-xl border p-3" />
              <input type="tel" name="adminPhone" value={form.adminPhone} onChange={update} placeholder="10-digit phone" inputMode="numeric" maxLength={10} required className="rounded-xl border p-3" />
              <input type="password" name="password" value={form.password} onChange={update} placeholder="Password" autoComplete="new-password" required className="rounded-xl border p-3" />
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={update} placeholder="Confirm password" autoComplete="new-password" required className="rounded-xl border p-3" />
            </div>
          </div>

          <button disabled={loading} className="w-full rounded-xl bg-green-700 py-3 font-bold text-white transition hover:bg-green-800 disabled:opacity-50">
            {loading ? "Creating company…" : "Start my 14-day trial"}
          </button>
          <p className="text-center text-sm text-slate-500">Already have a company account? <button type="button" onClick={() => navigate("/login")} className="font-semibold text-green-700">Sign in</button></p>
        </form>
      </div>
    </div>
  );
}
