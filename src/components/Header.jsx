import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

function Header({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Handle logout: remove token, update state, redirect to home
  const handleLogout = () => {
    onLogout(); // clears token + updates isLoggedIn
    navigate("/home", { replace: true }); // ensures redirect to home
  };

  // ✅ Handle protected navigation (Explore/Dashboard)
  const handleProtectedClick = (e, targetPath) => {
    if (!isLoggedIn) {
      e.preventDefault();
      localStorage.setItem("redirectAfterLogin", targetPath);
      navigate("/login");
    } else {
      navigate(targetPath);
    }
  };

  return (
    <header className="flex justify-between items-center px-8 py-4 shadow bg-white sticky top-0 z-50">
      {/* ===== LOGO ===== */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/home")}
      >
        <img src={logo} alt="Postify Logo" className="h-8 w-8" />
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700">
          Postify
        </h1>
      </div>

      {/* ===== NAVIGATION ===== */}
      <nav className="flex gap-6 text-gray-700 font-medium">
        <Link
          to="/explore"
          onClick={(e) => handleProtectedClick(e, "/explore")}
          className={`hover:text-blue-600 transition-colors ${
            location.pathname === "/explore" ? "text-blue-600 font-semibold" : ""
          }`}
        >
          Explore
        </Link>

        <Link
          to="/dashboard"
          onClick={(e) => handleProtectedClick(e, "/dashboard")}
          className={`hover:text-blue-600 transition-colors ${
            location.pathname === "/dashboard" ? "text-blue-600 font-semibold" : ""
          }`}
        >
          Dashboard
        </Link>

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="hover:text-red-600 transition-colors"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className={`hover:text-blue-600 transition-colors ${
              location.pathname === "/login" ? "text-blue-600 font-semibold" : ""
            }`}
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}

export default Header;
