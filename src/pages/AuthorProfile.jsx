import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, FileText, UserPlus, Pin, PinOff, Eye } from "lucide-react";
import { request } from "../api";
import UserListModal from "../components/UserListModal";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop";

// Helper to get logged-in user ID
const getMyId = () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1]))?.id;
  } catch { return null; }
};

// Instagram-style square card
const GridCard = ({ post, isPinned, isOwner, onPin, onClick }) => (
  <div className="relative group aspect-square cursor-pointer overflow-hidden rounded-2xl bg-gray-100" onClick={onClick}>
    <img
      src={post.image || FALLBACK_IMAGE}
      alt={post.title}
      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
    />

    {/* Hover overlay with stats */}
    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 text-white">
      <span className="flex items-center gap-1.5 font-bold text-sm">
        <Heart size={18} fill="white" /> {post.likes?.length || 0}
      </span>
      <span className="flex items-center gap-1.5 font-bold text-sm">
        <Eye size={18} /> {post.views || 0}
      </span>
    </div>

    {/* Pinned badge */}
    {isPinned && (
      <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-md">
        <Pin size={10} /> Pinned
      </div>
    )}

    {/* Category badge */}
    {post.category && (
      <div className="absolute top-2 right-2 bg-white/90 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-lg shadow-sm uppercase tracking-wider">
        {post.category}
      </div>
    )}

    {/* Pin button (owner only, visible on hover) */}
    {isOwner && (
      <button
        onClick={(e) => { e.stopPropagation(); onPin(post._id); }}
        title={isPinned ? "Unpin" : "Pin to top"}
        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm text-gray-700 hover:text-yellow-600 p-1.5 rounded-lg shadow-md"
      >
        {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
      </button>
    )}
  </div>
);

const AuthorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [modal, setModal] = useState(null);
  const [pinnedPostId, setPinnedPostId] = useState(null);

  const token = localStorage.getItem("authToken");
  const myId = getMyId();
  const isOwner = myId === id;

  const fetchAuthorData = useCallback(async () => {
    if (!id || id === "undefined") {
      setError("Invalid author ID");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const [userData, postsData, likedData] = await Promise.all([
        request(`/api/user/${id}`),
        request(`/api/posts/author/${id}`).catch(() => []),
        request(`/api/posts/liked-by/${id}`).catch(() => []),
      ]);
      setAuthor(userData);
      setPosts(postsData);
      setLikedPosts(likedData);
      setPinnedPostId(userData.pinnedPostId || null);

      if (token) {
        const followStatus = await request(`/api/user/${id}/follow-status`, "GET", null, {
          Authorization: `Bearer ${token}`,
        });
        setIsFollowing(followStatus.isFollowing);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => { fetchAuthorData(); }, [fetchAuthorData]);

  const handleFollowToggle = async () => {
    if (!token) { alert("Please login to follow authors!"); navigate("/login"); return; }
    if (followLoading) return;
    try {
      setFollowLoading(true);
      const data = await request(`/api/user/${id}/follow`, "POST", null, { Authorization: `Bearer ${token}` });
      setIsFollowing(data.isFollowing);
      setAuthor((prev) => ({ ...prev, followers: data.targetUser.followers, following: data.targetUser.following }));
    } catch (err) {
      alert("Error following/unfollowing user.");
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePin = async (postId) => {
    if (!token) return;
    try {
      const res = await request(`/api/user/pin/${postId}`, "POST", null, { Authorization: `Bearer ${token}` });
      setPinnedPostId(res.pinnedPostId);
    } catch (err) {
      alert("Could not pin post: " + err.message);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400 font-medium text-sm">Loading profile...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg mb-4">Error: {error}</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Go Back</button>
      </div>
    );

  if (!author)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg mb-4">Author not found.</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Go Back</button>
      </div>
    );

  const followersCount = author?.followers?.length || 0;
  const followingCount = author?.following?.length || 0;

  // Sort posts: pinned first, then by date
  const sortedPosts = [...posts].sort((a, b) => {
    if (a._id === pinnedPostId) return -1;
    if (b._id === pinnedPostId) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const displayPosts = activeTab === "posts" ? sortedPosts : likedPosts;

  return (
    <div className="min-h-screen bg-white">
      {modal === "followers" && (
        <UserListModal title="Followers" users={author.followers || []} onClose={() => setModal(null)} />
      )}
      {modal === "following" && (
        <UserListModal title="Following" users={author.following || []} onClose={() => setModal(null)} />
      )}

      <div className="max-w-4xl mx-auto px-6 pt-14 pb-20">

        {/* ── Profile Header ── */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 pb-10 border-b border-gray-100 mb-0">

          {/* Circular avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-4xl shadow-lg ring-4 ring-white">
              {author.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            {/* Name + Follow button */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-3">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">{author.name}</h1>
              {!isOwner && (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`text-sm font-bold px-5 py-1.5 rounded-full border-2 transition-all ${
                    isFollowing
                      ? "border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-500"
                      : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <UserPlus size={13} />
                    {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
                  </span>
                </button>
              )}
              {isOwner && (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-sm font-bold px-5 py-1.5 rounded-full border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Stats row */}
            <div className="flex justify-center sm:justify-start gap-8 mb-4 text-[14px]">
              <div className="text-center sm:text-left">
                <span className="font-black text-gray-900">{posts.length}</span>
                <span className="text-gray-400 font-bold"> posts</span>
              </div>
              <button onClick={() => setModal("followers")} className="text-center sm:text-left hover:text-blue-600 transition-colors">
                <span className="font-black text-gray-900">{followersCount}</span>
                <span className="text-gray-400 font-bold"> followers</span>
              </button>
              <button onClick={() => setModal("following")} className="text-center sm:text-left hover:text-blue-600 transition-colors">
                <span className="font-black text-gray-900">{followingCount}</span>
                <span className="text-gray-400 font-bold"> following</span>
              </button>
            </div>

            {/* Bio */}
            {author.bio ? (
              <p className="text-gray-600 text-[14px] leading-relaxed max-w-sm font-medium">{author.bio}</p>
            ) : (
              <p className="text-gray-400 text-[13px] italic">Member of the Postify community.</p>
            )}
          </div>
        </div>

        {/* ── Tabs (Instagram style) ── */}
        <div className="flex border-b border-gray-100">
          {[
            { key: "posts", label: "Posts", count: posts.length },
            { key: "likes", label: "Likes", count: likedPosts.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-4 text-[13px] font-black uppercase tracking-widest transition-colors border-b-2 -mb-px flex items-center justify-center gap-2 ${
                activeTab === key
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {label}
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${activeTab === key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Posts Grid ── */}
        <div className="pt-6">
          {displayPosts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <FileText size={32} className="text-gray-200" />
              </div>
              <h3 className="text-gray-700 font-black text-lg mb-2">
                {activeTab === "posts" ? "No posts yet" : "No liked posts yet"}
              </h3>
              <p className="text-gray-400 text-sm font-medium">
                {activeTab === "posts"
                  ? `${author.name} hasn't published anything yet.`
                  : `${author.name} hasn't liked any posts yet.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 sm:gap-3">
              {displayPosts.map((post) => (
                <GridCard
                  key={post._id}
                  post={post}
                  isPinned={post._id === pinnedPostId}
                  isOwner={isOwner}
                  onPin={handlePin}
                  onClick={() => navigate(`/post/${post._id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorProfile;
