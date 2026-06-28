import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Image, ChevronDown, Save, X, Hash } from 'lucide-react';
import { request } from '../api';

const CATEGORIES = ['Technology', 'Business', 'Education', 'Career', 'Lifestyle', 'Health', 'Travel', 'Others'];

const generateSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

const EditPost = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [category, setCategory] = useState('Others');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);

  const tagInputRef = useRef(null);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchPost = async () => {
      try {
        const post = await request(`/api/posts/${id}`);
        setTitle(post.title || '');
        setSlug(post.slug || generateSlug(post.title || ''));

        setContent(post.content || '');
        setTags(post.tags || []);
        setCategory(post.category || 'Others');
        setImageUrl(post.image || '');
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load post.');
        setLoading(false);
      }
    };

    const fetchUser = async () => {
      try {
        const data = await request('/api/user/dashboard', 'GET', null, {
          Authorization: `Bearer ${token}`,
        });
        setUserData(data);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    };

    fetchPost();
    fetchUser();
  }, [id, token, navigate]);

  useEffect(() => {
    if (!slugManuallyEdited && title) {
      setSlug(generateSlug(title));
    }
  }, [title, slugManuallyEdited]);

  const handleSlugChange = (e) => {
    setSlugManuallyEdited(true);
    setSlug(
      e.target.value
        .toLowerCase()
        .replace(/\s/g, '-')
        .replace(/[^a-z0-9-]/g, ''),
    );
  };

  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,/g, '');
      if (newTag && !tags.includes(newTag)) {
        setTags((prev) => [...prev, newTag]);
      }
      setTagInput('');
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      await request(
        `/api/posts/${id}`,
        'PUT',
        {
          title,
          slug,

          content,
          tags,
          category,
          image: imageUrl.trim() || null,
        },
        { Authorization: `Bearer ${token}` },
      );
      alert('✅ Post updated successfully!');
      navigate(`/post/${id}`);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message);
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/posts/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setImageUrl(data.url);
    } catch (err) {
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
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
    <div className="min-h-screen bg-[#F4F6F8] font-sans">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="w-16 flex justify-end">
            {userData && (
              <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm overflow-hidden border border-blue-200">
                {userData.profileImage ? (
                  <img src={userData.profileImage} alt={userData.name} className="w-full h-full object-cover" />
                ) : (
                  getInitials(userData.name)
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="flex gap-7 items-start">
          <div className="flex-1 space-y-6 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="border-b border-gray-50 px-7 py-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full inline-block" />
                <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Blog Content</h2>
              </div>
              <div className="px-7 py-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Give your thoughts a headline..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none text-gray-900 font-semibold text-base transition-all placeholder:text-gray-300 placeholder:font-normal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    Slug <span className="text-red-500">*</span>
                    <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                      editable
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">
                      /
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={handleSlugChange}
                      placeholder="post-slug"
                      className="w-full pl-7 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none text-gray-700 font-mono text-sm transition-all placeholder:text-gray-300"
                    />
                  </div>
                </div>


                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={14}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    placeholder="What's on your mind?"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none text-gray-800 font-medium transition-all resize-y placeholder:text-gray-300 text-sm leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <Image size={14} className="text-gray-400" />
                    Cover Image
                    <span className="text-xs font-normal text-gray-400">(optional)</span>
                  </label>
                  <div
                    className={`relative group overflow-hidden rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center min-h-[120px] ${
                      imageUrl ? 'border-transparent' : 'border-blue-200 hover:border-blue-400 bg-blue-50'
                    }`}
                  >
                    {imageUrl ? (
                      <>
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-2xl">
                          <label className="px-4 py-2 bg-white text-gray-900 rounded-lg font-bold text-xs cursor-pointer hover:bg-gray-100 transition-all">
                            Change
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                              disabled={isUploading}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setImageUrl('')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-xs hover:bg-red-700 transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <label className="flex flex-col items-center gap-2 cursor-pointer p-8 w-full">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                        />
                        {isUploading ? (
                          <Loader2 size={28} className="animate-spin text-blue-500" />
                        ) : (
                          <>
                            <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform">
                              <Image size={22} />
                            </div>
                            <div className="text-center">
                              <p className="text-gray-700 font-bold text-sm">Click to upload cover photo</p>
                              <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, or WebP up to 5MB</p>
                            </div>
                          </>
                        )}
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-[280px] flex-shrink-0 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="border-b border-gray-50 px-5 py-3.5 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full inline-block" />
                <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Update Post</h2>
              </div>
              <div className="p-4 space-y-2.5">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98] transition-all text-sm shadow-md shadow-blue-500/20"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-all text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="border-b border-gray-50 px-5 py-3.5 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full inline-block" />
                <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Category</h2>
              </div>
              <div className="p-4">
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none text-gray-700 font-semibold text-sm transition-all appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="border-b border-gray-50 px-5 py-3.5 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full inline-block" />
                <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Tags</h2>
              </div>
              <div className="p-4">
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-100"
                      >
                        <Hash size={10} className="opacity-75" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-0.5 text-blue-400 hover:text-blue-700 transition-colors"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  ref={tagInputRef}
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Type a tag and press Enter..."
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none text-gray-700 text-sm transition-all placeholder:text-gray-300"
                />
                <p className="text-xs text-gray-400 mt-1.5">Press Enter or comma to add</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
