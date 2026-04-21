import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Search, User } from "lucide-react";

const UserListModal = ({ title, users = [], onClose }) => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Parse logged-in user ID from token
  const getMyId = () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return null;
      return JSON.parse(atob(token.split(".")[1]))?.id;
    } catch { return null; }
  };

  const myId = getMyId();

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleUserClick = (userId) => {
    onClose();
    if (userId === myId) navigate("/dashboard");
    else navigate(`/author/${userId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-5 border-b border-gray-50">
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">{title}</h3>
            <p className="text-[12px] text-gray-400 font-bold mt-0.5">{users.length} {users.length === 1 ? "person" : "people"}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        {/* Search */}
        <div className="px-8 py-4 border-b border-gray-50">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl outline-none text-sm font-medium text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User size={28} className="text-gray-200" />
              </div>
              <p className="text-gray-400 font-bold text-sm">No users found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleUserClick(user._id)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-blue-50 transition-colors group text-left"
                >
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium truncate">{user.email}</p>
                  </div>
                  <div className="text-gray-200 group-hover:text-blue-400 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListModal;
