import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSettings } from "../context/SettingsContext";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { register } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    // Keep each input mapped to its own field. In particular, the phone
    // input must use name="phone"; using name="email" here caused typing in
    // the phone field to update the email field and made the form appear to
    // jump between adjacent empty inputs.
    const nextValue =
      name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;

    setFormData((current) => ({
      ...current,
      [name]: nextValue,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedPhone = String(formData.phone || "");

    if (normalizedPhone.length !== 10) {
      toast.error("Phone number must contain exactly 10 digits.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: normalizedPhone,
        password: formData.password,
      });

      toast.success("Account created successfully");

      const user = response?.user;
      const role =
        typeof user?.role === "string"
          ? user.role.toLowerCase()
          : user?.role?.name?.toLowerCase();

      switch (role) {
        case "admin":
        case "superadmin":
        case "super_admin":
        case "administrator":
          navigate("/admin");
          break;
        case "agent":
          navigate("/agent");
          break;
        case "tourguide":
        case "tour_guide":
          navigate("/guide/dashboard");
          break;
        case "tourmanager":
        case "tour_manager":
        case "manager":
          navigate("/tour-manager/dashboard");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-green-800">
          Join {settings?.companyName || "Company"}
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Create your traveller account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <input
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Full name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border rounded-lg p-3"
          />

          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border rounded-lg p-3"
          />

          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength={10}
            minLength={10}
            placeholder="Phone number"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full border rounded-lg p-3"
          />

          <input
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border rounded-lg p-3"
          />

          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full border rounded-lg p-3"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-green-700 font-bold ml-2"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
