import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../api";
import { Search, TrendingUp, Eye, Heart, X, Loader2, Flame, Edit3, ArrowRight } from "lucide-react";

function useDebounce(value, delay = 600) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const CATEGORIES = ["All", "Technology", "Business", "Education", "Career", "Lifestyle", "Health", "Travel", "Others"];
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1542435503-956c469947f6?w=800&auto=format&fit=crop";

// Loading skeleton card
const SkeletonCard = () => (
  <div className="bg-white rounded-[40px] overflow-hidden border border-gray-100 animate-pulse">
    <div className="h-60 bg-gray-100" />
    <div className="p-8 space-y-4">
      <div className="flex justify-between">
        <div className="h-3 w-20 bg-gray-100 rounded-full" />
        <div className="h-3 w-16 bg-gray-100 rounded-full" />
      </div>
      <div className="h-5 bg-gray-100 rounded-full w-3/4" />
      <div className="h-5 bg-gray-100 rounded-full w-1/2" />
      <div className="h-3 bg-gray-100 rounded-full w-full" />
      <div className="h-3 bg-gray-100 rounded-full w-5/6" />
      <div className="h-3 bg-gray-100 rounded-full w-4/6" />
      <div className="pt-4 border-t border-gray-50 flex justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100" />
          <div className="h-3 w-20 bg-gray-100 rounded-full" />
        </div>
        <div className="h-3 w-16 bg-gray-100 rounded-full" />
      </div>
    </div>
  </div>
);

// Featured hero post card (first/top post)
const HeroCard = ({ post, onClick }) => (
  <div
    className="group bg-white rounded-[48px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-700 cursor-pointer mb-12 flex flex-col md:flex-row"
    onClick={onClick}
  >
    <div className="relative md:w-1/2 h-80 md:h-auto overflow-hidden flex-shrink-0">
      <img
        src={post.image || FALLBACK_IMAGE}
        alt={post.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 group-hover:opacity-0 transition-opacity" />
      {post.views > 50 && (
        <div className="absolute top-5 left-5 bg-orange-500 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
          <Flame size={12} /> Trending
        </div>
      )}
      {post.category && (
        <div className="absolute top-5 right-5 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg">
          {post.category}
        </div>
      )}
    </div>
    <div className="p-10 md:p-14 flex flex-col justify-center flex-1">
      <div className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-5 opacity-70">
        FEATURED STORY · {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
      </div>
      <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-5 group-hover:text-blue-600 transition-colors leading-tight tracking-tight">
        {post.title}
      </h2>
      <p className="text-gray-500 text-[16px] leading-loose line-clamp-3 mb-8 font-medium">
        {post.content}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm border-2 border-white shadow-sm">
            {post.author?.name?.charAt(0) || "U"}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{post.author?.name || "Creator"}</p>
            <div className="flex gap-3 text-[11px] font-bold text-gray-400 mt-0.5">
              <span className="flex items-center gap-1"><Eye size={12} /> {post.views || 0}</span>
              <span className="flex items-center gap-1"><Heart size={12} /> {post.likes?.length || 0}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-blue-600 font-bold text-[13px] group-hover:gap-3 transition-all">
          Read Article <ArrowRight size={16} />
        </div>
      </div>
    </div>
  </div>
);

// Regular post card
const PostCard = ({ post, onClick }) => (
  <div
    className="group bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col cursor-pointer"
    onClick={onClick}
  >
    <div className="relative h-56 overflow-hidden">
      <img
        src={post.image || FALLBACK_IMAGE}
        alt={post.title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      {post.views > 50 && (
        <div className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
          <Flame size={10} /> Hot
        </div>
      )}
      {post.category && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-blue-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-md">
          {post.category}
        </div>
      )}
    </div>

    <div className="p-8 flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] font-black text-blue-600 uppercase tracking-widest opacity-60">
          {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
        <div className="flex gap-2">
          {post.tags?.slice(0, 2).map((tag, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-lg group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3 line-clamp-2 leading-snug">
        {post.title}
      </h3>
      <p className="text-gray-400 text-[14px] line-clamp-3 mb-8 flex-1 leading-relaxed font-medium">
        {post.content}
      </p>

      <div className="flex items-center justify-between pt-5 border-t border-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-[12px]">
            {post.author?.name?.charAt(0) || "U"}
          </div>
          <span className="text-[12px] font-bold text-gray-700">{post.author?.name || "Creator"}</span>
        </div>
        <div className="flex gap-3 text-[12px] font-bold text-gray-300">
          <span className="flex items-center gap-1"><Eye size={13} /> {post.views || 0}</span>
          <span className="flex items-center gap-1"><Heart size={13} /> {post.likes?.length || 0}</span>
        </div>
      </div>
    </div>
  </div>
);

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();

  const debouncedSearch = useDebounce(searchQuery, 600);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      let url;

      if (debouncedSearch.trim()) {
        const query = debouncedSearch.trim().replace(/^#/, "");
        const params = new URLSearchParams({ query });
        if (activeCategory !== "All") params.set("category", activeCategory);
        url = `/api/posts/search?${params.toString()}`;
      } else {
        const params = new URLSearchParams();
        if (activeCategory !== "All") params.set("category", activeCategory);
        url = `/api/posts/explore?${params.toString()}`;
      }

      const data = await request(url);
      setPosts(data);
    } catch (err) {
      console.error("Error fetching explore/search posts:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeCategory]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const [featuredPost, ...restPosts] = posts;
  const isFiltered = debouncedSearch.trim() || activeCategory !== "All";

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-0 font-inter">
      {/* SaaS Hero Section */}
      <section className="bg-white border-b border-gray-100 pt-20 pb-12 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl text-[12px] font-black uppercase tracking-widest mb-6 border border-blue-100/50">
            <TrendingUp size={14} /> Trending Stories
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-5 tracking-tight leading-[1.1]">
            Explore <span className="text-blue-600">Ideas</span>, Stories & Inspiration
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Discover trending posts and personalized recommendations from creators worldwide.
          </p>

          {/* Integrated Search Bar */}
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-300 group-focus-within:text-blue-500 transition-colors">
              <Search size={22} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder="Search by tag (e.g. react, ai, web3)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-14 py-5 bg-gray-50 border border-gray-100 rounded-[24px] focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none text-gray-900 font-medium text-[17px] shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-5 flex items-center text-gray-300 hover:text-red-400 transition-colors"
              >
                <X size={20} strokeWidth={3} />
              </button>
            )}
          </div>
         

          {/* Category Filter Chips */}
          <div className="flex flex-wrap justify-center gap-2.5 mt-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-2xl text-[13px] font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                    : "bg-white text-gray-500 border border-gray-100 hover:border-blue-100 hover:text-blue-600 hover:bg-blue-50/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-7xl mx-auto px-6 mt-14">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : posts.length > 0 ? (
          <>
            {/* Post count label */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">
                {posts.length} {posts.length === 1 ? "Article" : "Articles"} Found
                {activeCategory !== "All" && <span className="ml-2 text-blue-500">in {activeCategory}</span>}
              </p>
              {isFiltered && (
                <button
                  onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                  className="text-[12px] font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <X size={14} /> Clear Filters
                </button>
              )}
            </div>

            {/* Featured Hero (first post, only when not searching) */}
            {featuredPost && !debouncedSearch.trim() && (
              <HeroCard
                post={featuredPost}
                onClick={() => navigate(`/post/${featuredPost._id}`)}
              />
            )}

            {/* Grid of remaining posts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {(debouncedSearch.trim() ? posts : restPosts).map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onClick={() => navigate(`/post/${post._id}`)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white p-20 rounded-[48px] shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center my-4">
            <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center mb-8 border border-gray-100">
              <TrendingUp size={44} className="text-gray-200" />
            </div>
            <h3 className="text-gray-900 text-2xl font-black tracking-tight mb-3">No results found</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto mb-10 leading-relaxed font-medium">
              We couldn't find any matches for "<strong>{searchQuery || activeCategory}</strong>". Try a different keyword or category.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
              className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 hover:shadow-xl transition-all active:scale-95"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Footer CTA Banner */}
      
    </div>
  );
};

export default Explore;
