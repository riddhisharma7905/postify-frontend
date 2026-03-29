import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  FileText,
  X,
  CheckCheck,
} from "lucide-react";
import { request } from "../api";

// ── Time helper ───────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// ── Notification type metadata ────────────────────────────────────────────────
const TYPE_META = {
  like: {
    icon: Heart,
    color: "text-pink-500",
    bg: "bg-pink-50",
    label: (n) => `liked your post "${n.post?.title || "a post"}"`,
  },
  comment: {
    icon: MessageCircle,
    color: "text-blue-500",
    bg: "bg-blue-50",
    label: (n) => `commented on "${n.post?.title || "a post"}"`,
  },
  follow: {
    icon: UserPlus,
    color: "text-purple-500",
    bg: "bg-purple-50",
    label: () => "started following you",
  },
  new_post: {
    icon: FileText,
    color: "text-green-500",
    bg: "bg-green-50",
    label: (n) => `published "${n.post?.title || "a new post"}"`,
  },
  reply: {
    icon: MessageCircle,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    label: () => `replied to your comment`,
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sseStatus, setSseStatus] = useState("idle"); // idle | connected | error
  const panelRef = useRef(null);
  const sseRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");
  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";

  // ── SSE connection ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    function connect() {
      // Close any existing connection
      if (sseRef.current) {
        sseRef.current.close();
      }

      const url = `${backendUrl}/api/notifications/stream?token=${token}`;
      const es = new EventSource(url);
      sseRef.current = es;

      es.addEventListener("connected", () => {
        setSseStatus("connected");
      });

      es.addEventListener("notification", (e) => {
        try {
          const newNotif = JSON.parse(e.data);

          // Prepend to list (most recent first)
          setNotifications((prev) => {
            // Replace if already exists (re-notified same action)
            const exists = prev.find((n) => n._id === newNotif._id);
            if (exists) {
              return prev.map((n) => (n._id === newNotif._id ? newNotif : n));
            }
            return [newNotif, ...prev];
          });

          // Bump unread count
          if (!newNotif.read) {
            setUnreadCount((c) => c + 1);
          }
        } catch (_) {}
      });

      es.onerror = () => {
        setSseStatus("error");
        es.close();
        // Reconnect after 5s
        setTimeout(connect, 5000);
      };
    }

    connect();

    return () => {
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
    };
  }, [token, backendUrl]);

  // ── Fetch initial unread count ────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    request("/api/notifications/unread-count", "GET", null, {
      Authorization: `Bearer ${token}`,
    })
      .then((d) => setUnreadCount(d.count || 0))
      .catch(() => {});
  }, [token]);

  // ── Fetch full list when panel opens ─────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await request("/api/notifications", "GET", null, {
        Authorization: `Bearer ${token}`,
      });
      setNotifications(data);
      // Recalculate unread from fresh data
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleMarkAllRead = async () => {
    try {
      await request("/api/notifications/mark-all-read", "PUT", null, {
        Authorization: `Bearer ${token}`,
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      alert("Marked all as read");
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const handleClearAll = async () => {
    // Optimistic UI update for instantaneous feel
    setNotifications([]);
    setUnreadCount(0);
    
    try {
      await request("/api/notifications/clear-all", "DELETE", null, {
        Authorization: `Bearer ${token}`,
      });
    } catch (err) {
      console.error("Clear all error:", err);
      // Re-fetch on error to stay in sync
      fetchNotifications();
    }
  };

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // ── Click single notification ─────────────────────────────────────────────
  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await request(`/api/notifications/${notif._id}/read`, "PUT", null, {
          Authorization: `Bearer ${token}`,
        });
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (_) {}
    }

    if (notif.post?._id) {
      navigate(`/post/${notif.post._id}`);
      setOpen(false);
    } else if (notif.type === "follow" && notif.sender?._id) {
      navigate(`/author/${notif.sender._id}`);
      setOpen(false);
    }
  };

  if (!token) return null;

  return (
    <div className="notification-wrapper" ref={panelRef}>
      {/* ── Bell Button ── */}
      <button
        id="notification-bell-btn"
        className={`notification-bell-btn ${open ? "active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={20} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {/* SSE live dot */}
        {sseStatus === "connected" && (
          <span className="sse-live-dot" title="Live" />
        )}
      </button>

      {/* ── Sliding Drawer ── */}
      <div
        className={`notification-panel ${open ? "notification-panel--open" : ""}`}
      >
        {/* Header */}
        <div className="notif-panel-header">
          <div className="notif-panel-title">
            <Bell size={18} strokeWidth={2.5} />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="notif-count-pill">{unreadCount} new</span>
            )}
          </div>
          <div className="notif-panel-actions">
            <div className="flex items-center gap-4">
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors"
              >
                Mark all read
              </button>
              <button
                onClick={handleClearAll}
                className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
              >
                Clear all
              </button>
            </div>
            <button
              className="notif-close-btn"
              onClick={() => setOpen(false)}
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="notif-panel-body">
          {loading ? (
            <div className="notif-empty">
              <div className="notif-spinner" />
              <p>Loading…</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notif-empty">
              <div className="notif-empty-icon">
                <Bell size={28} strokeWidth={1.5} />
              </div>
              <p className="notif-empty-title">You're all caught up!</p>
              <p className="notif-empty-sub">
                Likes, comments and follows will appear here instantly.
              </p>
            </div>
          ) : (
            <ul className="notif-list">
              {notifications.map((n) => {
                const meta = TYPE_META[n.type] || TYPE_META.like;
                const Icon = meta.icon;
                return (
                  <li
                    key={n._id}
                    className={`notif-item ${!n.read ? "notif-item--unread" : ""}`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <div className={`notif-avatar ${meta.bg}`}>
                      <Icon size={16} className={meta.color} strokeWidth={2.5} />
                    </div>
                    <div className="notif-content">
                      <p className="notif-text">
                        <strong>{n.sender?.name || "Someone"}</strong>{" "}
                        {meta.label(n)}
                      </p>
                      <span className="notif-time">{timeAgo(n.createdAt)}</span>
                    </div>
                    {!n.read && <span className="notif-dot" />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="notif-backdrop"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
