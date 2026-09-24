import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSettings } from "../context/SettingsContext";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { register } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });

  const update = (event) => {
    const { name, value } = event.target;
    const next = name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;
    setForm((current) => ({ ...current, [name]: next }));
  };

  const submitCustomer = async () => {
    if (form.phone.length !== 10) throw new Error("Phone number must contain exactly 10 digits.");
    if (form.password !== form.confirmPassword) throw new Error("Passwords do not match.");
    await register({ name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone, password: form.password });
    toast.success("Account created successfully. Please log in to verify your phone PIN.");
    navigate("/login", { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try { setLoading(true); await submitCustomer(); }
    catch (error) { console.error("REGISTRATION ERROR:", error); toast.error(error?.response?.data?.message || error.message || "Registration failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-green-800">{`Join ${settings?.companyName || "Company"}`}</h1>
        <p className="text-center text-gray-500 mt-2 mb-6">Create your traveller account.</p>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <input type="text" name="name" autoComplete="name" placeholder="Full name" value={form.name} onChange={update} required className="w-full border rounded-lg p-3" />
          <input type="email" name="email" autoComplete="email" placeholder="Email address" value={form.email} onChange={update} required className="w-full border rounded-lg p-3" />
          <input type="tel" name="phone" autoComplete="tel" inputMode="numeric" maxLength={10} placeholder="Phone number" value={form.phone} onChange={update} required className="w-full border rounded-lg p-3" />
          <input type="password" name="password" autoComplete="new-password" placeholder="Password" value={form.password} onChange={update} required className="w-full border rounded-lg p-3" />
          <input type="password" name="confirmPassword" autoComplete="new-password" placeholder="Confirm password" value={form.confirmPassword} onChange={update} required className="w-full border rounded-lg p-3" />
          <button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-bold disabled:opacity-50">{loading ? "Creating…" : "Register"}</button>
        </form>
        <p className="text-center mt-5 text-gray-600">Already have an account? <button type="button" onClick={() => navigate("/login")} className="text-green-700 font-bold ml-1">Login</button></p>
      </div>
    </div>
  );
}
