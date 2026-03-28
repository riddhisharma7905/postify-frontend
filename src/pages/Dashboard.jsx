import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  Users,
  FileText,
  UserPlus,
  Trash2,
  TrendingUp,
  Mail,
  User,
  Phone,
  Info,
  Pin,
  PinOff,
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from "recharts";
import { request } from "../api";
import UserListModal from "../components/UserListModal";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState({});
  const [dashboardModal, setDashboardModal] = useState(null);
  const [pinnedPostId, setPinnedPostId] = useState(null);
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    birthdate: "",
    sex: "",
    bio: "",
    phoneNumber: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.warn("No token found, redirecting to login...");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const [postsData, userDataRes] = await Promise.all([
        request("/api/posts/user/me", "GET", null, {
          Authorization: `Bearer ${token}`,
        }),
        request("/api/user/dashboard", "GET", null, {
          Authorization: `Bearer ${token}`,
        }),
      ]);

      setPosts(postsData);
      setUserData(userDataRes);
      setPinnedPostId(userDataRes.pinnedPostId || null);
      setProfileForm({
        name: userDataRes.name || "",
        email: userDataRes.email || "",
        birthdate: userDataRes.birthdate ? new Date(userDataRes.birthdate).toISOString().split('T')[0] : "",
        sex: userDataRes.sex || "",
        bio: userDataRes.bio || "",
        phoneNumber: userDataRes.phoneNumber || ""
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      if (err.message.includes("401")) {
        localStorage.removeItem("authToken");
        navigate("/login");
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    const token = localStorage.getItem("authToken");
    try {
      const updatedUser = await request("/api/user/profile", "PUT", profileForm, {
        Authorization: `Bearer ${token}`
      });
      setUserData(updatedUser);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") {
      fetchDashboardData();
    }
  }, [fetchDashboardData]);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem("authToken");
      await request(`/api/posts/${postId}`, "DELETE", null, {
        Authorization: `Bearer ${token}`,
      });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      if (pinnedPostId === postId) setPinnedPostId(null);
    } catch (err) {
      alert("Error deleting post: " + err.message);
    }
  };

  const handlePin = async (postId) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await request(`/api/user/pin/${postId}`, "POST", null, {
        Authorization: `Bearer ${token}`,
      });
      setPinnedPostId(res.pinnedPostId);
    } catch (err) {
      alert("Could not pin post: " + err.message);
    }
  };

  const publishedPosts = posts.filter(p => !p.scheduledAt || new Date(p.scheduledAt) <= new Date());
  const scheduledPosts = posts.filter(p => p.scheduledAt && new Date(p.scheduledAt) > new Date());

  // Process data for Total Reach Analysis Line Chart
  const reachData = useMemo(() => {
    if (!publishedPosts.length) return [];
    
    // Sort chronologically
    const sorted = [...publishedPosts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    let cumulativeReach = 0;
    return sorted.map(post => {
      cumulativeReach += (post.views || 0);
      return {
        date: new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        reach: cumulativeReach,
        postTitle: post.title.substring(0, 15) + '...'
      };
    });
  }, [publishedPosts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Error: {error}</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const totalPosts = publishedPosts.length;
  const totalLikes = publishedPosts.reduce((acc, p) => acc + (p.likes?.length || 0), 0);
  const totalViews = publishedPosts.reduce((acc, p) => acc + (p.views || 0), 0);
  const followersCount = Array.isArray(userData.followers) ? userData.followers.length : 0;
  const followingCount = Array.isArray(userData.following) ? userData.following.length : 0;

  const stats = [
    { title: "Total Posts", value: totalPosts, icon: FileText, color: "text-blue-500" },
    { title: "Total Views", value: totalViews, icon: Eye, color: "text-green-500" },
    { title: "Total Likes", value: totalLikes, icon: Heart, color: "text-pink-500" },
    { title: "Followers", value: followersCount, icon: Users, color: "text-purple-500", onClick: () => setDashboardModal("followers") },
    { title: "Following", value: followingCount, icon: UserPlus, color: "text-indigo-500", onClick: () => setDashboardModal("following") },
  ];

  const tabs = ["Overview", "My Posts", "Scheduled", "Analytics", "Profile"];


  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {dashboardModal === "followers" && (
        <UserListModal
          title="Your Followers"
          users={Array.isArray(userData.followers) ? userData.followers : []}
          onClose={() => setDashboardModal(null)}
        />
      )}
      {dashboardModal === "following" && (
        <UserListModal
          title="People You Follow"
          users={Array.isArray(userData.following) ? userData.following : []}
          onClose={() => setDashboardModal(null)}
        />
      )}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center text-xl font-medium text-gray-800 shrink-0">
              {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Welcome back, {userData.name || "Sarah"}!
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your content and track your progress
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/createpost")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
          >
            <PlusCircle size={18} /> Write New Post
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-50/80 p-1.5 rounded-xl flex items-center gap-1 mb-8 border border-gray-100 w-full overflow-x-auto">
          {tabs.map((tab) => {
            const tabKey = tab.toLowerCase();
            const isActive = activeTab === tabKey;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tabKey)}
                className={`flex-1 min-w-[100px] py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-gray-900 border border-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* 5 Stats Cards on Head */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  onClick={stat.onClick}
                  className={`bg-white p-5 rounded-2xl border border-gray-200/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:border-gray-300 transition-colors ${stat.onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-[13px] font-medium text-gray-600">{stat.title}</p>
                    <div className={`${stat.color}`}>
                      <stat.icon size={20} className="opacity-90" strokeWidth={2.5}/>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                      {stat.value}
                    </h3>
                    {stat.onClick && <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest"></p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Content Below Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Performance */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2.5">
                    <TrendingUp size={22} className="text-blue-500" strokeWidth={2.5} />
                    <h2 className="text-[19px] font-bold text-gray-900 tracking-tight">Recent Performance</h2>
                  </div>
                  <button 
                    onClick={() => setActiveTab("my posts")}
                    className="text-[13px] font-semibold text-blue-500 hover:text-blue-600 px-3 py-1.5 bg-blue-50 rounded-lg transition-colors"
                  >
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 flex-1">
                  {publishedPosts.length > 0 ? (
                    publishedPosts.slice(0, 4).map((post) => (
                      <div
                        key={post._id}
                        className="p-5 bg-gray-50/80 rounded-[24px] hover:bg-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-100 flex flex-col justify-between group"
                        onClick={() => navigate(`/post/${post._id}`)}
                      >
                        <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 text-[14px] leading-tight group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-4 text-[12px] font-bold text-gray-500 mt-auto pt-3 border-t border-gray-100/50">
                          <span className="flex items-center gap-1.5 bg-white/50 px-2 py-0.5 rounded-lg">
                            <Eye size={14} className="text-blue-400" /> {post.views || 0}
                          </span>
                          <span className="flex items-center gap-1.5 bg-white/50 px-2 py-0.5 rounded-lg">
                            <Heart size={14} className="text-pink-400" /> {post.likes?.length || 0}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-10 px-6 text-center bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-200/60 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 border border-gray-100">
                         <TrendingUp size={24} className="text-gray-300" />
                      </div>
                      <p className="text-gray-500 text-sm font-semibold mb-1">No recent posts found.</p>
                      <button 
                        onClick={() => navigate("/createpost")}
                        className="text-[13px] text-blue-500 font-bold hover:text-blue-600 transition-colors"
                      >
                        Create your first post
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Publishing Schedule */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <Calendar size={22} className="text-blue-500" strokeWidth={2.5}/>
                    <h2 className="text-[19px] font-bold text-gray-900 tracking-tight">Publishing Schedule</h2>
                  </div>
                  <button 
                    onClick={() => setActiveTab("scheduled")}
                    className="text-[13px] font-semibold text-blue-500 hover:text-blue-600 px-3 py-1.5 bg-blue-50 rounded-lg transition-colors"
                  >
                    View All
                  </button>
                </div>
                <div className="flex-1 space-y-4">
                  {scheduledPosts.length > 0 ? (
                    scheduledPosts
                      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
                      .map(post => (
                        <div key={post._id} className="p-4 bg-gray-50/80 rounded-2xl flex justify-between items-center group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1 truncate text-[14px]">{post.title}</h3>
                            <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5">
                              <Calendar size={12} /> {new Date(post.scheduledAt).toLocaleString()}
                            </p>
                          </div>
                          <button 
                            onClick={() => navigate(`/post/${post._id}`)}
                            className="bg-white p-2 rounded-xl text-gray-400 hover:text-blue-500 hover:shadow-sm transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      ))
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-12">
                      <p className="text-gray-500 text-sm mb-5 font-medium">No scheduled posts</p>
                      <button onClick={() => navigate("/createpost")} className="px-5 py-2.5 bg-white border border-gray-200 shadow-sm text-gray-700 text-[13px] font-semibold rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all">
                        Schedule a Post
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Existing Posts Tab Content */}
        {activeTab === "my posts" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Posts</h2>
              <button
                onClick={() => navigate("/createpost")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
              >
                <PlusCircle size={18} /> New Post
              </button>
            </div>

            {publishedPosts.length === 0 ? (
              <div className="bg-white p-16 rounded-[40px] shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 text-gray-300">
                   <FileText size={40} />
                </div>
                <p className="text-gray-900 text-xl font-bold mb-2">No posts yet</p>
                <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8">
                  Start writing your first story to share it with the world.
                </p>
                
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {publishedPosts.map((post) => (
                  <div
                    key={post._id}
                    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col relative"
                  >
                    {/* Card Actions Overlay */}
                    <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => navigate(`/post/${post._id}`)}
                        className="bg-white/95 backdrop-blur-sm p-2 rounded-xl text-blue-600 shadow-lg hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110"
                        title="View post"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handlePin(post._id)}
                        className={`bg-white/95 backdrop-blur-sm p-2 rounded-xl shadow-lg transition-all transform hover:scale-110 ${
                          pinnedPostId === post._id
                            ? "text-yellow-600 hover:bg-yellow-500 hover:text-white"
                            : "text-gray-500 hover:bg-yellow-400 hover:text-white"
                        }`}
                        title={pinnedPostId === post._id ? "Unpin post" : "Pin to top of profile"}
                      >
                        {pinnedPostId === post._id ? <PinOff size={18} /> : <Pin size={18} />}
                      </button>
                      <button
                        onClick={() => navigate(`/edit/${post._id}`)}
                        className="bg-white/95 backdrop-blur-sm p-2 rounded-xl text-blue-600 shadow-lg hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110"
                        title="Edit post"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </button>
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="bg-white/95 backdrop-blur-sm p-2 rounded-xl text-red-500 shadow-lg hover:bg-red-600 hover:text-white transition-all transform hover:scale-110"
                        title="Delete post"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    {/* Pinned badge */}
                    {pinnedPostId === post._id && (
                      <div className="absolute top-4 left-4 z-20 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-md">
                        <Pin size={10} /> Pinned
                      </div>
                    )}

                    {/* Card Image */}
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={post.image || "https://images.unsplash.com/photo-1542435503-956c469947f6?w=800&auto=format&fit=crop"}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-3 opacity-70">
                        {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3 line-clamp-2 leading-tight">
                        {post.title}
                      </h3>
                      <p className="text-gray-500 text-[13px] line-clamp-3 mb-6 flex-1 leading-relaxed">
                        {post.content}
                      </p>

                      {/* Footer Stats */}
                      <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                        <div className="flex gap-4 text-[11px] font-bold text-gray-400">
                          <span className="flex items-center gap-1.5"><Eye size={14} /> {post.views || 0}</span>
                          <span className="flex items-center gap-1.5"><Heart size={14} /> {post.likes?.length || 0}</span>
                          <span className="flex items-center gap-1.5"><MessageCircle size={14} /> {post.comments?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Scheduled Posts Tab Content */}
        {activeTab === "scheduled" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Scheduled Posts</h2>
              <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                <Calendar size={20} />
              </div>
            </div>

            {scheduledPosts.length === 0 ? (
              <div className="bg-white p-16 rounded-[40px] shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 text-blue-400">
                   <Calendar size={40} />
                </div>
                <p className="text-gray-900 text-xl font-bold mb-2">No scheduled posts</p>
                <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8">
                  You can schedule posts for later under the 'Overview' tab
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {scheduledPosts.map((post) => (
                  <div
                    key={post._id}
                    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col relative"
                  >
                    {/* Card Actions */}
                    <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => navigate(`/post/${post._id}`)}
                        className="bg-white/95 backdrop-blur-sm p-2 rounded-xl text-blue-600 shadow-lg hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110"
                        title="Preview post"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="bg-white/95 backdrop-blur-sm p-2 rounded-xl text-red-500 shadow-lg hover:bg-red-600 hover:text-white transition-all transform hover:scale-110"
                        title="Cancel schedule"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Image Area */}
                    <div className="relative h-44 overflow-hidden bg-gray-100 italic flex items-center justify-center text-gray-300">
                      <Calendar size={48} className="opacity-20" />
                      <div className="absolute inset-0 bg-blue-600/5 mix-blend-multiply"></div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="px-3 py-1 bg-blue-50 rounded-lg text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100/50">
                          Scheduled
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                        {post.title}
                      </h3>
                      
                      {/* Priority Time Label */}
                      <div className="bg-gray-50 rounded-2xl p-4 mt-auto border border-gray-100/50 group-hover:border-blue-100 group-hover:bg-blue-50/50 transition-colors duration-300">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Publishing at</p>
                         <div className="flex items-center gap-2 text-gray-900 font-bold text-[13px]">
                            <Calendar size={14} className="text-blue-500" />
                            {new Date(post.scheduledAt).toLocaleString(undefined, { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab Content */}
        {activeTab === "analytics" && (
          <div className="animate-in fade-in duration-500 space-y-8 pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                 <div className="flex justify-between items-center mb-8">
                   <div>
                     <h2 className="text-xl font-bold text-gray-900 tracking-tight">Total Reach Analysis</h2>
                     <p className="text-sm text-gray-500 mt-1">Cumulative audience growth over time</p>
                   </div>
                 </div>
                 <div className="h-[350px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={reachData}>
                       <defs>
                         <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                           <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                       <XAxis 
                         dataKey="date" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{fill: '#9CA3AF', fontSize: 12}} 
                         dy={10} 
                       />
                       <YAxis 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{fill: '#9CA3AF', fontSize: 12}} 
                       />
                       <Tooltip 
                         contentStyle={{
                           borderRadius: '16px', 
                           border: 'none', 
                           boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                           padding: '12px'
                         }}
                         labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="reach" 
                         stroke="#3B82F6" 
                         strokeWidth={3}
                         fillOpacity={1} 
                         fill="url(#colorReach)" 
                         name="Total Views"
                       />
                     </AreaChart>
                   </ResponsiveContainer>
                 </div>
               </div>

               <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
                 <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-2">Metrics Distribution</h2>
                 <p className="text-sm text-gray-500 mb-8">Overview of your engagement stats</p>
                 <div className="flex-1 flex items-center justify-center">
                   <div className="h-64 w-64 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Views', value: totalViews, color: '#3B82F6' },
                              { name: 'Likes', value: totalLikes, color: '#EC4899' },
                              { name: 'Followers', value: followersCount, color: '#A855F7' }
                            ]}
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={8}
                            dataKey="value"
                          >
                            {[
                              { color: '#3B82F6' },
                              { color: '#EC4899' },
                              { color: '#A855F7' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Growth</span>
                         <span className="text-2xl font-black text-gray-900">Total</span>
                      </div>
                   </div>
                 </div>
                 <div className="mt-8 space-y-4">
                   {[
                     { label: 'Views', value: totalViews, color: 'bg-blue-500' },
                     { label: 'Likes', value: totalLikes, color: 'bg-pink-500' },
                     { label: 'Followers', value: followersCount, color: 'bg-purple-500' }
                   ].map(item => (
                     <div key={item.label} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className={`h-3 w-3 rounded-full ${item.color}`}></div>
                         <span className="text-sm font-semibold text-gray-600">{item.label}</span>
                       </div>
                       <span className="text-sm font-bold text-gray-900">{item.value}</span>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* Profile Tab Content */}
        {activeTab === "profile" && (
          <div className="animate-in fade-in duration-500 max-w-5xl mx-auto pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Account Management (Side) */}
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-gray-800">
                    {userData.name?.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{userData.name}</h2>
                  <p className="text-sm text-gray-600 mb-6">{userData.email}</p>
                  <div className="pt-6 border-t border-gray-50 flex justify-around">
                     <div>
                       <p className="text-lg font-bold text-gray-900">{followersCount}</p>
                       <p className="text-[11px] font-bold text-gray-600 uppercase">Followers</p>
                     </div>
                     <div className="w-px h-8 bg-gray-50"></div>
                     <div>
                       <p className="text-lg font-bold text-gray-900">{followingCount}</p>
                       <p className="text-[11px] font-bold text-gray-600 uppercase">Following</p>
                     </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 px-2">Account Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-2xl">
                      <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-green-500 shadow-sm">
                        <Info size={16} />
                      </div>
                      <span className="text-[13px] font-bold text-green-700">Verified Professional</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Information (Main) */}
              <div className="lg:col-span-2">
                <form onSubmit={handleProfileUpdate} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-10">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Profile Information</h2>
                    <p className="text-sm text-gray-500">Update your personal details and public bio.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                        <User size={12} strokeWidth={3} /> Full Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none font-semibold text-gray-900 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                        <Mail size={12} strokeWidth={3} /> Email Address
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none font-semibold text-gray-900 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={12} strokeWidth={3} /> Birthdate
                      </label>
                      <input
                        type="date"
                        value={profileForm.birthdate}
                        onChange={(e) => setProfileForm({...profileForm, birthdate: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none font-semibold text-gray-900 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                        <UserPlus size={12} strokeWidth={3} /> Sex
                      </label>
                      <select
                        value={profileForm.sex}
                        onChange={(e) => setProfileForm({...profileForm, sex: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none font-semibold text-gray-900 transition-all appearance-none"
                      >
                         <option value="">Select Gender</option>
                         <option value="Male">Male</option>
                         <option value="Female">Female</option>
                         <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                        <Phone size={12} strokeWidth={3} /> Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phoneNumber}
                        onChange={(e) => setProfileForm({...profileForm, phoneNumber: e.target.value})}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none font-semibold text-gray-900 transition-all"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                        <PlusCircle size={12} strokeWidth={3} /> Professional Bio
                      </label>
                      <textarea
                        rows="4"
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                        placeholder="Tell the world about yourself..."
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none font-semibold text-gray-900 transition-all resize-none"
                      ></textarea>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      disabled={isUpdating}
                      className="w-full py-5 bg-gray-900 text-white font-bold rounded-[20px] hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      {isUpdating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Updating Profile...
                        </>
                      ) : "Save Settings"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

