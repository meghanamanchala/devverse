// Home.jsx (Improved UI)
// DevVerse — Hero + Feed + Composer
// Notes: Requires Tailwind CSS. Keep formatDate.js and api.js as-is.

import React, { useEffect, useState, useCallback, useRef } from "react";
import { CodeXml, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../app/api";
import { formatDate } from "../utils/formatDate";
import {
  FaRegHeart,
  FaHeart,
  FaRegComment,
  FaUserCircle,
  FaRegBookmark,
  FaBookmark,
  FaShareAlt,
  FaEllipsisH,
} from "react-icons/fa";
import { useUser, useAuth } from "@clerk/clerk-react";

// Small presentational Avatar component with accessible fallback
const Avatar = ({ src, alt, size = 10 }) => (
  <img
    src={src}
    alt={alt || "avatar"}
    onError={(e) => {
      e.currentTarget.onerror = null;
      e.currentTarget.src = "/fallback-avatar.png";
    }}
    className={`w-${size} h-${size} rounded-full object-cover border border-[#23385c]`}
    loading="lazy"
  />
);

// Utility: small chip component for tags
const Tag = ({ children }) => (
  <span className="text-xs px-2 py-0.5 rounded-full bg-[#122033] text-[#9fc1ff] border border-[#23385c]/40 mr-1 mb-1 inline-block">#{children}</span>
);

// Composer — extracted to make Home cleaner and reusable
const Composer = ({ user, isSignedIn, onPost, uploading, initialImagePreview }) => {
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialImagePreview || null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!initialImagePreview) setImagePreview(null);
  }, [initialImagePreview]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const clearForm = () => {
    setText("");
    setTags("");
    setImage(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e) => {
    e?.preventDefault();
    if (!text.trim() && !image) return;
    await onPost({ text: text.trim(), tags, image, clearForm });
  };

  return (
  <form onSubmit={submit} className="bg-[#081224] border border-[#17314d] rounded-2xl p-6 shadow-lg mb-8">
  <div className="flex gap-3">
        <div className="flex-shrink-0">
          {user?.profileImageUrl ? (
            <Avatar src={user.profileImageUrl} alt={user?.fullName || "Your avatar"} size={10} />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#16223a] flex items-center justify-center text-gray-300 border border-[#23385c]">
              <FaUserCircle className="w-5 h-5" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <textarea
            className="w-full bg-transparent focus:outline-none text-gray-100 placeholder-gray-400 rounded-md p-3 min-h-[90px] resize-none border border-transparent focus:ring-2 focus:ring-[#2f5aa0]"
            placeholder={isSignedIn ? "Share your thoughts, a project or a helpful tip..." : "Sign in to post"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!isSignedIn}
            aria-label="Post content"
          />

          <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="cursor-pointer flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-[#061024] border border-[#23385c]/10 hover:bg-[#071d33] transition-colors">
                <Camera size={14} />
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={!isSignedIn} />
                <span>{image ? "Change" : "Add"} image</span>
              </label>

              <input
                className="bg-[#061324] text-gray-200 rounded px-3 py-2 text-sm w-full sm:w-48 focus:outline-none border border-[#23385c]/10"
                placeholder="tags: react, rails"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={!isSignedIn}
                aria-label="Post tags"
              />

              <button type="button" onClick={clearForm} className="text-sm px-3 py-2 rounded-md bg-transparent border border-[#23385c]/10 hover:bg-[#0b243a]">
                Clear
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {imagePreview ? (
                <div className="flex items-center gap-2 bg-[#081829] border border-[#23385c]/20 rounded p-2">
                  <img src={imagePreview} alt="preview" className="h-12 w-12 rounded-md object-cover border border-[#23385c]/20" />
                  <div className="text-xs text-gray-300 max-w-[120px] truncate">{image?.name || "Selected image"}</div>
                  <button type="button" onClick={removeImage} className="ml-1 px-2 py-1 text-xs rounded bg-[#1b2a49] text-white hover:bg-red-500 transition-colors">Remove</button>
                </div>
              ) : (
                <div className="text-xs text-gray-400">No image selected</div>
              )}

              <button
                type="submit"
                disabled={uploading || (!text.trim() && !image) || !isSignedIn}
                className={`px-4 py-2 rounded-lg font-semibold bg-gradient-to-br from-[#2d67b8] to-[#1b3a78] hover:from-[#244f8e] disabled:opacity-60`}
              >
                {uploading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

// Single Post card — presentational logic separated for readability
const PostCard = ({ post, user, liked, onLike, onToggleComments, showComments, onShare, saved, onSave, onDeleteComment, onAddComment, commentState }) => {
  const [expanded, setExpanded] = useState(false);
  const shortText = post.text?.length > 240 ? post.text.slice(0, 240) + "…" : post.text;

  return (
  <article className="relative rounded-lg p-4 bg-[#081224] border border-[#17314d] shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {post.user?.avatar ? (
            <Avatar src={post.user.avatar} alt={post.user.username || "avatar"} size={8} />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#16223a] flex items-center justify-center text-gray-300 border border-[#23385c]">
              <FaUserCircle className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[#cbe0ff] font-medium text-sm truncate">{post.user?.username || "Anonymous"}</span>
            <time className="text-xs text-gray-400 ml-1" dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
            <button className="ml-auto p-1.5 rounded hover:bg-[#0b2a45]" aria-label="More actions"><FaEllipsisH /></button>
          </div>

          {post.text && (
            <div className="text-gray-200 text-sm mt-2 break-words">
              <p className="relative">
                {expanded ? post.text : shortText}
                {post.text?.length > 240 && (
                  <button onClick={() => setExpanded((s) => !s)} className="ml-2 text-xs text-[#9fc1ff] underline">
                    {expanded ? "Show less" : "Read more"}
                  </button>
                )}
              </p>
            </div>
          )}

          {post.image && (
            <div className="mt-3">
              <img src={post.image} alt={post.text?.slice(0, 60) || "post image"} className="w-full max-w-xl rounded-md object-cover border border-[#23385c]/25 cursor-pointer" />
            </div>
          )}

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.tags.map((t, i) => (<Tag key={i}>{t}</Tag>))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-4 border-t border-[#17314d] pt-3 text-sm text-[#9fc1ff]">
            <button onClick={() => onLike(post._id, liked)} className="flex items-center gap-2" aria-pressed={!!liked}>
              {liked ? <FaHeart className="text-pink-400" /> : <FaRegHeart />} <span>{post.likes?.length || 0}</span>
            </button>

            <button onClick={() => onToggleComments(post._id)} className="flex items-center gap-2">
              <FaRegComment /> <span>{post.comments?.length || 0}</span>
            </button>

            <button onClick={() => onShare(post)} className="flex items-center gap-2">
              <FaShareAlt /> <span>Share</span>
            </button>

            <button onClick={() => onSave(post._id)} className="ml-auto p-1.5 rounded" aria-label="Save post">
              {saved ? <FaBookmark /> : <FaRegBookmark />}
            </button>
          </div>

          {showComments && (
            <div className="mt-3 bg-[#061a2a] border border-[#23385c]/20 rounded-md p-3">
              <div className="font-semibold text-sm text-[#cbe0ff] mb-2">Comments</div>
              {post.comments?.length > 0 ? (
                <ul className="space-y-2 max-h-36 overflow-auto pr-1 text-sm text-gray-200">
                  {post.comments.map((c) => (
                    <li key={c._id} className="flex items-start justify-between">
                      <div>
                        <div className="text-xs text-[#b9d9ff] font-medium">{c.userInfo?.username || "User"}</div>
                        <div className="text-xs text-gray-200">{c.text}</div>
                      </div>
                      { /* If user can delete show delete button (handled by parent) */ }
                      {c.showDelete && <button onClick={() => onDeleteComment(post._id, c._id)} className="text-xs text-red-400">Delete</button>}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-gray-400">No comments yet.</div>
              )}

              <div className="mt-3 flex items-center gap-2">
                <input type="text" className="flex-1 rounded bg-[#081625] border border-[#17314d] px-2 py-1 text-sm text-gray-100" placeholder="Add a comment..." value={commentState.value} onChange={(e) => commentState.set(e.target.value)} />
                <button onClick={() => onAddComment(post._id)} className="px-3 py-1 rounded bg-[#2d67b8] text-white text-sm">{commentState.loading ? '...' : 'Post'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI states
  const [likeState, setLikeState] = useState({});
  const [showComments, setShowComments] = useState({});
  const [savedState, setSavedState] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  const [toasts, setToasts] = useState([]);
  const [imageModal, setImageModal] = useState(null);
  const [uploading, setUploading] = useState(false);

  const addToast = (text, life = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), life);
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/posts");
      setPosts(Array.isArray(res.data.posts) ? res.data.posts : []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load posts. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handlePost = async ({ text, tags, image, clearForm }) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("text", text);
      formData.append("tags", tags);
      if (image) formData.append("image", image);
      const token = await getToken();
      await api.post("/posts", formData, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } });
      clearForm();
      addToast("Posted successfully");
      await fetchPosts();
    } catch (err) {
      console.error(err);
      addToast("Failed to create post");
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (postId, liked) => {
    if (!isSignedIn || !user) return addToast("Sign in to like posts.");

    try {
      const jwt = await getToken();
      if (!liked) await api.post(`/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${jwt}` } });
      else await api.post(`/posts/${postId}/unlike`, {}, { headers: { Authorization: `Bearer ${jwt}` } });

      setLikeState((p) => ({ ...p, [postId]: !liked }));
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, likes: liked ? p.likes.filter((id) => id !== user.id) : [...(p.likes || []), user.id] } : p)));
    } catch (err) {
      console.error(err);
      addToast("Unable to like post.");
    }
  };

  const handleToggleComments = (postId) => setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));

  const handleAddComment = async (postId) => {
    if (!isSignedIn || !user) return addToast("Sign in to comment.");
    const val = (commentInputs[postId] || "").trim();
    if (!val) return;

    setCommentLoading((p) => ({ ...p, [postId]: true }));
    try {
      const jwt = await getToken();
      await api.post(`/posts/${postId}/comments`, { text: val }, { headers: { Authorization: `Bearer ${jwt}` } });
      setCommentInputs((p) => ({ ...p, [postId]: "" }));
      await fetchPosts();
    } catch (err) {
      console.error(err);
      addToast("Failed to add comment.");
    } finally {
      setCommentLoading((p) => ({ ...p, [postId]: false }));
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!isSignedIn || !user) return addToast("Sign in to delete comments.");
    try {
      const jwt = await getToken();
      await api.delete(`/posts/${postId}/comments/${commentId}`, { headers: { Authorization: `Bearer ${jwt}` } });
      addToast("Comment deleted");
      await fetchPosts();
    } catch (err) {
      console.error(err);
      addToast("Unable to delete comment.");
    }
  };

  const handleSave = (postId) => {
    setSavedState((prev) => ({ ...prev, [postId]: !prev[postId] }));
    addToast(savedState[postId] ? "Removed from saved" : "Saved post");
  };

  const handleShare = async (post) => {
    const txt = post.text || "";
    if (navigator?.clipboard) {
      try { await navigator.clipboard.writeText(txt); addToast("Post text copied to clipboard"); }
      catch { addToast("Unable to copy"); }
    } else addToast("Clipboard not available");
  };

  const openImage = (url) => setImageModal(url);
  const closeImage = () => setImageModal(null);

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-[#07101a] via-[#061328] to-[#071428] text-white pb-12">
      {/* Hero */}
  <div className="max-w-4xl mx-auto px-4 pt-10">
  <div className="rounded-2xl p-6 bg-gradient-to-br from-[#071428] to-[#0b2136] border border-[#1e3a5e]/40 shadow-lg flex flex-col sm:flex-row items-center gap-4 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#2f68b6] to-[#1b3a78]">
            <CodeXml size={48} className="text-white" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">Welcome to <span className="text-[#9fc1ff]">DevVerse</span></h1>
            <p className="text-gray-300 mt-1">A friendly community for developers — share projects, ask questions, and collaborate.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/join')} className="px-4 py-2 rounded-lg bg-[#1f3b66] hover:bg-[#234f87]">Join</button>
            <button onClick={() => window.scrollTo({ top: 700, behavior: 'smooth' })} className="px-4 py-2 rounded-lg border border-[#2d4f7a]">Explore</button>
          </div>
        </div>

        {/* Redesigned Composer */}
        {/* Improved Composer with image preview and remove */}
        <div className="mb-10">
          <Composer user={user} isSignedIn={isSignedIn} onPost={handlePost} uploading={uploading} />
        </div>

        {/* Feed */}
  <div className="mt-8">
  {loading ? (
          <div className="space-y-3">
            {[1,2,3].map((i)=> (
              <div key={i} className="animate-pulse bg-[#061427] border border-[#17314d] rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 bg-gray-700 rounded" />
                    <div className="h-2 w-1/6 bg-gray-700 rounded" />
                  </div>
                </div>
                <div className="mt-3 h-4 bg-gray-700 w-4/5 rounded" />
                <div className="mt-3 h-36 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {error && <div className="text-red-400">{error}</div>}
            {posts.length === 0 && <div className="text-gray-400 text-center py-8">No posts yet — start the conversation!</div>}

            {posts.map((post) => {
              const liked = post.likes?.includes?.(user?.id || "");
              const isSaved = !!savedState[post._id];

              // prepare comments with delete permission flag
              const commentsWithPerm = (post.comments || []).map((c) => ({ ...c, showDelete: !!(user && (c.user === user.id || post.author === user.id)) }));

              return (
                <PostCard
                  key={post._id}
                  post={{ ...post, comments: commentsWithPerm }}
                  user={user}
                  liked={liked}
                  onLike={handleLike}
                  onToggleComments={handleToggleComments}
                  showComments={!!showComments[post._id]}
                  onShare={handleShare}
                  saved={isSaved}
                  onSave={handleSave}
                  onDeleteComment={handleDeleteComment}
                  onAddComment={(id) => handleAddComment(id)}
                  commentState={{ value: commentInputs[post._id] || "", set: (v) => setCommentInputs((p) => ({ ...p, [post._id]: v })), loading: !!commentLoading[post._id] }}
                />
              );
            })}
          </div>
  )}
  </div>
      </div>

        {/* (Composer and feed are above; nothing more here) */}
      {imageModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="max-w-4xl w-full">
            <button onClick={closeImage} className="mb-2 text-white px-3 py-1 bg-[#16273f] rounded">Close</button>
            <img src={imageModal} alt="Full view" className="rounded shadow-lg w-full h-auto object-contain" />
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed right-4 bottom-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="bg-[#081829] border border-[#17314d] text-white px-4 py-2 rounded shadow">{t.text}</div>
        ))}
      </div>
    </section>
  );
};

export default Home;
