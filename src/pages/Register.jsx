import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { request } from "../api";
import logo from "../assets/logo.png";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("⚠️ Passwords do not match!");
      return;
    }

    try {
      const res = await request("/api/auth/register", "POST", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      console.log("✅ Register success:", res);
      alert("🎉 Registered successfully!");
      navigate("/login");
    } catch (err) {
      console.error("❌ Registration error:", err);
      alert("Registration failed: " + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-50 flex justify-center items-center py-12 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <img src={logo} alt="Logo" className="h-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-center mb-4">Create Account</h2>
        <p className="text-gray-600 text-center mb-6">
          Start sharing your stories with the world.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>


          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

   
          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              required
              className="w-4 h-4"
            />
            <span>
              I agree to the{" "}
              <Link to="/terms" className="text-blue-600 hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </span>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
