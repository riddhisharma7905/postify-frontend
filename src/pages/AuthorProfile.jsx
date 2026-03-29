import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Heart, 
  FileText, 
  UserPlus, 
  Pin, 
  PinOff, 
  Eye, 
  Mail, 
  MapPin, 
  Link as LinkIcon, 
  Calendar,
  MessageCircle,
  MoreHorizontal,
  Check
} from "lucide-react";
import { request } from "../api";
import UserListModal from "../components/UserListModal";

const FALLBACK_COVER = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=1200&auto=format&fit=crop&q=80";
const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80";

// ─── Grid Card (Instagram-ish but refined) ──────────────────────────────────
const GridCard = ({ post, isPinned, isOwner, onPin, onClick }) => (
  <div className="relative group aspect-square cursor-pointer overflow-hidden rounded-xl bg-gray-50 border border-gray-100" onClick={onClick}>
    <img
      src={post.image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800"}
      alt={post.title}
      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
    />
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 text-white">
      <span className="flex items-center gap-1.5 font-bold"><Heart size={18} fill="white" /> {post.likes?.length || 0}</span>
      <span className="flex items-center gap-1.5 font-bold"><Eye size={18} /> {post.views || 0}</span>
    </div>
    {isPinned && (
      <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1">
        <Pin size={10} /> PINNED
      </div>
    )}
  </div>
);

// ─── Suggested Creator Item ──────────────────────────────────────────────────
const SuggestedCreator = ({ user }) => (
  <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
    <Link to={`/author/${user._id}`} className="shrink-0">
      {user.profileImage ? (
        <img src={user.profileImage} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
          {user.name?.charAt(0).toUpperCase()}
        </div>
      )}
    </Link>
    <div className="flex-1 min-w-0">
      <Link to={`/author/${user._id}`} className="block">
        <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{user.name}</h4>
        <p className="text-xs text-gray-500 truncate">{user.bio || "Content Creator"}</p>
      </Link>
      <button className="mt-2 text-[11px] font-bold text-blue-600 flex items-center gap-1 hover:underline">
        <UserPlus size={10} /> Follow
      </button>
    </div>
  </div>
);

const AuthorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [suggestedPosts, setSuggestedPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [modal, setModal] = useState(null);

  const token = localStorage.getItem("authToken");
  const myId = token ? JSON.parse(atob(token.split(".")[1]))?.id : null;
  const isOwner = myId === id;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [u, p, l, s, sp] = await Promise.all([
        request(`/api/user/${id}`),
        request(`/api/posts/author/${id}`).catch(() => []), 
        request(`/api/posts/liked-by/${id}`).catch(() => []),
        request(`/api/user/suggested?authorId=${id}`).catch(() => []),
        request(`/api/posts/explore?limit=3`).catch(() => []), 
      ]);
      setAuthor(u);
      setPosts(p);
      setLikedPosts(l);
      setSuggested(s.filter(user => user._id !== id));
      setSuggestedPosts(sp.slice(0, 3));
      
      if (token) {
        const status = await request(`/api/user/${id}/follow-status`, "GET", null, { Authorization: `Bearer ${token}` });
        setIsFollowing(status.isFollowing);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFollow = async () => {
    if (!token) return navigate("/login");
    setFollowLoading(true);
    try {
      const data = await request(`/api/user/${id}/follow`, "POST", null, { Authorization: `Bearer ${token}` });
      setIsFollowing(data.isFollowing);
      setAuthor(prev => ({ ...prev, followers: data.targetUser.followers }));
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePin = async (postId) => {
    try {
      const res = await request(`/api/user/pin/${postId}`, "POST", null, { Authorization: `Bearer ${token}` });
      setAuthor(prev => ({ ...prev, pinnedPostId: res.pinnedPostId }));
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;
  if (error || !author) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center px-4"><div><h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Profile not found</h2><button onClick={() => navigate("/home")} className="text-blue-600 font-bold underline">Go back home</button></div></div>;

  const displayPosts = activeTab === "posts" 
    ? [...posts].sort((a, b) => (a._id === author.pinnedPostId ? -1 : 1))
    : likedPosts;

  return (
    <div className="min-h-screen bg-[#F3F2EF] pb-12">
      {modal && <UserListModal title={modal} users={author[modal]} onClose={() => setModal(null)} />}

      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* ─── Main Content (Profile Card + Tabs) ────────────────────────── */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Profile Header Card */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              {/* Cover Image */}
              <div className="h-48 sm:h-64 relative bg-gray-200">
                <img src={author.coverImage || FALLBACK_COVER} className="w-full h-full object-cover" alt="Cover" />
              </div>

              {/* Profile Details Area */}
              <div className="px-6 pb-6 relative">
                {/* Avatar */}
                <div className="absolute -top-16 left-6">
                  {author.profileImage ? (
                    <img src={author.profileImage} className="w-32 h-32 rounded-full border-4 border-white object-cover bg-white shadow-md" alt={author.name} />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-white bg-blue-600 flex items-center justify-center text-4xl font-bold text-white shadow-md">
                      {author.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Actions (Right) */}
                <div className="pt-4 flex justify-end gap-2">
                  {!isOwner ? (
                    <>
                      <button 
                        onClick={handleFollow}
                        disabled={followLoading}
                        className={`px-6 py-1.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
                          isFollowing 
                            ? "bg-white border-2 border-gray-300 text-gray-500 hover:bg-gray-50" 
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {isFollowing ? <Check size={16} /> : <UserPlus size={16} />}
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    </>
                  ) : (
                    <button onClick={() => navigate("/dashboard")} className="px-6 py-1.5 rounded-full border-2 border-gray-300 text-gray-600 font-bold text-sm hover:bg-gray-50">
                      Edit Profile
                    </button>
                  )}
                </div>

                {/* Text Details */}
                <div className="mt-8">
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {author.name}
                    <span className="text-gray-400 text-sm font-normal">• 1st</span>
                  </h1>
                  <p className="text-gray-700 text-base mt-1 font-medium">{author.bio || "Crafting digital experiences @ Postify"}</p>
                  
                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-gray-500 font-medium">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> Joined {new Date(author.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                  </div>

                  {/* Connections */}
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <button onClick={() => setModal("followers")} className="text-blue-600 font-bold hover:underline">{author.followers?.length || 0} followers</button>
                    <span className="text-gray-300">•</span>
                    <button onClick={() => setModal("following")} className="text-blue-600 font-bold hover:underline">{author.following?.length || 0} following</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs & Content */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
               <div className="flex border-b border-gray-100">
                <button 
                  onClick={() => setActiveTab("posts")}
                  className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === "posts" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:bg-gray-50"}`}
                >
                  Activity ({posts.length})
                </button>
                <button 
                  onClick={() => setActiveTab("likes")}
                  className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === "likes" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:bg-gray-50"}`}
                >
                  Likes ({likedPosts.length})
                </button>
              </div>

              <div className="p-6">
                {displayPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 font-medium italic">No content found in this tab.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {displayPosts.map(p => (
                      <GridCard 
                        key={p._id} 
                        post={p} 
                        isPinned={activeTab === "posts" && p._id === author.pinnedPostId} 
                        isOwner={isOwner} 
                        onPin={handlePin}
                        onClick={() => navigate(`/post/${p._id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Sidebar (Suggestions) ─────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-gray-900 font-bold text-base mb-4">Suggested Creators</h3>
              <div className="divide-y divide-gray-100 -mx-2">
                {suggested.length > 0 ? (
                  suggested.map(u => <SuggestedCreator key={u._id} user={u} />)
                ) : (
                  <p className="p-3 text-sm text-gray-400 italic">No suggestions yet.</p>
                )}
              </div>
              <button className="w-full mt-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                View More
              </button>
            </div>

            {/* Suggested Posts Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-gray-900 font-bold text-base mb-4">Suggested Posts</h3>
              <div className="space-y-4">
                {suggestedPosts.length > 0 ? (
                  suggestedPosts.map(p => (
                    <div 
                      key={p._id} 
                      onClick={() => navigate(`/post/${p._id}`)}
                      className="flex gap-3 cursor-pointer group"
                    >
                      <img 
                        src={p.image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=200"} 
                        className="w-16 h-16 rounded-lg object-cover bg-gray-50 flex-shrink-0" 
                        alt={p.title} 
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors uppercase">
                          {p.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-gray-400">
                          <span className="flex items-center gap-1"><Eye size={10} /> {p.views || 0}</span>
                          <span>•</span>
                          <span>{p.category}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">No suggested posts yet.</p>
                )}
              </div>
              <button 
                onClick={() => navigate("/explore")}
                className="w-full mt-6 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
              >
                Explore More
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthorProfile;
