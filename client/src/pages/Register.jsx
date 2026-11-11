/**
 * Purpose: Register page-level UI component. Main declarations: Register, update, submitCustomer, handleSubmit.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useContext, useState } from "react";
// Load react-router-dom so this module can use its exported dependencies.
import { useNavigate } from "react-router-dom";
// Load react-toastify so this module can use its exported dependencies.
import { toast } from "react-toastify";
// Load ../context/SettingsContext so this module can use its exported dependencies.
import { useSettings } from "../context/SettingsContext";
// Load ../context/AuthContext so this module can use its exported dependencies.
import { AuthContext } from "../context/AuthContext";

// Define Register; its parameters and body implement this operation.
export default function Register() {
  // Declare navigate for use by the surrounding module or function.
  const navigate = useNavigate();
  // Declare { settings } for use by the surrounding module or function.
  const { settings } = useSettings();
  // Declare { register } for use by the surrounding module or function.
  const { register } = useContext(AuthContext);
  // Declare [loading, setLoading] for use by the surrounding module or function.
  const [loading, setLoading] = useState(false);
  // Declare [form, setForm] for use by the surrounding module or function.
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });

  // Declare update for use by the surrounding module or function.
  const update = (event) => {
    // Declare { name, value } for use by the surrounding module or function.
    const { name, value } = event.target;
    // Declare next for use by the surrounding module or function.
    const next = name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;
    // Perform the side effect or state update expressed on the following line.
    setForm((current) => ({ ...current, [name]: next }));
  };

  // Declare submitCustomer for use by the surrounding module or function.
  const submitCustomer = async () => {
    // Check the condition (form.phone.length !== 10) and run the matching branch.
    if (form.phone.length !== 10) throw new Error("Phone number must contain exactly 10 digits.");
    // Check the condition (form.password !== form.confirmPassword) and run the matching branch.
    if (form.password !== form.confirmPassword) throw new Error("Passwords do not match.");
    // Perform the side effect or state update expressed on the following line.
    await register({ name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone, password: form.password });
    // Perform the side effect or state update expressed on the following line.
    toast.success("Account created successfully. Please log in to verify your phone PIN.");
    // Perform the side effect or state update expressed on the following line.
    navigate("/login", { replace: true });
  };

  // Declare handleSubmit for use by the surrounding module or function.
  const handleSubmit = async (event) => {
    // Perform the side effect or state update expressed on the following line.
    event.preventDefault();
    // Run this operation with a dedicated error-handling path for failures.
    try { setLoading(true); await submitCustomer(); }
    // Handle the error raised by the preceding protected operation.
    catch (error) { console.error("REGISTRATION ERROR:", error); toast.error(error?.response?.data?.message || error.message || "Registration failed"); }
    finally { setLoading(false); }
  };

  // Return the expression shown below to the caller.
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
