import { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSettings } from "../context/SettingsContext";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { settings } = useSettings();
  const { register } = useContext(AuthContext);
  const companyMode = searchParams.get("company") === "1";
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", companyName: "", slug: "", country: "Kenya", timezone: "Africa/Nairobi", currency: "KES", plan: "starter" });

  const update = (event) => {
    const { name, value } = event.target;
    const next = name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : name === "slug" ? value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 80) : value;
    setForm((current) => ({ ...current, [name]: next, ...(name === "companyName" && !current.slug ? { slug: next.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") } : {}) }));
  };

  const submitCustomer = async () => {
    if (form.phone.length !== 10) throw new Error("Phone number must contain exactly 10 digits.");
    if (form.password !== form.confirmPassword) throw new Error("Passwords do not match.");
    const response = await register({ name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone, password: form.password });
    toast.success("Account created successfully");
    const role = String(response?.user?.role || "customer").toLowerCase();
    if (["admin", "superadmin", "super_admin", "administrator"].includes(role)) navigate("/admin");
    else if (role === "agent") navigate("/agent");
    else navigate("/dashboard");
  };

  const submitCompany = async () => {
    if (!form.companyName.trim()) throw new Error("Company name is required.");
    if (form.phone.length !== 10) throw new Error("Administrator phone number must contain exactly 10 digits.");
    if (form.password !== form.confirmPassword) throw new Error("Passwords do not match.");
    const { data } = await api.post("/public/onboarding/register", {
      company: { name: form.companyName.trim(), slug: form.slug.trim(), country: form.country.trim(), timezone: form.timezone.trim(), currency: form.currency.trim().toUpperCase() },
      plan: form.plan,
      admin: { name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone, password: form.password },
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("tenantId", String(data.tenant.id));
    localStorage.setItem("tenantSlug", data.tenant.slug);
    toast.success("Company registered. Your 14-day trial is active.");
    navigate("/admin", { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try { setLoading(true); await (companyMode ? submitCompany() : submitCustomer()); }
    catch (error) { console.error("REGISTRATION ERROR:", error); toast.error(error?.response?.data?.message || error.message || "Registration failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-green-800">{companyMode ? "Launch Your Company" : `Join ${settings?.companyName || "Company"}`}</h1>
        <p className="text-center text-gray-500 mt-2 mb-6">{companyMode ? "Create a tenant workspace and start your 14-day trial." : "Create your traveller account."}</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {companyMode && <>
            <input name="companyName" value={form.companyName} onChange={update} placeholder="Company name" required className="w-full border rounded-lg p-3" />
            <input name="slug" value={form.slug} onChange={update} placeholder="Company slug" required className="w-full border rounded-lg p-3" />
            <div className="grid grid-cols-2 gap-3">
              <input name="country" value={form.country} onChange={update} placeholder="Country" required className="border rounded-lg p-3" />
              <input name="currency" value={form.currency} onChange={update} placeholder="Currency" maxLength={3} required className="border rounded-lg p-3" />
            </div>
            <input name="timezone" value={form.timezone} onChange={update} placeholder="Timezone" required className="w-full border rounded-lg p-3" />
            <select name="plan" value={form.plan} onChange={update} className="w-full border rounded-lg p-3">
              <option value="starter">Starter — 5 seats</option>
              <option value="professional">Professional — 15 seats</option>
              <option value="business">Business — 50 seats</option>
              <option value="enterprise">Enterprise — 250 seats</option>
            </select>
            <h2 className="font-bold pt-2">First Administrator</h2>
          </>}

          <input type="text" name="name" autoComplete="name" placeholder="Full name" value={form.name} onChange={update} required className="w-full border rounded-lg p-3" />
          <input type="email" name="email" autoComplete="email" placeholder="Email address" value={form.email} onChange={update} required className="w-full border rounded-lg p-3" />
          <input type="tel" name="phone" autoComplete="tel" inputMode="numeric" maxLength={10} placeholder="Phone number" value={form.phone} onChange={update} required className="w-full border rounded-lg p-3" />
          <input type="password" name="password" autoComplete="new-password" placeholder={companyMode ? "Administrator password (12+ chars)" : "Password"} value={form.password} onChange={update} required className="w-full border rounded-lg p-3" />
          <input type="password" name="confirmPassword" autoComplete="new-password" placeholder="Confirm password" value={form.confirmPassword} onChange={update} required className="w-full border rounded-lg p-3" />

          <button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-bold disabled:opacity-50">{loading ? "Creating…" : companyMode ? "Start 14-Day Trial" : "Register"}</button>
        </form>

        {!companyMode && <button type="button" onClick={() => navigate("/register?company=1")} className="w-full mt-4 border border-green-700 text-green-700 py-3 rounded-xl font-bold">Register a Company</button>}
        {companyMode && <button type="button" onClick={() => navigate("/register")} className="w-full mt-4 text-green-700 font-semibold">Register as a traveller instead</button>}
        <p className="text-center mt-5 text-gray-600">Already have an account? <button type="button" onClick={() => navigate("/login")} className="text-green-700 font-bold ml-1">Login</button></p>
      </div>
    </div>
  );
}
