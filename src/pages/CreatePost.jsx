import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft,  Loader2 } from "lucide-react";

const CreatePost = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
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

    try {
      const res = await fetch("http://localhost:5001/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          tags: tags.split(",").map((t) => t.trim()),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to publish post");

      alert("Post Published Successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Publish error:", err);
      setError(err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">

      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        <h1 className="text-2xl font-bold text-gray-800">
          Create New Blog Post
        </h1>
      </div>

      <form
        onSubmit={handlePublish}
        className="bg-white w-full max-w-4xl p-8 rounded-xl shadow-md"
      >
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter an engaging title..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <textarea
            rows="10"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="Write your blog post here..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          ></textarea>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. React, JavaScript, WebDev"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600 font-medium"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isPublishing}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70"
          >
            {isPublishing ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Publishing...
              </>
            ) : (
              "Publish Post"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
