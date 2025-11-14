// Posts.jsx
import React, { useEffect, useState } from "react";
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
} from "react-icons/fa";
import { useUser, useAuth } from "@clerk/clerk-react";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeState, setLikeState] = useState({});
  const [showComments, setShowComments] = useState({});
  const [savedState, setSavedState] = useState({});
  const [commentInputs, setCommentInputs] = useState({}); // { postId: "" }
  const [commentLoading, setCommentLoading] = useState({}); // { postId: true/false }
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get("/posts");
        setPosts(Array.isArray(res.data.posts) ? res.data.posts : []);
      } catch (err) {
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);


  // Like/unlike post with backend
  const handleLike = async (postId, liked) => {
    if (!isSignedIn || !user) return;
    try {
      const jwt = await getToken();
      if (!liked) {
        await api.post(`/posts/${postId}/like`, {}, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
      } else {
        await api.post(`/posts/${postId}/unlike`, {}, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
      }
      // Refetch posts to update like count and state
      const res = await api.get("/posts");
      setPosts(Array.isArray(res.data.posts) ? res.data.posts : []);
      setLikeState((prev) => ({ ...prev, [postId]: !liked }));
    } catch (err) {
      // Optionally show error
    }
  };

  const handleToggleComments = (postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Add comment to post
  const handleAddComment = async (postId) => {
    if (!isSignedIn || !user) return;
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    setCommentLoading((prev) => ({ ...prev, [postId]: true }));
    try {
      const jwt = await getToken();
      await api.post(`/posts/${postId}/comments`, { text }, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      // Refetch posts to update comments
      const res = await api.get("/posts");
      setPosts(Array.isArray(res.data.posts) ? res.data.posts : []);
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      // Optionally show error
    } finally {
      setCommentLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleSave = (postId) => {
    setSavedState((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleShare = (post) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(post.text || "");
    }
  };

  return (
    <section className="min-h-screen w-full bg-[#0a0f1c] py-6">
      <div className="max-w-xl mx-auto px-1 sm:px-2">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            All Posts <span className="ml-2 text-[#3b5b9a] text-xl font-semibold">DevVerse</span>
          </h1>
          <p className="mt-1 text-gray-400 text-sm">Connect with the community — share ideas, projects and learn from others.</p>
        </header>

        {/* Loading skeletons */}
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

        {!loading && !error && posts.length === 0 && (
          <div className="text-gray-400 text-center py-8 text-sm">No posts yet. Be the first to share something!</div>
        )}

        <div className="space-y-3">
          {posts.map((post) => (
            <article
              key={post._id}
              className="relative overflow-hidden rounded-lg p-3 mx-auto bg-[#101a2b] border border-[#3b5b9a]/15 shadow hover:shadow-lg transition-shadow w-full"
              style={{ minHeight: 80 }}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {post.user?.avatar ? (
                    <img
                      src={post.user.avatar}
                      alt="avatar"
                      className="w-8 h-8 rounded-full border border-[#23385c] object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#16223a] flex items-center justify-center text-gray-300 border border-[#23385c]">
                      <FaUserCircle className="w-5 h-5" />
                    </div>
                  )}
                </div>
                {/* Card Content */}
                <div className="flex-1 min-w-0">
                  {/* User + Time */}
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[#b3cdf6] font-semibold text-[15px]">{post.user?.username || "Anonymous"}</span>
                    <span className="text-xs text-gray-500">· {formatDate(post.createdAt)}</span>
                  </div>
                  {/* Text */}
                  <p className="text-gray-200 text-[14px] leading-snug mb-1">{post.text}</p>
                  {/* Image */}
                  {post.image && (
                    <div className="my-2">
                      <img
                        src={post.image}
                        alt="Post"
                        className="rounded-md border border-[#23385c]/30 object-cover w-full max-w-xs"
                        style={{ maxHeight: "140px" }}
                      />
                    </div>
                  )}
                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {post.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 rounded bg-[#172a45] text-[#b3cdf6] border border-[#23385c]/40"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Action Bar */}
                  <div className="mt-2 flex items-center gap-4 border-t border-[#3b5b9a]/10 pt-2 text-[#b3cdf6] text-[14px]">
                    <button
                      className="flex items-center gap-1 hover:text-pink-400 transition"
                      onClick={() => handleLike(post._id, post.likes?.includes?.(post.user?.clerkId || ""))}
                    >
                      {post.likes?.includes?.(post.user?.clerkId || "") ? <FaHeart /> : <FaRegHeart />}
                      <span className="ml-1">{post.likes?.length || 0}</span>
                    </button>
                    <button
                      className="flex items-center gap-1 hover:text-blue-400 transition"
                      onClick={() => handleToggleComments(post._id)}
                    >
                      <FaRegComment /> <span className="ml-1">{post.comments?.length || 0}</span>
                    </button>
                    <button
                      className="flex items-center gap-1 hover:text-[#3b5b9a] transition"
                      onClick={() => handleShare(post)}
                    >
                      <FaShareAlt /> <span className="ml-1">Share</span>
                    </button>
                    <button
                      className="ml-auto p-1.5 rounded-md hover:bg-[#16273f] transition"
                      onClick={() => handleSave(post._id)}
                    >
                      {savedState[post._id] ? <FaBookmark /> : <FaRegBookmark />}
                    </button>
                  </div>
                  {/* Comments */}
                  {showComments[post._id] && (
                    <div className="mt-2 bg-[#0d1b33] border border-[#23385c]/30 rounded-md p-2">
                      <div className="font-semibold text-[#b3cdf6] mb-1 text-xs">Comments</div>
                      {post.comments?.length > 0 ? (
                        <ul className="space-y-1 max-h-24 overflow-auto pr-1">
                          {post.comments.map((c, idx) => (
                            <li key={idx} className="text-gray-300 text-xs border-b border-[#3b5b9a]/10 pb-0.5">
                              <span className="font-medium text-[#b3cdf6]">{c.user?.username || "User"}:</span> {c.text}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-gray-400 text-xs">No comments yet.</div>
                      )}
                      {/* Add comment input */}
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="text"
                          className="flex-1 rounded bg-[#181f2e] border border-[#3b5b9a]/20 px-2 py-1 text-xs text-gray-200 focus:outline-none"
                          placeholder="Add a comment..."
                          value={commentInputs[post._id] || ""}
                          onChange={e => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                          disabled={commentLoading[post._id]}
                        />
                        <button
                          className="bg-[#3b5b9a] text-white px-3 py-1 rounded text-xs disabled:opacity-60"
                          onClick={() => handleAddComment(post._id)}
                          disabled={commentLoading[post._id] || !(commentInputs[post._id]?.trim())}
                        >
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
};

export default Posts;
