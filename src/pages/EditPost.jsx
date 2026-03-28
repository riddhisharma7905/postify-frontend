import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Tag, Image, ChevronDown, Save } from "lucide-react";
import { request } from "../api";

const CATEGORIES = ["Technology", "Business", "Education", "Career", "Lifestyle", "Health", "Travel", "Others"];

const EditPost = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("Others");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchPost = async () => {
      try {
        const post = await request(`/api/posts/${id}`);
        setTitle(post.title || "");
        setContent(post.content || "");
        setTags((post.tags || []).join(", "));
        setCategory(post.category || "Others");
        setImageUrl(post.image || "");
      } catch (err) {
        setError("Failed to load post: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, token, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await request(
        `/api/posts/${id}`,
        "PUT",
        {
          title,
          content,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          category,
          image: imageUrl.trim() || null,
        },
        { Authorization: `Bearer ${token}` }
      );

      alert("✅ Post updated successfully!");
      navigate(`/post/${id}`);
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center py-10 px-4 font-sans">
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium border border-gray-100 px-4 py-2 rounded-xl hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Post</h1>
        <div className="w-[72px]"></div>
      </div>

      <form onSubmit={handleSave} className="w-full max-w-4xl space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div>
            <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-3">
              Post Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Give your thoughts a headline..."
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 text-lg font-semibold transition-all placeholder:text-gray-300 placeholder:font-normal"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-3">
              Content
            </label>
            <textarea
              rows="14"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="What's on your mind?"
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 font-medium transition-all resize-none placeholder:text-gray-300"
            ></textarea>
          </div>
        </div>

        {/* Metadata Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
          <h3 className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Post Details</h3>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Tag size={15} className="text-blue-500" /> Category
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 font-semibold transition-all appearance-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Tag size={15} className="text-blue-500" /> Tags
              <span className="text-gray-400 font-normal">(comma separated)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. React, AI, Startups"
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 font-medium transition-all placeholder:text-gray-300"
            />
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Image size={15} className="text-blue-500" /> Cover Image URL
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/your-image.jpg"
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 font-medium transition-all placeholder:text-gray-300"
            />
            {imageUrl && (
              <div className="mt-3 rounded-2xl overflow-hidden h-48 bg-gray-100">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => setImageUrl("")}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 pb-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 text-gray-600 font-bold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 flex items-center gap-3 disabled:opacity-70 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
          >
            {isSaving ? (
              <><Loader2 size={20} className="animate-spin" /> Saving...</>
            ) : (
              <><Save size={20} /> Save Changes</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;
