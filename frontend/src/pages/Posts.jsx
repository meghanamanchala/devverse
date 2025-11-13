import React, { useEffect, useState } from "react";
import api from "../app/api";
import { FaRegHeart, FaHeart, FaRegComment, FaTrashAlt, FaUserCircle, FaRegBookmark, FaBookmark, FaShareAlt } from "react-icons/fa";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeState, setLikeState] = useState({}); // { postId: true/false }
  const [showComments, setShowComments] = useState({}); // { postId: true/false }
  const [deleting, setDeleting] = useState({}); // { postId: true/false }
  const [savedState, setSavedState] = useState({}); // { postId: true/false }

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

  // Mock like handler
  const handleLike = (postId) => {
    setLikeState((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Mock comment toggle
  const handleToggleComments = (postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Mock delete handler
  const handleDelete = (postId) => {
    setDeleting((prev) => ({ ...prev, [postId]: true }));
    setTimeout(() => {
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setDeleting((prev) => ({ ...prev, [postId]: false }));
    }, 800);
  };

  // Save handler (mock)
  const handleSave = (postId) => {
    setSavedState((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Share handler (mock: copies post text to clipboard)
  const handleShare = (post) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(post.text || "");
      // Optionally show a toast/alert
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-[#3b5b9a]">All Posts</h1>
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-[#181f2e] border border-[#3b5b9a]/20 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-gray-700 rounded-full w-10 h-10" />
                <div className="bg-gray-700 h-4 w-24 rounded" />
              </div>
              <div className="bg-gray-700 h-4 w-3/4 rounded" />
              <div className="bg-gray-700 h-32 w-full rounded" />
              <div className="flex gap-2 mt-2">
                <div className="bg-gray-700 h-4 w-10 rounded" />
                <div className="bg-gray-700 h-4 w-10 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <div className="text-red-400 text-center my-4">{error}</div>}
      {!loading && !error && posts.length === 0 && (
        <div className="text-gray-500 text-center">No posts yet.</div>
      )}
      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post._id}
            className="bg-[#181f2e] border border-[#3b5b9a]/20 rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow relative group"
            style={{ minHeight: 140 }}
          >
            {/* User Info */}
            <div className="flex items-center gap-3 mb-2">
              {post.user?.avatar ? (
                <img src={post.user.avatar} alt="avatar" className="w-10 h-10 rounded-full border border-[#3b5b9a]/40" />
              ) : (
                <FaUserCircle className="w-10 h-10 text-gray-500" />
              )}
              <div>
                <div className="font-semibold text-[#b3cdf6]">{post.user?.username || "Anonymous"}</div>
                <div className="text-xs text-gray-500">{post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}</div>
              </div>
              {/* Delete button (mock: show for all) */}
              <button
                className="ml-auto text-red-400 hover:text-red-600 p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
                title="Delete Post"
                onClick={() => handleDelete(post._id)}
                disabled={deleting[post._id]}
              >
                <FaTrashAlt />
              </button>
            </div>
            {/* Post Text */}
            <div className="mb-3 text-gray-200 whitespace-pre-line text-base">{post.text}</div>
            {/* Post Image */}
            {post.image && (
              <img
                src={post.image}
                alt="Post"
                className="w-full max-w-md rounded-md border border-[#3b5b9a]/30 mb-3 mx-auto"
                style={{ maxHeight: 220, objectFit: "cover" }}
              />
            )}
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-[#23385c] text-xs text-[#b3cdf6] px-2 py-1 rounded shadow"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {/* Actions Bar */}
            <div className="flex items-center gap-6 mt-6 text-[#b3cdf6] text-base border-t border-[#3b5b9a]/10 pt-3">
              <button
                className="flex items-center gap-1 hover:text-pink-400 transition"
                onClick={() => handleLike(post._id)}
                aria-label="Like"
              >
                {likeState[post._id] ? <FaHeart /> : <FaRegHeart />}
                <span className="text-sm ml-1">{likeState[post._id] ? (post.likes || 0) + 1 : post.likes || 0}</span>
              </button>
              <button
                className="flex items-center gap-1 hover:text-blue-400 transition"
                onClick={() => handleToggleComments(post._id)}
                aria-label="Comment"
              >
                <FaRegComment />
                <span className="text-sm ml-1">{post.comments?.length || 0}</span>
              </button>
              <button
                className="flex items-center gap-1 hover:text-[#3b5b9a] transition"
                onClick={() => handleShare(post)}
                aria-label="Share"
              >
                <FaShareAlt />
                <span className="text-sm ml-1">12</span>
              </button>
              <button
                className="flex items-center gap-1 hover:text-yellow-400 transition ml-auto"
                onClick={() => handleSave(post._id)}
                aria-label="Save"
              >
                {savedState[post._id] ? <FaBookmark /> : <FaRegBookmark />}
              </button>
            </div>
            {/* Comments Section (mock) */}
            {showComments[post._id] && (
              <div className="mt-4 bg-[#222b3d] rounded-lg p-4">
                <div className="font-semibold text-[#b3cdf6] mb-2">Comments</div>
                {post.comments && post.comments.length > 0 ? (
                  <ul className="space-y-2">
                    {post.comments.map((c, idx) => (
                      <li key={idx} className="text-gray-300 text-sm border-b border-[#3b5b9a]/10 pb-1">
                        <span className="font-medium text-[#b3cdf6]">{c.user?.username || "User"}:</span> {c.text}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-500 text-sm">No comments yet.</div>
                )}
                {/* Add comment input (mock, not functional) */}
                <div className="flex mt-3 gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded bg-[#181f2e] border border-[#3b5b9a]/20 px-3 py-1 text-sm text-gray-200 focus:outline-none"
                    placeholder="Add a comment... (demo)"
                    disabled
                  />
                  <button className="bg-[#3b5b9a] text-white px-3 py-1 rounded text-sm opacity-60 cursor-not-allowed">Post</button>
                </div>
              </div>
            )}
            {/* Deleting overlay */}
            {deleting[post._id] && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl z-10">
                <div className="text-white font-semibold">Deleting...</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Posts;
