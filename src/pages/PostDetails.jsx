import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MessageCircle, Calendar, Send, Trash2 } from "lucide-react";

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [recommended, setRecommended] = useState([]);
  const token = localStorage.getItem("authToken");

  const viewCounted = useRef(false);
  const userId = token ? JSON.parse(atob(token.split(".")[1]))?.id : null;

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5001/api/posts/${id}`);
      if (!res.ok) throw new Error("Failed to load post");
      const data = await res.json();
      setPost(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchRecommendations = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/posts/${id}/recommendations`);
      if (!res.ok) throw new Error("Failed to load recommendations");
      const data = await res.json();
      setRecommended(data);
    } catch (err) {
      console.error("Recommendation error:", err);
      setRecommended([]); // fallback empty list
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
    fetchRecommendations();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);


  const handleLike = async () => {
    if (!token) return alert("Please login to like posts!");
    try {
      setIsLiking(true);
      const res = await fetch(`http://localhost:5001/api/posts/${id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to like/unlike post");
      const updated = await res.json();
      setPost(updated);
    } catch (err) {
      console.error(err);
      alert("Error liking post");
    } finally {
      setIsLiking(false);
    }
  };

  // Add comment with toxicity check (assuming backend endpoint available)
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Please login to comment!");
      return;
    }
    if (!commentText.trim()) return;

    try {
      const toxicityResponse = await fetch("http://127.0.0.1:5002/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText }),
      });
      const toxicityData = await toxicityResponse.json();
      if (toxicityData.is_toxic) {
        alert("You can’t post toxic or abusive comments.\nThey violate our community guidelines.");
        setCommentText("");
        return;
      }

      const res = await fetch(`http://localhost:5001/api/posts/${id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: commentText }),
      });
      if (!res.ok) throw new Error("Failed to add comment");

      const updated = await res.json();
      setPost(updated);
      setCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Something went wrong. Please try again later.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const res = await fetch(
        `http://localhost:5001/api/posts/${id}/comment/${commentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete comment");
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c._id !== commentId),
      }));
    } catch (err) {
      console.error(err);
      alert("Error deleting comment");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg mb-3">Error: {error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );

  if (!post)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Post not found.</p>
      </div>
    );

  const hasLiked =
    Array.isArray(post.likes) &&
    post.likes.some((like) => like === userId || like?._id === userId);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 flex justify-center">
      <div className="max-w-3xl w-full bg-white shadow-md rounded-2xl p-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </button>


        <h1 className="text-3xl font-bold text-gray-800 mb-3">{post.title}</h1>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-1 ${hasLiked
                ? "text-red-500"
                : "text-gray-500 hover:text-red-500 transition"
              } ${isLiking ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <Heart
              size={16}
              className={`${isLiking ? "animate-pulse" : ""}`}
              fill={hasLiked ? "red" : "none"}
            />
            {post.likes?.length || 0} likes
          </button>
          <span className="flex items-center gap-1">
            <MessageCircle size={14} /> {post.comments?.length || 0} comments
          </span>
          <span className="flex items-center gap-1">👁 {post.views || 0} views</span>
        </div>

        <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line mb-6">
          {post.content}
        </div>

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {post.author && (
          <div className="mt-8 border-t pt-4 text-gray-600 text-sm">
            <p>
              By{" "}
              <span
                className="font-medium text-blue-600 cursor-pointer hover:underline"
                onClick={() => {
                  const currentUserId = JSON.parse(
                    atob(token?.split(".")[1] || "{}")
                  )?.id;
                  if (post.author._id === currentUserId) navigate("/dashboard");
                  else navigate(`/author/${post.author._id}`);
                }}
              >
                {post.author.name || "Author"}
              </span>
            </p>
          </div>
        )}


        <div className="mt-10 border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Comments</h2>

          <form onSubmit={handleAddComment} className="flex items-center gap-3 mb-6">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Send size={16} /> Post
            </button>
          </form>

          <div className="space-y-4">
            {post.comments?.length > 0 ? (
              post.comments.map((comment) => (
                <div
                  key={comment._id}
                  className={`rounded-lg p-3 text-sm border flex justify-between items-start ${comment.isToxic
                      ? "bg-red-50 border-red-300 text-red-700"
                      : "bg-gray-100 border-gray-200 text-gray-700"
                    }`}
                >
                  <div>
                    <p className="font-medium text-gray-900">{comment.user?.name || "User"}</p>
                    <p className="mt-1">{comment.text}</p>
                    {comment.isToxic && (
                      <p className="text-xs text-red-500 mt-1 font-semibold">
                        Toxic Comment
                      </p>
                    )}
                  </div>

                  {comment.user?._id === userId && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>


        {recommended.length > 0 && (
          <div className="mt-10 border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recommended Posts ✨</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {recommended.map((rec) => (
                <div
                  key={rec._id}
                  onClick={() => {
                    navigate(`/post/${rec._id}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="cursor-pointer bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border transition"
                >
                  <h3 className="font-semibold text-gray-800 mb-1">{rec.title}</h3>
                  <div className="flex flex-wrap gap-1 text-xs text-blue-600">
                    {rec.tags?.slice(0, 3).map((t, i) => (
                      <span key={i}>#{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetails;
