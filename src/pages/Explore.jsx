import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../api"; 

function useDebounce(value, delay = 600) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const debouncedSearch = useDebounce(searchQuery, 600);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        let url = "/api/posts";

        if (debouncedSearch.trim()) {
          const query = debouncedSearch.trim().replace(/^#/, "");
          url += `/search?query=${encodeURIComponent(query)}`;
        } else {
          url += "/explore";
        }

        const data = await request(url);
        setPosts(data);
      } catch (err) {
        console.error("Error fetching explore/search posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [debouncedSearch]);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <p>Loading curated posts...</p>
      </div>
    );

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <h1 style={styles.title}>Explore Ideas, Stories & Inspiration</h1>
        <p style={styles.subtitle}>
          Discover trending posts and personalized recommendations from creators worldwide.
        </p>

        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by tag or hashtag (e.g. #React)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </section>

      <section style={styles.results}>
        {posts.length > 0 ? (
          <div style={styles.cardGrid}>
            {posts.map((post) => (
              <div
                key={post._id}
                style={styles.card}
                onClick={() => navigate(`/post/${post._id}`)}
              >
                <img
                  src={
                    post.image ||
                    "https://images.unsplash.com/photo-1506765515384-028b60a970df?w=800&h=400&fit=crop"
                  }
                  alt={post.title}
                  style={styles.cardImage}
                />
                <div style={styles.cardContent}>
                  <h3 style={styles.cardTitle}>{post.title}</h3>
                  <p style={styles.cardExcerpt}>
                    {post.content.length > 120
                      ? post.content.slice(0, 120) + "..."
                      : post.content}
                  </p>
                  <div style={styles.meta}>
                    <span>{post.author?.name || "Unknown"}</span> •{" "}
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    {post.tags?.slice(0, 3).map((tag, i) => (
                      <small key={i} style={styles.cardTag}>
                        #{tag}
                      </small>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.noResults}>
            <p>
              No results found for <strong>{searchQuery}</strong>
            </p>
            <button style={styles.clearBtn} onClick={() => setSearchQuery("")}>
              Clear Search
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #f9fafb, #eef2f7)",
    fontFamily: "Poppins, sans-serif",
    color: "#222",
    paddingBottom: "50px",
  },
  hero: {
    textAlign: "center",
    padding: "60px 20px 40px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#111",
  },
  subtitle: {
    maxWidth: "600px",
    margin: "10px auto 30px",
    color: "#555",
    fontSize: "1.1rem",
  },
  searchContainer: {
    marginBottom: "20px",
  },
  searchInput: {
    width: "90%",
    maxWidth: "500px",
    padding: "12px 15px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    outline: "none",
    transition: "0.3s",
  },
  results: {
    padding: "30px 40px",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
  },
  card: {
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer",
  },
  cardImage: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
  },
  cardContent: {
    padding: "15px",
  },
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    marginBottom: "8px",
  },
  cardExcerpt: {
    fontSize: "0.95rem",
    color: "#555",
    marginBottom: "10px",
  },
  meta: {
    fontSize: "0.85rem",
    color: "#777",
    marginBottom: "10px",
  },
  cardTag: {
    marginRight: "8px",
    color: "#2563eb",
    fontWeight: "500",
  },
  noResults: {
    textAlign: "center",
    marginTop: "50px",
  },
  clearBtn: {
    marginTop: "10px",
    padding: "8px 15px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
    transition: "0.3s",
  },
};

export default Explore;
