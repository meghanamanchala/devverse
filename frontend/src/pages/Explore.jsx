// src/pages/Explore.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import {
  BookmarkCheck,
} from "lucide-react";
import api from "../app/api";
import PostCard from "../components/Shared/PostCard";

const Explore = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  // UI + data state
  const [toasts, setToasts] = useState([]);
  const addToast = (text, life = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), life);
  };

  const [trending, setTrending] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // interaction state
  const [savedState, setSavedState] = useState({});
  const [likeState, setLikeState] = useState({});
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [commentLoading, setCommentLoading] = useState({});

  // controls & filters
  const [postMode, setPostMode] = useState("trending"); // trending | popular | recent
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");

  // fetch all posts + build trending tags
  const fetchPostsAndTags = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/posts");
      const posts = Array.isArray(res.data.posts) ? res.data.posts : [];
      setAllPosts(posts);

      // trending tags
      const tagCounts = {};
      posts.forEach((post) => {
        (post.tags || []).forEach((tag) => {
          const t = tag.trim();
          if (t) tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      });
      const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([tag, count]) => ({ tag, count }));
      setTrending(sortedTags);

      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  // fetch saved posts for the signed-in user (to build savedState map)
  const fetchSavedPosts = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return;
    try {
      const token = await getToken();
      const res = await api.get("/save/saved-posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const saved = res.data.saved || [];
      const map = {};
      saved.forEach((p) => (map[p._id] = true));
      setSavedState(map);
    } catch (err) {
      console.error("Failed to fetch saved posts", err);
    }
  }, [isLoaded, isSignedIn, getToken]);

  useEffect(() => {
    fetchPostsAndTags();
  }, [fetchPostsAndTags]);

  useEffect(() => {
    fetchSavedPosts();
  }, [fetchSavedPosts]);

  // compute displayedPosts using filters/sorting (keeps your original logic)
  useEffect(() => {
    let posts = [...allPosts];

    if (activeTag) {
      posts = posts.filter((p) =>
        (p.tags || []).map((t) => t.toLowerCase()).includes(activeTag.toLowerCase())
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      posts = posts.filter(
        (p) =>
          (p.text && p.text.toLowerCase().includes(q)) ||
          (p.user?.username && p.user.username.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (postMode === "trending") {
      posts.sort((a, b) => {
        const likesA = a.likes?.length || 0;
        const likesB = b.likes?.length || 0;
        if (likesB !== likesA) return likesB - likesA;
        const commentsA = a.comments?.length || 0;
        const commentsB = b.comments?.length || 0;
        if (commentsB !== commentsA) return commentsB - commentsA;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else if (postMode === "popular") {
      posts.sort((a, b) => {
        const scoreA = (a.likes?.length || 0) + (a.comments?.length || 0);
        const scoreB = (b.likes?.length || 0) + (b.comments?.length || 0);
        return scoreB - scoreA;
      });
    } else if (postMode === "recent") {
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setDisplayedPosts(posts.slice(0, 10));
  }, [allPosts, postMode, search, activeTag]);

  // -------------------------
  // Like / Unlike
  // -------------------------
  const handleLike = async (postId, liked) => {
    if (!isSignedIn) return addToast("Sign in to like");
    try {
      const token = await getToken();

      if (!liked) {
        await api.post(`/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await api.post(`/posts/${postId}/unlike`, {}, { headers: { Authorization: `Bearer ${token}` } });
      }

      // update locally so UI is instant
      setAllPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes: liked
                  ? (p.likes || []).filter((id) => id !== user.id)
                  : [...(p.likes || []), user.id],
              }
            : p
        )
      );

      addToast(liked ? "Unliked" : "Liked");
    } catch (err) {
      console.error("like error", err);
      addToast("Failed to like");
    }
  };

  // -------------------------
  // Save / Unsave
  // -------------------------
  const handleSave = async (postId) => {
    if (!isSignedIn) return addToast("Sign in to save");
    try {
      const token = await getToken();
      const isSaved = savedState[postId];

      if (!isSaved) {
        await api.post(`/save/${postId}/save`, {}, { headers: { Authorization: `Bearer ${token}` } });
        addToast("Saved");
      } else {
        await api.post(`/save/${postId}/unsave`, {}, { headers: { Authorization: `Bearer ${token}` } });
        addToast("Removed");
      }

      setSavedState((prev) => ({ ...prev, [postId]: !isSaved }));
    } catch (err) {
      console.error("save error", err);
      addToast("Failed to save");
    }
  };

  // -------------------------
  // Add Comment
  // -------------------------
  const handleAddComment = async (postId) => {
    const text = (commentInputs[postId] || "").trim();
    if (!text) return;
    if (!isSignedIn) return addToast("Sign in to comment");

    setCommentLoading((p) => ({ ...p, [postId]: true }));

    try {
      const token = await getToken();
      const res = await api.post(
        `/posts/${postId}/comments`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newComment = res.data.comment;

      // ensure userInfo present (frontend adds if backend doesn't)
      if (!newComment.userInfo) {
        newComment.userInfo = {
          username: user?.username || (user?.primaryEmailAddress?.emailAddress || "").split("@")[0],
          name: user?.fullName || user?.username,
        };
      }

      // update posts locally
      setAllPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, comments: [...(p.comments || []), newComment] } : p
        )
      );

      setCommentInputs((p) => ({ ...p, [postId]: "" }));
      addToast("Comment added");
    } catch (err) {
      console.error("add comment error", err);
      addToast("Failed to comment");
    } finally {
      setCommentLoading((p) => ({ ...p, [postId]: false }));
    }
  };

  // -------------------------
  // Delete Comment
  // -------------------------
  const handleDeleteComment = async (postId, commentId) => {
    if (!isSignedIn) return addToast("Sign in to delete");
    try {
      const token = await getToken();
      await api.delete(`/posts/${postId}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // update locally
      setAllPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, comments: (p.comments || []).filter((c) => c._id !== commentId) } : p
        )
      );

      addToast("Comment deleted");
    } catch (err) {
      console.error("delete comment err", err);
      addToast("Failed to delete");
    }
  };

  // -------------------------
  // Edit Post (inline)
  // -------------------------
  const handleEditPost = async (postId, data) => {
    if (!isSignedIn) return addToast("Sign in to edit");
    try {
      const token = await getToken();
      const form = new FormData();
      form.append("text", data.text);
      form.append("tags", data.tags);

      if (data.newImageFile) form.append("image", data.newImageFile);
      if (data.removeImage) form.append("removeImage", "true");

      const res = await api.patch(`/posts/${postId}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const updated = res.data.post;
      // update locally
      setAllPosts((prev) => prev.map((p) => (p._id === postId ? updated : p)));
      addToast("Updated");
    } catch (err) {
      console.error("edit post err", err);
      addToast("Failed to update");
    }
  };

  // -------------------------
  // Delete Post
  // -------------------------
  const handleDeletePost = async (postId) => {
    if (!isSignedIn) return addToast("Sign in to delete");
    // removed confirm dialog for delete
    try {
      const token = await getToken();
      await api.delete(`/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
      // remove locally
      setAllPosts((prev) => prev.filter((p) => p._id !== postId));
      addToast("Deleted");
    } catch (err) {
      console.error("delete post err", err);
      addToast("Failed to delete");
    }
  };

  // -------------------------
  // Render PostCard list using the same PostCard signature as Home/Saved
  // -------------------------
  const postCards = useMemo(() => {
    return displayedPosts.map((post) => {
      const liked = (post.likes || []).includes(user?.id);
      const saved = !!savedState[post._id];

      return (
        <PostCard
          key={post._id}
          post={post}
          user={user}
          liked={liked}
          saved={saved}
          onLike={handleLike}
          onSave={handleSave}
          onShare={() => {
            navigator.clipboard.writeText(post.text || "");
            addToast("Copied!");
          }}
          showComments={openCommentsPostId === post._id}
          onToggleComments={(id) =>
            setOpenCommentsPostId(openCommentsPostId === id ? null : id)
          }
          commentState={{
            value: commentInputs[post._id] || "",
            set: (v) => setCommentInputs((p) => ({ ...p, [post._id]: v })),
            loading: !!commentLoading[post._id],
          }}
          onAddComment={() => handleAddComment(post._id)}
          onDeleteComment={(commentId) => handleDeleteComment(post._id, commentId)}
          onEdit={(postId, data) => handleEditPost(postId, data)}
          onDelete={() => handleDeletePost(post._id)}
          openImage={(url) => {
            // open image modal — reuse toast for now; if you have a modal use state
            // I'll just set a temporary toast as placeholder — adapt to your modal state if needed
            // addToast("open image: " + url);
            // Better: set a state for image modal if you want it to show big image
            // For parity with Home/Saved we kept the same prop name.
            // Implementation: parent component can show modal via setImageModal if you add that state.
            // For now do nothing.
          }}
          onReport={async (reason) => {
            try {
              const token = await getToken();
              await api.post(`/posts/${post._id}/report`, { reason }, {
                headers: { Authorization: `Bearer ${token}` }
              });
              addToast("Report submitted");
            } catch {
              addToast("Failed to report");
            }
          }}
        />
      );
    });
  }, [
    displayedPosts,
    savedState,
    openCommentsPostId,
    commentInputs,
    commentLoading,
    user,
  ]);

  // UI render — preserved layout, just inject new postCards
  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-[#07101a] via-[#061328] to-[#071428] text-white pb-12">
      <div className="max-w-3xl mx-auto px-4 pt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Explore</h2>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <BookmarkCheck size={20} className="text-blue-300" /> Browse posts
          </div>
        </div>

        {/* Search + Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <input
            type="text"
            className="flex-1 rounded bg-[#081625] border border-[#17314d] px-3 py-2 text-sm text-gray-100"
            placeholder="Search posts, users, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2 mt-2 sm:mt-0">
            <button
              onClick={() => setPostMode("trending")}
              className={`px-3 py-1 rounded ${postMode === "trending" ? "bg-[#2d67b8] text-white" : "bg-[#081625] text-gray-300"} border border-[#17314d]`}
            >
              Trending
            </button>
            <button
              onClick={() => setPostMode("popular")}
              className={`px-3 py-1 rounded ${postMode === "popular" ? "bg-[#2d67b8] text-white" : "bg-[#081625] text-gray-300"} border border-[#17314d]`}
            >
              Popular
            </button>
            <button
              onClick={() => setPostMode("recent")}
              className={`px-3 py-1 rounded ${postMode === "recent" ? "bg-[#2d67b8] text-white" : "bg-[#081625] text-gray-300"} border border-[#17314d]`}
            >
              Recent
            </button>
          </div>
        </div>

        {/* Tags preview */}
        {trending.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {trending.slice(0, 12).map((t) => (
              <button
                key={t.tag}
                onClick={() => setActiveTag(activeTag === t.tag ? "" : t.tag)}
                className={`px-3 py-1 rounded text-sm border ${activeTag === t.tag ? "bg-[#2d67b8] text-white" : "bg-[#081625] text-gray-300"} border-[#17314d]`}
              >
                #{t.tag} {t.count > 0 && <span className="text-xs text-gray-400 ml-1">({t.count})</span>}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : displayedPosts.length === 0 ? (
            <div className="text-gray-400">No posts found.</div>
          ) : (
            <div className="space-y-4">{postCards}</div>
          )}
        </div>
      </div>

      {/* Toast container */}
      <div className="fixed right-4 bottom-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="bg-[#081829] border border-[#17314d] text-white px-4 py-2 rounded shadow">
            {t.text}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Explore;
