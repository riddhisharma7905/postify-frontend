import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, Heart, Users, FileText, UserPlus } from "lucide-react";
import { request } from "../api"; 

const AuthorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("authToken");

  const fetchAuthorData = useCallback(async () => {
    if (!id || id === "undefined") {
      setError("Invalid author ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [userData, postsData] = await Promise.all([
        request(`/api/user/${id}`),
        request(`/api/posts/author/${id}`),
      ]);

      setAuthor(userData);
      setPosts(postsData);

     
      if (token) {
        const followStatus = await request(
          `/api/user/${id}/follow-status`,
          "GET",
          null,
          { Authorization: `Bearer ${token}` }
        );
        setIsFollowing(followStatus.isFollowing);
      }
    } catch (err) {
      console.error("Error fetching author data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchAuthorData();
  }, [fetchAuthorData]);

  const handleFollowToggle = async () => {
    if (!token) {
      alert("Please login to follow authors!");
      navigate("/login");
      return;
    }

    if (followLoading) return;

    try {
      setFollowLoading(true);

      const data = await request(`/api/user/${id}/follow`, "POST", null, {
        Authorization: `Bearer ${token}`,
      });

      setIsFollowing(data.isFollowing);
      setAuthor((prev) => ({
        ...prev,
        followers: data.targetUser.followers,
        following: data.targetUser.following,
      }));
    } catch (err) {
      console.error("Follow toggle error:", err);
      alert("Error following/unfollowing user. Please try again.");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading author profile...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg mb-4">Error: {error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );

  if (!author)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg mb-4">Author not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );

  const totalLikes = posts.reduce((acc, p) => acc + (p.likes?.length || 0), 0);
  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
  const followersCount = author?.followers?.length || 0;
  const followingCount = author?.following?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 container mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {author.name}'s Profile 👤
              </h1>
              <p className="text-gray-600 mt-2 text-lg max-w-2xl italic font-medium">
                {author.bio || `Explore all posts written by ${author.name}.`}
              </p>
            </div>
          </div>

          <button
            onClick={handleFollowToggle}
            disabled={followLoading}
            className={`px-5 py-2.5 font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
              isFollowing
                ? "bg-gray-300 text-gray-800 hover:bg-gray-400"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {followLoading ? "..." : isFollowing ? "Following ✓" : "Follow"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Followers</p>
                <h2 className="text-2xl font-bold text-gray-800">{followersCount}</h2>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Following</p>
                <h2 className="text-2xl font-bold text-gray-800">{followingCount}</h2>
              </div>
              <UserPlus className="h-8 w-8 text-indigo-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Posts</p>
                <h2 className="text-2xl font-bold text-gray-800">{posts.length}</h2>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <h2 className="text-2xl font-bold text-gray-800">{totalViews}</h2>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Likes</p>
                <h2 className="text-2xl font-bold text-gray-800">{totalLikes}</h2>
              </div>
              <Heart className="h-8 w-8 text-pink-500" />
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Posts by {author.name}</h2>
          </div>

          {posts.length === 0 ? (
            <div className="bg-white p-12 rounded-xl shadow text-center">
              <FileText size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {author.name} hasn't written any posts yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <div
                  key={post._id}
                  onClick={() => navigate(`/post/${post._id}`)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col"
                >
                  {/* Card Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[11px] font-bold text-gray-600 shadow-sm uppercase tracking-wider">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3 line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                      {post.content}
                    </p>

                    {/* Footer Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex gap-4 text-xs font-semibold text-gray-500">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <Eye size={14} /> {post.views || 0}
                        </span>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg group-hover:bg-pink-50 group-hover:text-pink-600 transition-colors">
                          <Heart size={14} /> {post.likes?.length || 0}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                         <FileText size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AuthorProfile;
