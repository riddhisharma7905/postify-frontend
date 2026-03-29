import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MessageCircle, Calendar, Send, Trash2, Pencil, CornerDownRight } from "lucide-react";
import { request } from "../api";

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [recommended, setRecommended] = useState([]);
  // Replies: { [commentId]: isOpen, replyText, isSubmitting, showAll }
  const [replyState, setReplyState] = useState({});
  const token = localStorage.getItem("authToken");

  const parseToken = (t) => {
    try { return JSON.parse(atob(t.split(".")[1])); } catch { return null; }
  };

  const userId = token ? parseToken(token)?.id : null;

  // Smart navigate: own profile → dashboard, others → author page
  const navigateToUser = (targetUserId) => {
    if (targetUserId === userId) navigate("/dashboard");
    else navigate(`/author/${targetUserId}`);
  };

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const headers = {};
      if (token) {
        const decoded = parseToken(token);
        if (decoded) headers["x-user-id"] = decoded.id;
      }
      const data = await request(`/api/posts/${id}`, "GET", null, headers);
      setPost(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  const fetchRecommendations = useCallback(async () => {
    try {
      const data = await request(`/api/posts/${id}/recommendations`);
      setRecommended(data);
    } catch { setRecommended([]); }
  }, [id]);

  const isViewIncremented = useRef(false);

  useEffect(() => {
    fetchPost();
    fetchRecommendations();
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (!isViewIncremented.current && id) {
      isViewIncremented.current = true;
      request(`/api/posts/${id}/view`, "POST").catch(() => {});
    }
  }, [fetchPost, fetchRecommendations, id]);

  const handleLike = async () => {
    if (!token) return alert("Please login to like posts!");
    try {
      setIsLiking(true);
      const updated = await request(`/api/posts/${id}/like`, "POST", null, { Authorization: `Bearer ${token}` });
      setPost(updated);
    } catch { alert("Error liking post"); }
    finally { setIsLiking(false); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!token) { alert("Please login to comment!"); return; }
    if (!commentText.trim()) return;
    try {
      const updated = await request(`/api/posts/${id}/comment`, "POST", { text: commentText }, { Authorization: `Bearer ${token}` });
      setPost(updated);
      setCommentText("");
    } catch (err) {
      alert(err.message || "Something went wrong.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await request(`/api/posts/${id}/comment/${commentId}`, "DELETE", null, { Authorization: `Bearer ${token}` });
      setPost((prev) => ({ ...prev, comments: prev.comments.filter((c) => c._id !== commentId) }));
    } catch { alert("Error deleting comment"); }
  };

  // ── Reply helpers ──
  const setReply = (commentId, patch) =>
    setReplyState((prev) => ({ ...prev, [commentId]: { ...prev[commentId], ...patch } }));

  const handleToggleReply = (commentId, tagName = "") => {
    const isNowOpen = !replyState[commentId]?.isOpen;
    setReply(commentId, {
      isOpen: isNowOpen,
      replyText: isNowOpen && tagName ? `@${tagName} ` : (replyState[commentId]?.replyText || ""),
    });
  };

  const handleAddReply = async (e, commentId) => {
    e.preventDefault();
    if (!token) { alert("Please login to reply!"); return; }
    const text = replyState[commentId]?.replyText?.trim();
    if (!text) return;

    setReply(commentId, { isSubmitting: true });
    try {
      const updated = await request(
        `/api/posts/${id}/comment/${commentId}/reply`,
        "POST",
        { text },
        { Authorization: `Bearer ${token}` }
      );
      setPost(updated);
      setReply(commentId, { replyText: "", isOpen: false, isSubmitting: false });
    } catch (err) {
      alert(err.message || "Error adding reply");
      setReply(commentId, { isSubmitting: false });
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm("Delete this reply?")) return;
    try {
      const updated = await request(
        `/api/posts/${id}/comment/${commentId}/reply/${replyId}`,
        "DELETE",
        null,
        { Authorization: `Bearer ${token}` }
      );
      setPost(updated);
    } catch { alert("Error deleting reply"); }
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
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Go Back</button>
      </div>
    );

  if (!post)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Post not found.</p>
      </div>
    );

  const hasLiked = Array.isArray(post.likes) && post.likes.some((like) => like === userId || like?._id === userId);

  // Calculate total comments (top level + all replies)
  const totalComments = (post?.comments || []).reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 flex justify-center">
      <div className="max-w-3xl w-full bg-white shadow-md rounded-2xl p-8">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-blue-600 transition">
            <ArrowLeft size={18} className="mr-2" /> Back
          </button>
          {userId && post.author?._id === userId && (
            <button
              onClick={() => navigate(`/edit/${id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition text-sm"
            >
              <Pencil size={15} /> Edit Post
            </button>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-3">{post.title}</h1>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
          <span className="flex items-center gap-1"><Calendar size={14} />{new Date(post.createdAt).toLocaleDateString()}</span>
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-1 ${hasLiked ? "text-red-500" : "text-gray-600 hover:text-red-500"} ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Heart size={16} className={isLiking ? "animate-pulse" : ""} fill={hasLiked ? "red" : "none"} />
            {post.likes?.length || 0} likes
          </button>
          <span className="flex items-center gap-1"><MessageCircle size={14} /> {totalComments} comments</span>
          <span className="flex items-center gap-1">👁 {post.views || 0} views</span>
        </div>

        {/* Cover image */}
        {post.image && (
          <div className="mb-6 rounded-xl overflow-hidden h-64">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line mb-6">{post.content}</div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag, i) => (
              <span key={i} className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full font-medium">#{tag}</span>
            ))}
          </div>
        )}

        {/* Author */}
        {post.author && (
          <div className="mt-8 border-t pt-4 text-gray-600 text-sm">
            <p>
              By{" "}
              <button
                onClick={() => navigateToUser(post.author._id)}
                className="font-bold text-blue-600 hover:underline"
              >
                {post.author.name || "Author"}
              </button>
              {post.category && (
                <span className="ml-3 text-[11px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-lg">{post.category}</span>
              )}
            </p>
          </div>
        )}

        {/* ── Comments Section ── */}
        <div className="mt-10 border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Comments <span className="text-gray-400 text-sm font-normal">({totalComments})</span>
          </h2>

          {/* New comment form */}
          <form onSubmit={handleAddComment} className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
              {userId ? "Y" : "?"}
            </div>
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none text-sm"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-blue-700 transition disabled:opacity-40 text-sm font-bold"
            >
              <Send size={15} /> Post
            </button>
          </form>

          {/* Comments list */}
          <div className="space-y-5">
            {post.comments?.length > 0 ? (
              post.comments.map((comment) => {
                const rs = replyState[comment._id] || {};
                return (
                  <div key={comment._id} className="group">
                    {/* Comment bubble */}
                    <div className={`rounded-2xl p-4 text-sm border ${
                      comment.isToxic ? "bg-red-50 border-red-200 text-red-700" : "bg-gray-50 border-gray-100 text-gray-700"
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Commenter avatar */}
                          <div
                            onClick={() => comment.user?._id && navigateToUser(comment.user._id)}
                            className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0 cursor-pointer hover:bg-blue-200 transition-colors"
                            title="View profile"
                          >
                            {comment.user?.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div className="flex-1">
                            <button
                              onClick={() => comment.user?._id && navigateToUser(comment.user._id)}
                              className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-[13px]"
                            >
                              {comment.user?.name || "User"}
                            </button>
                            <p className="mt-1 text-[14px] leading-relaxed">{comment.text}</p>
                            {comment.isToxic && (
                              <p className="text-xs text-red-500 mt-1 font-semibold">⚠️ Flagged as toxic</p>
                            )}

                            {/* Action row */}
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-[11px] text-gray-400">
                                {new Date(comment.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                              </span>
                              {token && (
                                  <button
                                    onClick={() => handleToggleReply(comment._id, comment.user?.name)}
                                    className="text-[12px] font-bold text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1"
                                  >
                                    <CornerDownRight size={12} />
                                    {rs.isOpen ? "Cancel" : "Reply"}
                                  {comment.replies?.length > 0 && (
                                    <span className="ml-1 bg-blue-100 text-blue-600 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                      {comment.replies.length}
                                    </span>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Delete comment (own only) */}
                        {comment.user?._id === userId && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ── Replies ── */}
                    {(comment.replies?.length > 0 || rs.isOpen) && (
                      <div className="ml-11 mt-2 space-y-2">
                        {/* Existing replies */}
                        {comment.replies?.slice(0, rs.showAll ? comment.replies.length : 1).map((reply) => (
                          <div
                            key={reply._id}
                            className={`group/reply flex items-start gap-2.5 p-3 rounded-xl border text-sm ${
                              reply.isToxic ? "bg-red-50 border-red-100 text-red-700" : "bg-blue-50/40 border-blue-50 text-gray-700"
                            }`}
                          >
                            <div
                              onClick={() => reply.user?._id && navigateToUser(reply.user._id)}
                              className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px] flex-shrink-0 cursor-pointer hover:bg-blue-200 transition-colors"
                            >
                              {reply.user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <button
                                  onClick={() => reply.user?._id && navigateToUser(reply.user._id)}
                                  className="font-bold text-gray-800 hover:text-blue-600 text-[12px] transition-colors"
                                >
                                  {reply.user?.name || "User"}
                                </button>
                                {reply.user?._id === userId && (
                                  <button
                                    onClick={() => handleDeleteReply(comment._id, reply._id)}
                                    className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover/reply:opacity-100 flex-shrink-0"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                              <p className="text-[13px] mt-0.5">{reply.text}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-[10px] text-gray-400">
                                  {new Date(reply.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                </p>
                                {token && (
                                  <button
                                    onClick={() => handleToggleReply(comment._id, reply.user?.name)}
                                    className="text-[10px] font-bold text-blue-500/60 hover:text-blue-600 transition-colors"
                                  >
                                    Reply
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Show more/less toggle */}
                        {comment.replies?.length > 1 && (
                          <button
                            onClick={() => setReply(comment._id, { showAll: !rs.showAll })}
                            className="text-[11px] font-black text-blue-600/60 hover:text-blue-600 transition-colors ml-9 mt-1 flex items-center gap-1.5"
                          >
                            <span className="w-4 h-[1px] bg-blue-200"></span>
                            {rs.showAll ? "Hide replies" : `View ${comment.replies.length - 1} more replies...`}
                          </button>
                        )}

                        {/* Reply input */}
                        {rs.isOpen && (
                          <form
                            onSubmit={(e) => handleAddReply(e, comment._id)}
                            className="flex items-center gap-2 mt-2"
                          >
                            <input
                              type="text"
                              autoFocus
                              placeholder={`Reply to ${comment.user?.name || "this comment"}...`}
                              value={rs.replyText || ""}
                              onChange={(e) => setReply(comment._id, { replyText: e.target.value })}
                              className="flex-1 border border-blue-100 bg-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                            />
                            <button
                              type="submit"
                              disabled={!rs.replyText?.trim() || rs.isSubmitting}
                              className="bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-40 text-xs font-bold flex items-center gap-1 transition"
                            >
                              <Send size={12} /> {rs.isSubmitting ? "..." : "Reply"}
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommended.length > 0 && (
          <div className="mt-10 border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recommended Posts ✨</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {recommended.map((rec) => (
                <div
                  key={rec._id}
                  onClick={() => { navigate(`/post/${rec._id}`); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="cursor-pointer bg-gray-50 hover:bg-gray-100 p-4 rounded-xl border transition"
                >
                  <h3 className="font-semibold text-gray-800 mb-1">{rec.title}</h3>
                  <div className="flex flex-wrap gap-1 text-xs text-blue-600">
                    {rec.tags?.slice(0, 3).map((t, i) => <span key={i}>#{t}</span>)}
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
