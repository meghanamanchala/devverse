import React, { useEffect, useState } from "react";
import api from "../app/api";
import { formatDate } from "../utils/formatDate";
import { Camera } from "lucide-react";
import {
  FaRegHeart,
  FaHeart,
  FaRegComment,
  FaUserCircle,
  FaRegBookmark,
  FaBookmark,
  FaShareAlt,
} from "react-icons/fa";
import { useUser, useAuth } from "@clerk/clerk-react";

// Combined Posts page + Composer (Add Post) following Home theme
export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Composer state
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // UI states
  const [likeState, setLikeState] = useState({});
  const [showComments, setShowComments] = useState({});
  const [savedState, setSavedState] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [commentLoading, setCommentLoading] = useState({});

  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/posts");
      setPosts(Array.isArray(res.data.posts) ? res.data.posts : []);
    } catch (err) {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Composer helpers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearForm = () => {
    setText("");
    setTags("");
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!text.trim() && !image) return; // nothing to post
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("text", text.trim());
      formData.append("tags", tags);
      if (image) formData.append("image", image);

      const token = await getToken();
      await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      clearForm();
      await fetchPosts();
    } catch (err) {
      console.error(err);
      alert("Failed to create post");
    } finally {
      setUploading(false);
    }
  };

  // Like/unlike post
  const handleLike = async (postId, liked) => {
    if (!isSignedIn || !user) return;
    try {
      const jwt = await getToken();
      if (!liked) {
        await api.post(`/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${jwt}` } });
      } else {
        await api.post(`/posts/${postId}/unlike`, {}, { headers: { Authorization: `Bearer ${jwt}` } });
      }
      await fetchPosts();
      setLikeState((p) => ({ ...p, [postId]: !liked }));
    } catch (err) {
      console.error(err);
    }
  };

  // Comments
  const handleToggleComments = (postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleAddComment = async (postId) => {
    if (!isSignedIn || !user) return;
    const textVal = commentInputs[postId]?.trim();
    if (!textVal) return;
    setCommentLoading((prev) => ({ ...prev, [postId]: true }));
    try {
      const jwt = await getToken();
      await api.post(`/posts/${postId}/comments`, { text: textVal }, { headers: { Authorization: `Bearer ${jwt}` } });
      await fetchPosts();
      setCommentInputs((p) => ({ ...p, [postId]: "" }));
    } catch (err) {
      console.error(err);
    } finally {
      setCommentLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!isSignedIn || !user) return;
    try {
      const jwt = await getToken();
      await api.delete(`/posts/${postId}/comments/${commentId}`, { headers: { Authorization: `Bearer ${jwt}` } });
      await fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = (postId) => {
    setSavedState((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleShare = (post) => {
    if (navigator?.clipboard) navigator.clipboard.writeText(post.text || "");
  };

  // --- Render ---
  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-[#0a0f1c] via-[#0b1628] to-[#0d1b33] text-white py-10">
      <div className="max-w-3xl mx-auto px-4">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold">All Posts <span className="ml-2 text-[#3b5b9a] text-xl font-semibold">DevVerse</span></h1>
          <p className="mt-1 text-gray-400 text-sm">Connect with the community — share ideas, projects and learn from others.</p>
        </header>

        {/* Composer */}
        <form onSubmit={handleSubmit} className="bg-[#121622] border border-[#1e2a3b] rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="me" className="w-10 h-10 rounded-full object-cover border border-[#23385c]" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#16223a] flex items-center justify-center text-gray-300 border border-[#23385c]">
                  <FaUserCircle className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <textarea
                className="bg-[#0f1722] text-gray-100 rounded-lg p-4 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-[#3b5b9a] placeholder-gray-400 border border-[#3b5b9a]/30 w-full"
                placeholder="What's on your mind?"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              <input
                className="mt-3 bg-[#0f1722] text-gray-100 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#3b5b9a] placeholder-gray-400 border border-[#3b5b9a]/30 w-full"
                placeholder="Tags (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />

              <div className="flex items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer flex items-center gap-2 text-gray-300 hover:text-white bg-[#0f1722] px-3 py-2 rounded-md border border-transparent hover:border-[#2b466f] transition-colors">
                    <Camera size={16} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    <span className="text-sm">Add Image</span>
                  </label>

                  <button
                    type="button"
                    onClick={clearForm}
                    className="text-sm px-3 py-2 rounded-md bg-transparent border border-[#2b3a50] hover:bg-[#1b2a49] transition-colors"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {imagePreview ? (
                    <div className="flex items-center gap-3">
                      <img src={imagePreview} alt="Preview" className="h-12 w-12 object-cover rounded-md border border-[#3b5b9a]/30" />
                      <div className="text-xs text-gray-300 max-w-[140px] truncate">{image?.name}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">No image selected</div>
                  )}

                  <button
                    type="submit"
                    disabled={uploading || (!text.trim() && !image)}
                    className={`bg-gradient-to-br from-[#2959a6] to-[#1e3c72] hover:from-[#234f87] hover:to-[#19345a] text-white font-semibold px-5 py-2 rounded-lg transition-colors duration-200 shadow-md ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {uploading ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Posts list */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-[#101a2b] border border-[#3b5b9a]/10 rounded-lg p-3 shadow flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-700 rounded-full w-8 h-8" />
                  <div className="flex-1 space-y-1">
                    <div className="bg-gray-700 h-3 w-1/4 rounded" />
                    <div className="bg-gray-700 h-2 w-1/6 rounded" />
                  </div>
                </div>
                <div className="bg-gray-700 h-3 w-2/3 rounded" />
                <div className="bg-gray-700 h-20 w-full rounded" />
              </div>
            ))}
          </div>
        )}

        {error && <div className="text-red-400 text-center my-3 text-sm">{error}</div>}

        <div className="space-y-4">
          {!loading && posts.length === 0 && (
            <div className="text-gray-400 text-center py-8 text-sm">No posts yet. Be the first to share something!</div>
          )}

          {posts.map((post) => (
            <article key={post._id} className="relative overflow-hidden rounded-lg p-3 bg-[#101a2b] border border-[#3b5b9a]/15 shadow hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {post.user?.avatar ? (
                    <img src={post.user.avatar} alt="avatar" className="w-8 h-8 rounded-full border border-[#23385c] object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#16223a] flex items-center justify-center text-gray-300 border border-[#23385c]">
                      <FaUserCircle className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[#b3cdf6] font-semibold text-[15px]">{post.user?.username || "Anonymous"}</span>
                    <span className="text-xs text-gray-500">· {formatDate(post.createdAt)}</span>
                  </div>

                  <p className="text-gray-200 text-[14px] leading-snug mb-1">{post.text}</p>

                  {post.image && (
                    <div className="my-2">
                      <img src={post.image} alt="Post" className="rounded-md border border-[#23385c]/30 object-cover w-full max-w-xs" style={{ maxHeight: "140px" }} />
                    </div>
                  )}

                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {post.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 rounded bg-[#172a45] text-[#b3cdf6] border border-[#23385c]/40">#{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 flex items-center gap-4 border-t border-[#3b5b9a]/10 pt-2 text-[#b3cdf6] text-[14px]">
                    <button className="flex items-center gap-1 hover:text-pink-400 transition" onClick={() => handleLike(post._id, post.likes?.includes?.(user?.id || ""))}>
                      {post.likes?.includes?.(user?.id || "") ? <FaHeart /> : <FaRegHeart />} <span className="ml-1">{post.likes?.length || 0}</span>
                    </button>

                    <button className="flex items-center gap-1 hover:text-blue-400 transition" onClick={() => handleToggleComments(post._id)}>
                      <FaRegComment /> <span className="ml-1">{post.comments?.length || 0}</span>
                    </button>

                    <button className="flex items-center gap-1 hover:text-[#3b5b9a] transition" onClick={() => handleShare(post)}>
                      <FaShareAlt /> <span className="ml-1">Share</span>
                    </button>

                    <button className="ml-auto p-1.5 rounded-md hover:bg-[#16273f] transition" onClick={() => handleSave(post._id)}>
                      {savedState[post._id] ? <FaBookmark /> : <FaRegBookmark />}
                    </button>
                  </div>

                  {showComments[post._id] && (
                    <div className="mt-2 bg-[#0d1b33] border border-[#23385c]/30 rounded-md p-2">
                      <div className="font-semibold text-[#b3cdf6] mb-1 text-xs">Comments</div>
                      {post.comments?.length > 0 ? (
                        <ul className="space-y-1 max-h-24 overflow-auto pr-1">
                          {post.comments.map((c, idx) => (
                            <li key={c._id || idx} className="text-gray-300 text-xs border-b border-[#3b5b9a]/10 pb-0.5 flex items-center justify-between">
                              <span>
                                <span className="font-medium text-[#b3cdf6]">{c.userInfo?.username || "User"}</span>: {c.text}
                              </span>

                              {(user && (c.user === user.id || post.author === user.id)) && (
                                <button className="ml-2 text-xs text-red-400 hover:text-red-600" title="Delete comment" onClick={() => handleDeleteComment(post._id, c._id)}>
                                  Delete
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-gray-400 text-xs">No comments yet.</div>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <input type="text" className="flex-1 rounded bg-[#181f2e] border border-[#3b5b9a]/20 px-2 py-1 text-xs text-gray-200 focus:outline-none" placeholder="Add a comment..." value={commentInputs[post._id] || ""} onChange={e => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))} disabled={commentLoading[post._id]} />
                        <button className="bg-[#3b5b9a] text-white px-3 py-1 rounded text-xs disabled:opacity-60" onClick={() => handleAddComment(post._id)} disabled={commentLoading[post._id] || !(commentInputs[post._id]?.trim())}>
                          {commentLoading[post._id] ? "..." : "Post"}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
