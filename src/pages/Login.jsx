import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";


const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");


    try {
      console.log("🔄 Starting login process...");
      console.log("📤 Sending data:", { email: formData.email, password: "***" });


      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });


      console.log("📥 Response received");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);
      console.log("OK:", response.ok);
      console.log("Headers:", Object.fromEntries(response.headers.entries()));


      const responseText = await response.text();
      console.log("Raw response text:", responseText);


      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed JSON data:", data);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Raw text that failed to parse:", responseText);
        throw new Error("Server returned invalid JSON");
      }


      console.log("Token in response:", data.token);
      console.log("Full response structure:", data);


      if (!response.ok) {
        const errorMsg = data.message || data.error || data.msg || "Login failed";
        console.error("Server error:", errorMsg);
        throw new Error(errorMsg);
      }


      if (data.token) {
        console.log("Storing token in localStorage...");
        localStorage.setItem("authToken", data.token);
        const storedToken = localStorage.getItem("authToken");
        console.log("Token stored successfully:", storedToken ? "Yes" : "No");
        const redirectPath = localStorage.getItem("redirectAfterLogin") || "/dashboard";
        localStorage.removeItem("redirectAfterLogin"); 
        onLogin(data.token);
        navigate(redirectPath);
        if (onLogin) onLogin(data.token);
        navigate("/dashboard");
      } else {
        console.warn("No token in response!");
        throw new Error("Authentication token missing");
      }



    } catch (err) {
      console.error("Login process failed:", err);
      if (err.name === 'TypeError') {
        if (err.message.includes('Failed to fetch')) {
          setError("Cannot connect to server. Make sure backend is running on port 5001.");
        } else {
          setError("Network error: " + err.message);
        }
      } else if (err.message.includes('CORS')) {
        setError("CORS error. Check backend CORS configuration.");
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };


  


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-50 flex justify-center items-center py-12 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">Welcome Back</h2>
        <p className="text-gray-600 text-center mb-6">
          Sign in to your account to continue writing and reading amazing stories.
        </p>


        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>


          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>


        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};


export default Login;