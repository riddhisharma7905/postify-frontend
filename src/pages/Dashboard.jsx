import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Edit3,
  Trash2,
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  Users,
  FileText,
  UserPlus,
} from "lucide-react";
import { request } from "../api"; 

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.warn("No token found, redirecting to login...");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      // ✅ Using request() helper instead of fetch
      const [postsData, userData] = await Promise.all([
        request("/api/posts/user/me", "GET", null, {
          Authorization: `Bearer ${token}`,
        }),
        request("/api/user/dashboard", "GET", null, {
          Authorization: `Bearer ${token}`,
        }),
      ]);

      setPosts(postsData);
      setUserData(userData);
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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchDashboardData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchDashboardData]);

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem("authToken");
      await request(`/api/posts/${postId}`, "DELETE", null, {
        Authorization: `Bearer ${token}`,
      });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert("Error deleting post: " + err.message);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );

  if (error)
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

  const totalPosts = posts.length;
  const totalLikes = posts.reduce((acc, p) => acc + (p.likes?.length || 0), 0);
  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
  const followersCount = Array.isArray(userData.followers)
    ? userData.followers.length
    : 0;
  const followingCount = Array.isArray(userData.following)
    ? userData.following.length
    : 0;

  const stats = [
    { title: "Total Posts", value: totalPosts, icon: FileText, color: "text-blue-500" },
    { title: "Total Views", value: totalViews, icon: Eye, color: "text-green-500" },
    { title: "Total Likes", value: totalLikes, icon: Heart, color: "text-pink-500" },
    { title: "Followers", value: followersCount, icon: Users, color: "text-purple-500" },
    { title: "Following", value: followingCount, icon: UserPlus, color: "text-indigo-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 container mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, {userData.name || "User"} 👋
            </h1>
            <p className="text-gray-500">Here's your latest activity overview</p>
          </div>
        </div>

        <div className="border-b flex gap-6 mb-6 overflow-x-auto">
          {["overview", "posts"].map((tab) => (
            <button
              key={tab}
              className={`pb-2 capitalize text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {stat.value}
                      </h2>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-xl shadow text-center">
              <Calendar size={24} className="text-blue-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Write a New Post
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Share your latest ideas and insights with the world.
              </p>
              <button
                onClick={() => navigate("/createpost")}
                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Create Post
              </button>
            </div>
          </div>
        )}

        {activeTab === "posts" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Posts</h2>
              <button
                onClick={() => navigate("/createpost")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
              >
                <PlusCircle size={18} /> New Post
              </button>
            </div>

            {posts.length === 0 ? (
              <div className="bg-white p-12 rounded-xl shadow text-center">
                <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No posts yet</p>
                <p className="text-gray-400 text-sm">
                  Start writing your first post to see it here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="bg-white p-6 rounded-xl shadow hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg mb-1">
                          {post.title}
                        </h3>
                        <p className="text-gray-500 text-sm mb-2">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                        <div className="text-sm text-gray-500 flex gap-4">
                          <span className="flex items-center gap-1">
                            <Eye size={14} /> {post.views || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart size={14} /> {post.likes?.length || 0} likes
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={14} />{" "}
                            {post.comments?.length || 0} comments
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/post/${post._id}`)}
                          className="text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition"
                          title="View post"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="text-gray-600 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition"
                          title="Delete post"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
