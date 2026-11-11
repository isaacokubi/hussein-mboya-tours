/**
 * Purpose: Login page-level UI component. Main declarations: Login, handleChange, handleSubmit.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useState, useContext } from "react";
// Load react-router-dom so this module can use its exported dependencies.
import { useNavigate } from "react-router-dom";
// Load react-toastify so this module can use its exported dependencies.
import { toast } from "react-toastify";
// Load ../context/AuthContext so this module can use its exported dependencies.
import { AuthContext } from "../context/AuthContext";
// Load ../utils/roleUtils so this module can use its exported dependencies.
import { dashboardPath } from "../utils/roleUtils";
// Load ./CustomerMfa so this module can use its exported dependencies.
import CustomerMfa from "./CustomerMfa";

// Define Login; its parameters and body implement this operation.
export default function Login() {
  // Declare navigate for use by the surrounding module or function.
  const navigate = useNavigate();
  // Declare { login } for use by the surrounding module or function.
  const { login } = useContext(AuthContext);
  // Declare [formData, setFormData] for use by the surrounding module or function.
  const [formData, setFormData] = useState({ email: "", password: "" });
  // Declare [loading, setLoading] for use by the surrounding module or function.
  const [loading, setLoading] = useState(false);
  // Declare [mfaData, setMfaData] for use by the surrounding module or function.
  const [mfaData, setMfaData] = useState(null);

  // Declare handleChange for use by the surrounding module or function.
  const handleChange = (event) => setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));

  // Declare handleSubmit for use by the surrounding module or function.
  const handleSubmit = async (event) => {
    // Perform the side effect or state update expressed on the following line.
    event.preventDefault();
    // Perform the side effect or state update expressed on the following line.
    setLoading(true);
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare response for use by the surrounding module or function.
      const response = await login(formData.email, formData.password);

      // Check the condition (response?.mfaRequired) and run the matching branch.
      if (response?.mfaRequired) {

        // Perform the side effect or state update expressed on the following line.
        setMfaData({
          userId: response.userId,
          devPin: response.devPin
        });

        // Perform the side effect or state update expressed on the following line.
        toast.info(
          response.message ||
          "Verification PIN sent to your registered phone."
        );

        // Return the result to the caller.
        return;
      }

      // Check the condition (!response?.token) and run the matching branch.
      if (!response?.token) throw new Error("Authentication response did not contain a token.");
      // Perform the side effect or state update expressed on the following line.
      toast.success("Login successful");
      // Perform the side effect or state update expressed on the following line.
      navigate(dashboardPath(response?.user), { replace: true });
    } catch (error) {
      // Axios errors contain request config.data, which includes the password
      // for a failed login. Keep diagnostics limited to safe metadata.
      // Perform the side effect or state update expressed on the following line.
      console.error("LOGIN ERROR:", {
        status: error?.response?.status || null,
        code: error?.code || "AUTHENTICATION_FAILED",
      });
      // Perform the side effect or state update expressed on the following line.
      toast.error(error?.response?.data?.message || error?.message || "Invalid email or password");
    } finally {
      // Perform the side effect or state update expressed on the following line.
      setLoading(false);
    }
  };

  // Check the condition (mfaData) and run the matching branch.
  if (mfaData) {
    // Return the expression shown below to the caller.
    return (
      <CustomerMfa
        userId={mfaData.userId}
        devPin={mfaData.devPin}
      />
    );
  }

  // Return the expression shown below to the caller.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Welcome Back</h1>
        <p className="mb-6 text-center text-sm text-gray-500">Secure customer accounts are verified with a phone PIN after password authentication.</p>
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
          <button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50">{loading ? "Authenticating..." : "Login"}</button>
        </form>
      </div>
    </div>
  );
}
