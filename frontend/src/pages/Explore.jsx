



import React, { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import api from "../app/api";
import { formatDate } from "../utils/formatDate";
import { FaUserCircle, FaRegComment, FaRegBookmark, FaBookmark, FaShareAlt } from "react-icons/fa";

// Minimal Avatar and Tag for reuse (copied from Home)
const Avatar = ({ src, alt, size = 8 }) => (
  src ? (
    <img
      src={src}
      alt={alt || "avatar"}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = "";
      }}
      className={`w-${size} h-${size} rounded-full object-cover border border-[#23385c]`}
      loading="lazy"
    />
  ) : (
    <div className={`w-${size} h-${size} rounded-full bg-[#16223a] flex items-center justify-center text-gray-400 border border-[#23385c]`}>
      <FaUserCircle className="w-6 h-6" />
    </div>
  )
);
const Tag = ({ children }) => (
  <span className="text-xs px-2 py-0.5 rounded-full bg-[#122033] text-[#9fc1ff] border border-[#23385c]/40 mr-1 mb-1 inline-block">#{children}</span>
);

// PostCard for trending posts (with like, comment, share, save)
const PostCard = ({ post, user, onLike, liked, onAddComment, commentValue, commentLoading, onToggleComments, showComments }) => {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const shortText = post.text?.length > 240 ? post.text.slice(0, 240) + "…" : post.text;

  const handleShare = async () => {
    const txt = post.text || "";
    if (navigator?.clipboard) {
      try {
        await navigator.clipboard.writeText(txt);
        // Optionally show a toast
      } catch {}
    }
  };

  const handleSave = () => setSaved((s) => !s);

  return (
    <article className="relative rounded-lg p-4 bg-[#081224] border border-[#17314d] shadow-sm mb-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <Avatar src={post.user?.avatar} alt={post.user?.username || "avatar"} size={8} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[#cbe0ff] font-medium text-sm truncate">{post.user?.username || "Anonymous"}</span>
            <time className="text-xs text-gray-400 ml-1" dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
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
              {liked ? <svg width="16" height="16" fill="currentColor" className="inline text-pink-400"><path d="M8 14s6-4.35 6-7.5A3.5 3.5 0 0 0 8 3a3.5 3.5 0 0 0-6 3.5C2 9.65 8 14 8 14z"/></svg> : <svg width="16" height="16" fill="currentColor" className="inline"><path d="M8 14s6-4.35 6-7.5A3.5 3.5 0 0 0 8 3a3.5 3.5 0 0 0-6 3.5C2 9.65 8 14 8 14z"/></svg>} <span>{post.likes?.length || 0}</span>
            </button>
            <button onClick={() => onToggleComments(post._id)} className="flex items-center gap-2">
              <FaRegComment className="inline w-4 h-4" /> <span>{post.comments?.length || 0}</span>
            </button>
            <button onClick={handleShare} title="Share" className="p-1.5 rounded hover:bg-[#1b2a49]">
              <FaShareAlt className="w-4 h-4" />
            </button>
            <button onClick={handleSave} title="Save" className="p-1.5 rounded hover:bg-[#1b2a49] ml-auto">
              {saved ? <FaBookmark className="w-4 h-4" /> : <FaRegBookmark className="w-4 h-4" />}
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
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-gray-400">No comments yet.</div>
              )}
              <div className="mt-3 flex items-center gap-2">
                <input type="text" className="flex-1 rounded bg-[#081625] border border-[#17314d] px-2 py-1 text-sm text-gray-100" placeholder="Add a comment..." value={commentValue} onChange={e => onAddComment('input', post._id, e.target.value)} />
                <button onClick={() => onAddComment('submit', post._id)} className="px-3 py-1 rounded bg-[#2d67b8] text-white text-sm">{commentLoading ? '...' : 'Post'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

const Explore = () => {
  const [trending, setTrending] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeState, setLikeState] = useState({});
  const [showComments, setShowComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        // Fetch all posts
        const res = await api.get("/posts");
        const posts = Array.isArray(res.data.posts) ? res.data.posts : [];
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
        // Trending posts: sort by likes desc, then comments desc, then createdAt desc
        const sortedPosts = [...posts].sort((a, b) => {
          const likesA = a.likes?.length || 0;
          const likesB = b.likes?.length || 0;
          if (likesB !== likesA) return likesB - likesA;
          const commentsA = a.comments?.length || 0;
          const commentsB = b.comments?.length || 0;
          if (commentsB !== commentsA) return commentsB - commentsA;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setTrendingPosts(sortedPosts.slice(0, 10)); // Top 10 trending posts
        setError(null);
      } catch (err) {
        setError("Failed to load trending data");
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const handleLike = async (postId, liked) => {
    if (!isSignedIn || !user) return;
    try {
      const jwt = await getToken();
      if (!liked) await api.post(`/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${jwt}` } });
      else await api.post(`/posts/${postId}/unlike`, {}, { headers: { Authorization: `Bearer ${jwt}` } });
      setLikeState((p) => ({ ...p, [postId]: !liked }));
      setTrendingPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, likes: liked ? p.likes.filter((id) => id !== user.id) : [...(p.likes || []), user.id] } : p)));
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
      const res = await api.get("/posts");
      const posts = Array.isArray(res.data.posts) ? res.data.posts : [];
      const sortedPosts = [...posts].sort((a, b) => {
        const likesA = a.likes?.length || 0;
        const likesB = b.likes?.length || 0;
        if (likesB !== likesA) return likesB - likesA;
        const commentsA = a.comments?.length || 0;
        const commentsB = b.comments?.length || 0;
        if (commentsB !== commentsA) return commentsB - commentsA;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setTrendingPosts(sortedPosts.slice(0, 10));
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
              {trending.slice(0, 3).map((t) => (
                <div key={t.tag} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[#9fc1ff] font-medium text-base">#{t.tag}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{t.count} posts</span>
                    {/* Trending graph icon */}
                    <svg width="20" height="20" fill="none" viewBox="0 0 20 20" className="inline-block text-green-400"><path d="M3 13l4-4 3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 7v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Trending Posts */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Trending Posts</h3>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : trendingPosts.length === 0 ? (
            <div className="text-gray-400">No trending posts yet.</div>
          ) : (
            <div>
              {trendingPosts.map((post) => {
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
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Explore;
