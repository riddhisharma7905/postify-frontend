import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Calendar, Tag, Image, ChevronDown } from "lucide-react";
import { request } from "../api";

const CATEGORIES = ["Technology", "Business", "Education", "Career", "Lifestyle", "Health", "Travel", "Others"];

const CreatePost = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("Others");
  const [imageUrl, setImageUrl] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState("");

  const handlePublish = async (e) => {
    e.preventDefault();
    setIsPublishing(true);
    setError("");

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please log in before creating a post.");
      navigate("/login");
      return;
    }

    if (isScheduled && !scheduledAt) {
      setError("Please select a date and time for scheduling.");
      setIsPublishing(false);
      return;
    }

    try {
      await request(
        "/api/posts",
        "POST",
        {
          title,
          content,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          category,
          image: imageUrl.trim() || null,
          scheduledAt: isScheduled ? scheduledAt : null,
        },
        { Authorization: `Bearer ${token}` }
      );

      alert(isScheduled ? "✅ Post Scheduled Successfully!" : "✅ Post Published Successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Publish error:", err);
      setError(err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const now = new Date();
  const getLocalDateTimeString = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d}T${hh}:${mm}`;
  };

  const minDate = getLocalDateTimeString(now);
  const maxDate = new Date();
  maxDate.setDate(now.getDate() + 3);
  const maxDateStr = getLocalDateTimeString(maxDate);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center py-10 px-4 font-sans">
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium border border-gray-100 px-4 py-2 rounded-xl hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create New Post</h1>
        <div className="w-[82px]"></div>
      </div>

      <form onSubmit={handlePublish} className="w-full max-w-4xl space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-3">
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
              rows="12"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="What's on your mind? Share your ideas, insights, and stories..."
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 font-medium transition-all resize-none placeholder:text-gray-300"
            ></textarea>
          </div>
        </div>

        {/* Metadata Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
          <h3 className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Post Details</h3>

          {/* Category Dropdown */}
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
              <div className="mt-3 rounded-2xl overflow-hidden h-40 bg-gray-100">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={() => setImageUrl("")} />
              </div>
            )}
          </div>
        </div>

        {/* Scheduling Options */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                <Calendar size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 tracking-tight">Schedule Post</h3>
                <p className="text-[13px] text-gray-500 mt-0.5">Pick a time in the next 3 days</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isScheduled}
                onChange={() => setIsScheduled(!isScheduled)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          {isScheduled && (
            <div className="mt-6 animate-in fade-in slide-in-from-top-1 duration-300">
              <input
                type="datetime-local"
                value={scheduledAt}
                min={minDate}
                max={maxDateStr}
                onChange={(e) => setScheduledAt(e.target.value)}
                required={isScheduled}
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 font-semibold transition-all"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2 pb-10">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-8 py-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 text-gray-600 font-bold transition-all"
          >
            Discard
          </button>

          <button
            type="submit"
            disabled={isPublishing}
            className="px-10 py-4 bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-600 flex items-center gap-3 disabled:opacity-70 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
          >
            {isPublishing ? (
              <>
                <Loader2 size={20} className="animate-spin" /> {isScheduled ? "Scheduling..." : "Publishing..."}
              </>
            ) : (
              isScheduled ? "Schedule Now" : "Publish Now"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
