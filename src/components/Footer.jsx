import { Link } from "react-router-dom";
import { Twitter, Instagram, Facebook } from "lucide-react";
import logo from "../assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-0">
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center md:text-left">

        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center mb-2 space-x-2 justify-center md:justify-start">
            <img
              src={logo}
              alt="Postify Logo"
              className="w-7 h-7 object-contain"
            />
            <h2 className="text-xl font-bold text-blue-600 tracking-tight">
              Postify
            </h2>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
            A modern platform for sharing stories and building communities
            through creativity, connection, and meaningful posts.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-gray-600 font-medium">
          <Link
            to="/legal#about"
            className="hover:text-blue-600 transition-colors duration-200"
          >
            About
          </Link>
          <Link
            to="/legal#privacy"
            className="hover:text-blue-600 transition-colors duration-200"
          >
            Privacy Policy
          </Link>
          <Link
            to="/legal#terms"
            className="hover:text-blue-600 transition-colors duration-200"
          >
            Terms of Service
          </Link>
        </div>

        {/* 🌐 Social Icons */}
        <div className="flex justify-center md:justify-end items-center space-x-4">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-600 transition-colors duration-200 p-1.5 rounded-full hover:bg-blue-50"
            aria-label="Facebook"
          >
            <Facebook size={18} />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-sky-500 transition-colors duration-200 p-1.5 rounded-full hover:bg-sky-50"
            aria-label="Twitter"
          >
            <Twitter size={18} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-pink-500 transition-colors duration-200 p-1.5 rounded-full hover:bg-pink-50"
            aria-label="Instagram"
          >
            <Instagram size={18} />
          </a>
        </div>
      </div>

      <div className="h-px bg-gray-200 mx-auto w-[90%]"></div>
      <div className="py-4 px-6 text-center">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-blue-600">Postify</span>. Built with 💙 and creativity for the writing community.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
