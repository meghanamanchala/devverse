// src/pages/Explore.jsx
import React, { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import api from "../app/api";
import PostCard from "../components/Shared/PostCard";

const Explore = () => {
  const [toasts, setToasts] = useState([]);
  const addToast = (text, life = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), life);
  };

  const [trending, setTrending] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeState, setLikeState] = useState({});
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  const [postMode, setPostMode] = useState("trending"); // trending | popular | recent
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [savedState, setSavedState] = useState({});
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const handleSave = (postId) => {
    setSavedState((prev) => ({ ...prev, [postId]: !prev[postId] }));
    addToast(savedState[postId] ? "Removed from saved" : "Saved post");
  };

  const fetchPostsAndTags = async () => {
    setLoading(true);
    try {
      const res = await api.get("/posts");
      const posts = Array.isArray(res.data.posts) ? res.data.posts : [];
      setAllPosts(posts);

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
      setError("Failed to load trending data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostsAndTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let posts = [...allPosts];
    if (activeTag) {
      posts = posts.filter((p) => (p.tags || []).map(t => t.toLowerCase()).includes(activeTag.toLowerCase()));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      posts = posts.filter((p) =>
        (p.text && p.text.toLowerCase().includes(q)) ||
        (p.user?.username && p.user.username.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
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

  const handleLike = async (postId, liked) => {
    if (!isSignedIn || !user) return;
    try {
      const jwt = await getToken();
      if (!liked) await api.post(`/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${jwt}` } });
      else await api.post(`/posts/${postId}/unlike`, {}, { headers: { Authorization: `Bearer ${jwt}` } });
      setLikeState((p) => ({ ...p, [postId]: !liked }));
      await fetchPostsAndTags();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleComments = (postId) => {
    setOpenCommentsPostId((prev) => (prev === postId ? null : postId));
  };

  const handleAddComment = async (type, postId, value) => {
    if (type === 'input') {
      setCommentInputs((p) => ({ ...p, [postId]: value }));
      return;
    }
    if (!isSignedIn || !user) return addToast("Sign in to comment.");
    const val = (commentInputs[postId] || "").trim();
    if (!val) return;
    setCommentLoading((p) => ({ ...p, [postId]: true }));
    try {
      const jwt = await getToken();
      await api.post(`/posts/${postId}/comments`, { text: val }, { headers: { Authorization: `Bearer ${jwt}` } });
      setCommentInputs((p) => ({ ...p, [postId]: "" }));
      await fetchPostsAndTags();
    } catch (err) {
      console.error(err);
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
      await fetchPostsAndTags();
    } catch (err) {
      console.error(err);
      addToast("Unable to delete comment.");
    }
  };

  // Menu handlers for Explore
  // Inline edit handler for PostCard
  const handleEditPost = async (editData, setIsEditing, post) => {
    if (!isSignedIn || !user) return addToast("Sign in to edit posts.");
    try {
      const jwt = await getToken();
      const form = new FormData();
      form.append("text", editData.text.trim());
      form.append("tags", editData.tags);
      if (editData.imageFile) form.append("image", editData.imageFile);
      if (editData.removeImage) form.append("removeImage", "true");
      await api.patch(`/posts/${post._id}`, form, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      addToast("Post updated");
      await fetchPostsAndTags();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message;
      if (msg === "You can only edit if you are the author or an admin.") {
        addToast(msg);
      } else {
        addToast("Could not update post");
      }
    }
  };

  const handleDeletePost = async (post) => {
    if (!isSignedIn || !user) return addToast("Sign in to delete posts.");
    const confirmed = window.confirm("Delete this post?");
    if (!confirmed) return;
    try {
      const jwt = await getToken();
      await api.delete(`/posts/${post._id}`, { headers: { Authorization: `Bearer ${jwt}` } });
      addToast("Post deleted");
      await fetchPostsAndTags();
    } catch (err) {
      console.error(err);
      addToast("Could not delete post");
    }
  };

  const handleReportPost = async (post, reason) => {
    try {
      const jwt = isSignedIn ? await getToken() : null;
      await api.post(`/posts/${post._id}/report`, { reason: reason || "Reported from Explore" }, { headers: jwt ? { Authorization: `Bearer ${jwt}` } : {} });
      addToast("Report submitted");
    } catch (err) {
      addToast("Report submitted");
    }
  };

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-[#07101a] via-[#061328] to-[#071428] text-white pb-12">
      <div className="max-w-3xl mx-auto px-4 pt-10">
        <h2 className="text-2xl font-bold mb-6">Explore</h2>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <input
            type="text"
            className="flex-1 rounded bg-[#081625] border border-[#17314d] px-3 py-2 text-sm text-gray-100"
            placeholder="Search posts, users, or tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex gap-2 mt-2 sm:mt-0">
            <button onClick={() => setPostMode("trending")}
              className={`px-3 py-1 rounded ${postMode === 'trending' ? 'bg-[#2d67b8] text-white' : 'bg-[#081625] text-gray-300'} border border-[#17314d]`}>Trending</button>
            <button onClick={() => setPostMode("popular")}
              className={`px-3 py-1 rounded ${postMode === 'popular' ? 'bg-[#2d67b8] text-white' : 'bg-[#081625] text-gray-300'} border border-[#17314d]`}>Popular</button>
            <button onClick={() => setPostMode("recent")}
              className={`px-3 py-1 rounded ${postMode === 'recent' ? 'bg-[#2d67b8] text-white' : 'bg-[#081625] text-gray-300'} border border-[#17314d]`}>Recent</button>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : displayedPosts.length === 0 ? (
            <div className="text-gray-400">No posts found.</div>
          ) : (
            <div className="space-y-4">
              {displayedPosts.map((post) => {
                const liked = post.likes?.includes?.(user?.id || "");
                const isSaved = !!savedState[post._id];
                const commentsWithPerm = (post.comments || []).map((c) => ({ ...c, showDelete: !!(user && (c.user === user.id || post.author === user.id)) }));
                return (
                  <PostCard
                    key={post._id}
                    post={{ ...post, comments: commentsWithPerm }}
                    user={user}
                    liked={liked}
                    onLike={handleLike}
                    onAddComment={handleAddComment}
                    commentValue={commentInputs[post._id] || ""}
                    commentLoading={!!commentLoading[post._id]}
                    onToggleComments={handleToggleComments}
                    showComments={openCommentsPostId === post._id}
                    onDeleteComment={handleDeleteComment}
                    onShare={() => {}}
                    saved={isSaved}
                    onSave={handleSave}
                    onEdit={(editData, setIsEditing) => handleEditPost(editData, setIsEditing, post)}
                    onDelete={() => handleDeletePost(post)}
                    onReport={(reason) => handleReportPost(post, reason)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="fixed right-4 bottom-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="bg-[#081829] border border-[#17314d] text-white px-4 py-2 rounded shadow">{t.text}</div>
        ))}
      </div>
    </section>
  );
};

export default Explore;
