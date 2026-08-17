import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { dashboardPath } from "../utils/roleUtils";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await login(formData.email, formData.password);
      toast.success("Login successful");
      navigate(dashboardPath(response?.user), { replace: true });
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      toast.error(error?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Welcome Back</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-medium mb-2">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter email" className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block font-medium mb-2">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Enter password" className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="text-right"><button type="button" onClick={() => navigate("/forgot-password")} className="text-sm font-semibold text-green-700 hover:underline">Forgot password?</button></div>
          <button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
