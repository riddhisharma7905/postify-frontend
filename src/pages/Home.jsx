import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, PenLine, Sparkles, Shield,
  Zap, ChevronRight, Hash, TrendingUp, MessageCircle, BookOpen,
} from 'lucide-react';
import { request } from '../api';
import '../styles/home.css';

const FEATURES = [
  {
    icon: Shield,
    title: 'AI Toxic Comment Filter',
    desc: 'Our built-in ML model automatically blocks hateful or abusive comments — keeping the community respectful without any manual work.',
  },
  {
    icon: Sparkles,
    title: 'Smart Recommendations',
    desc: 'Every post page shows you similar reads based on matching tags and category — so readers always find their next favourite story.',
  },
  {
    icon: Zap,
    title: 'Schedule & Draft Posts',
    desc: "Write now, publish later. Schedule posts up to 3 days in advance or save drafts and come back when you're ready.",
  },
  {
    icon: TrendingUp,
    title: 'Author Analytics',
    desc: 'Track views, likes, and comments on every post from your dashboard. Know what your audience loves and write more of it.',
  },
  {
    icon: MessageCircle,
    title: 'Threaded Comments & Replies',
    desc: 'Real conversations happen here. Comments support nested replies, so discussions stay organised and easy to follow.',
  },
  {
    icon: BookOpen,
    title: 'Tag-Based Search',
    desc: 'Search by title, content, or hashtags. Find any post on the platform in seconds — no account required.',
  },
];

function PostCard({ post }) {
  const navigate = useNavigate();
  return (
    <div className="hp-post-card" onClick={() => navigate(`/post/${post.slug || post._id}`)}>
      <div className="hp-post-img">
        {post.image
          ? <img src={post.image} alt={post.title} />
          : <div className="hp-post-img-placeholder"><PenLine size={28} /></div>}
      </div>
      <div className="hp-post-body">
        {post.category && <span className="hp-post-category">{post.category}</span>}
        <h3 className="hp-post-title">{post.title}</h3>
        <div className="hp-post-meta">
          <div className="hp-post-author">
            {post.author?.profileImage
              ? <img src={post.author.profileImage} alt={post.author.name} className="hp-post-avatar" />
              : <div className="hp-post-avatar hp-post-avatar-initials">{post.author?.name?.charAt(0)?.toUpperCase() || 'U'}</div>}
            <span>{post.author?.name || 'Author'}</span>
          </div>
          <div className="hp-post-stats">
            <span>👁 {post.views || 0}</span>
            <span>❤️ {post.likes?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const Home = () => {
  const navigate      = useNavigate();
  const [posts, setPosts]         = useState([]);
  useEffect(() => {
    request('/api/posts?limit=6')
      .then((d) => setPosts((Array.isArray(d) ? d : d.posts || []).slice(0, 6)))
      .catch(() => {});
  }, []);



  return (
    <div className="hp-root">
      <section className="hp-hero">
        <div className="hp-hero-blob hp-hero-blob1" />
        <div className="hp-hero-blob hp-hero-blob2" />

        <div className="hp-hero-left">
          <div className="hp-badge">
            <Sparkles size={12} />
            <span>The modern blogging platform</span>
          </div>

          <h1 className="hp-hero-title">
            Your Ideas Deserve<br />
            a <span className="hp-gradient-text">Better Stage</span>
          </h1>

          <p className="hp-hero-sub">
            Postify is where curious minds publish, discover, and connect.
            Share your expertise, grow your audience, and read stories that actually matter.
          </p>

          <div className="hp-hero-btns">
            <button className="hp-btn-primary" onClick={() => navigate('/register')}>
              Start Writing Free <ArrowRight size={15} />
            </button>
            <button className="hp-btn-outline" onClick={() => navigate('/explore')}>
              Explore Posts <ChevronRight size={15} />
            </button>
          </div>

          <div className="hp-social-proof">
            <div className="hp-avatar-stack">
              {['S','M','E','R','A'].map((l, i) => (
                <div key={i} className="hp-avatar-bubble" style={{ marginLeft: i === 0 ? 0 : -10 }}>{l}</div>
              ))}
            </div>
            <span>Join <strong>5,000+</strong> writers on Postify</span>
          </div>
        </div>

        <div className="hp-hero-right">
          <div className="hp-mockup">
            <div className="hp-mockup-topbar">
              <span className="hp-dot hp-dot-red" />
              <span className="hp-dot hp-dot-yellow" />
              <span className="hp-dot hp-dot-green" />
            </div>
            <div className="hp-mockup-line hp-line-title" />
            <div className="hp-mockup-line hp-line-sub" />
            <div className="hp-mockup-line hp-line-body" />
            <div className="hp-mockup-line hp-line-body2" />
            <div className="hp-mockup-tags">
              {['#tech','#ai','#writing'].map((t) => (
                <span key={t} className="hp-mockup-tag">{t}</span>
              ))}
            </div>
            <div className="hp-mockup-footer">
              <div className="hp-mockup-author">
                <div className="hp-mockup-avatar" />
                <span>Sarah Chen</span>
              </div>
              <div className="hp-mockup-counts">
                <span>248</span>
                <span>1.2k</span>
              </div>
            </div>
          </div>

          <div className="hp-float hp-float-trending">
            <TrendingUp size={15} color="#2563eb" />
            <div>
              <div className="hp-float-label">Trending Now</div>
              <div className="hp-float-val">+43% readers</div>
            </div>
          </div>

          <div className="hp-float hp-float-live">
            <Zap size={14} color="#7c3aed" />
            <div>
              <div className="hp-float-label">Just Published</div>
              <div className="hp-float-val">2 min ago</div>
            </div>
          </div>
        </div>
      </section>

      <section className="hp-features-section">
        <div className="hp-inner">
          <div className="hp-section-hd">
            <p className="hp-section-label"><Sparkles size={11} /> Why Postify</p>
            <h2 className="hp-section-title">Built Different, <span className="hp-blue">On Purpose</span></h2>
            <p className="hp-section-sub">Not just another blogging site. Here's what we actually built that others didn't bother with.</p>
          </div>
          <div className="hp-features-grid">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="hp-feature-card">
                  <div className="hp-feature-icon"><Icon size={20} /></div>
                  <h3 className="hp-feature-title">{f.title}</h3>
                  <p className="hp-feature-desc">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="hp-posts-section">
          <div className="hp-inner">
            <div className="hp-section-hd">
              <p className="hp-section-label"><PenLine size={11} /> Latest Stories</p>
              <h2 className="hp-section-title">Fresh from the <span className="hp-blue">Community</span></h2>
              <p className="hp-section-sub">Hand-picked articles published recently by writers in our community.</p>
            </div>
            <div className="hp-posts-grid">
              {posts.map((p) => <PostCard key={p._id} post={p} />)}
            </div>
            <div className="hp-posts-more">
              <button className="hp-btn-outline" onClick={() => navigate('/explore')}>
                View All Posts <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="hp-cta-section">
        <div className="hp-cta-blob1" />
        <div className="hp-cta-blob2" />
        <div className="hp-cta-inner">
          <div className="hp-badge hp-badge-light">
            <Sparkles size={12} /> Free to start
          </div>
          <h2 className="hp-cta-title">Ready to Share Your Story?</h2>
          <p className="hp-cta-sub">
            Join thousands of writers who choose Postify to express their ideas.
            No credit card. No complex setup. Just great writing.
          </p>
          <div className="hp-cta-btns">
            <button className="hp-btn-primary hp-btn-primary-light" onClick={() => navigate('/register')}>
              Create Free Account <ArrowRight size={15} />
            </button>
            <button className="hp-btn-ghost-light" onClick={() => navigate('/explore')}>
              Read Stories <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
