import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreatePost from "./pages/CreatePost";
import PostDetails from "./pages/PostDetails";
import AuthorProfile from "./pages/AuthorProfile";
import Legal from "./pages/Legal";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("authToken"));

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem("authToken", token);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/post/:id" element={<PostDetails />} />
            <Route path="/author/:id" element={<AuthorProfile />} />
            {isLoggedIn ? (
              <>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/createpost" element={<CreatePost />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/login" replace />} />
            )}

            <Route path="/legal" element={<Legal />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />


          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
