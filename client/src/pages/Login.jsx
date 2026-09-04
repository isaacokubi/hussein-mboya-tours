import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { dashboardPath } from "../utils/roleUtils";
import CustomerMfa from "./CustomerMfa";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [mfaData, setMfaData] = useState(null);

  const handleChange = (event) => setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await login(formData.email, formData.password);

      if (response?.mfaRequired) {
        setMfaData({ userId: response.userId, devPin: response.devPin });
        toast.info(response.message || "Verification PIN sent to your registered phone.");
        return;
      }

      if (!response?.token) throw new Error("Authentication response did not contain a token.");
      toast.success("Login successful");
      navigate(dashboardPath(response?.user), { replace: true });
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      toast.error(error?.response?.data?.message || error?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  if (mfaData) {
    return <CustomerMfa userId={mfaData.userId} devPin={mfaData.devPin} />;
  }

  return (
    <div className="tenant-public-site min-h-screen flex items-center justify-center bg-slate-950 p-6" style={{ backgroundColor: "#020617", color: "#f1f5f9" }}>
      <div className="w-full max-w-md rounded-2xl border border-slate-700/70 bg-slate-900 p-8 shadow-2xl" style={{ backgroundColor: "#0f172a", borderColor: "rgb(148 163 184 / 0.22)" }}>
        <h1 className="mb-2 text-center text-3xl font-bold text-slate-50">Welcome Back</h1>
        <p className="mb-6 text-center text-sm text-slate-300">Secure customer accounts are verified with a phone PIN after password authentication.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block font-medium text-slate-100">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter email" className="w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-slate-100 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="mb-2 block font-medium text-slate-100">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Enter password" className="w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-slate-100 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="text-right"><button type="button" onClick={() => navigate("/forgot-password")} className="text-sm font-semibold text-green-400 hover:text-green-300 hover:underline">Forgot password?</button></div>
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-green-700 py-3 font-semibold text-white transition hover:bg-green-600 disabled:opacity-50">{loading ? "Authenticating..." : "Login"}</button>
        </form>
      </div>
    </div>
  );
}
