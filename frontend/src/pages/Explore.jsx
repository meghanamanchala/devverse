import React, { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import api from "../app/api";
import { formatDate } from "../utils/formatDate";
import PostCard from "../components/Shared/PostCard";


const Explore = () => {
  const [toasts, setToasts] = useState([]);
  const addToast = (text, life = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), life);
  };
  const handleDeleteComment = async (postId, commentId) => {
    if (!isSignedIn || !user) return addToast("Sign in to delete comments.");
    try {
      const jwt = await getToken();
      await api.delete(`/posts/${postId}/comments/${commentId}`, { headers: { Authorization: `Bearer ${jwt}` } });
      addToast("Comment deleted");
      // Refresh posts
      await fetchPostsAndTags();
    } catch (err) {
      addToast("Unable to delete comment.");
    }
  };
  const [trending, setTrending] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeState, setLikeState] = useState({});
  const [showComments, setShowComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  const [postMode, setPostMode] = useState("trending"); // trending | popular | recent
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  // Fetch posts and tags
  const fetchPostsAndTags = async () => {
    setLoading(true);
    try {
      const res = await api.get("/posts");
      const posts = Array.isArray(res.data.posts) ? res.data.posts : [];
      setAllPosts(posts);
      // Trending tags
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
      setError("Failed to load trending data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostsAndTags();
  }, []);

  // Filter and sort posts based on mode, search, and tag
  useEffect(() => {
    let posts = [...allPosts];
    // Tag filter
    if (activeTag) {
      posts = posts.filter((p) => (p.tags || []).map(t => t.toLowerCase()).includes(activeTag.toLowerCase()));
    }
    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      posts = posts.filter((p) =>
        (p.text && p.text.toLowerCase().includes(q)) ||
        (p.user?.username && p.user.username.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    // Sort
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
      // Refresh posts
      await fetchPostsAndTags();
    } catch (err) {
      // Optionally show error
    }
  };

  const handleToggleComments = (postId) => setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));

  const handleAddComment = async (type, postId, value) => {
    if (type === 'input') {
      setCommentInputs((p) => ({ ...p, [postId]: value }));
      return;
    }
    if (!isSignedIn || !user) return;
    const val = (commentInputs[postId] || "").trim();
    if (!val) return;
    setCommentLoading((p) => ({ ...p, [postId]: true }));
    try {
      const jwt = await getToken();
      await api.post(`/posts/${postId}/comments`, { text: val }, { headers: { Authorization: `Bearer ${jwt}` } });
      setCommentInputs((p) => ({ ...p, [postId]: "" }));
      // Refresh posts
      await fetchPostsAndTags();
    } catch (err) {
      // Optionally show error
    } finally {
      setCommentLoading((p) => ({ ...p, [postId]: false }));
    }
  };

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-[#07101a] via-[#061328] to-[#071428] text-white pb-12">
      <div className="max-w-3xl mx-auto px-4 pt-10">
        <h2 className="text-2xl font-bold mb-6">Explore</h2>
        <div className="bg-[#101b2d] border border-[#1a2b4a] rounded-2xl shadow-lg mb-8 p-6">
          <h3 className="text-lg font-semibold mb-4">Trending</h3>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : trending.length === 0 ? (
            <div className="text-gray-400">No trending tags yet.</div>
          ) : (
            <div className="divide-y divide-[#1a2b4a]">
              {trending.slice(0, 8).map((t) => (
                <div key={t.tag} className="flex items-center justify-between py-3 cursor-pointer group" onClick={() => setActiveTag(t.tag)}>
                  <div className="flex items-center gap-2">
                    <span className={`text-[#9fc1ff] font-medium text-base group-hover:underline ${activeTag === t.tag ? 'underline' : ''}`}>#{t.tag}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{t.count} posts</span>
                    {/* Trending graph icon */}
                    <svg width="20" height="20" fill="none" viewBox="0 0 20 20" className="inline-block text-green-400"><path d="M3 13l4-4 3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 7v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              ))}
              {activeTag && (
                <div className="mt-2 text-xs text-blue-300 cursor-pointer underline" onClick={() => setActiveTag("")}>Clear tag filter</div>
              )}
            </div>
          )}
        </div>
        {/* Search and Post Mode Toggle */}
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
        {/* Posts */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{postMode.charAt(0).toUpperCase() + postMode.slice(1)} Posts{activeTag && ` — #${activeTag}`}</h3>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : displayedPosts.length === 0 ? (
            <div className="text-gray-400">No posts found.</div>
          ) : (
            <div>
              {displayedPosts.map((post) => {
                const liked = post.likes?.includes?.(user?.id || "");
                return (
                  <PostCard
                    key={post._id}
                    post={post}
                    user={user}
                    liked={liked}
                    onLike={handleLike}
                    onAddComment={handleAddComment}
                    commentValue={commentInputs[post._id] || ""}
                    commentLoading={!!commentLoading[post._id]}
                    onToggleComments={handleToggleComments}
                    showComments={!!showComments[post._id]}
                    onDeleteComment={handleDeleteComment}
                    onShare={() => {}}
                    saved={false}
                    onSave={() => {}}
                  />
                );
              })}
              {/* Toasts */}
              <div className="fixed right-4 bottom-6 z-50 flex flex-col gap-2">
                {toasts.map((t) => (
                  <div key={t.id} className="bg-[#081829] border border-[#17314d] text-white px-4 py-2 rounded shadow">{t.text}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Explore;
