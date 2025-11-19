import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

import {
  BookmarkCheck,
  X,
  CheckCircle,
} from "lucide-react";

import api from "../app/api";
import { useUser, useAuth } from "@clerk/clerk-react";
import PostCard from "../components/Shared/PostCard";

// ===============================
// Toast Component (identical to Home.jsx)
// ===============================
const Toast = ({ text }) => (
  <div className="flex items-center gap-2 bg-[#081829] border border-[#17314d] text-white px-4 py-2 rounded shadow animate-fade-in">
    <CheckCircle size={18} className="text-green-400" />
    <span className="text-sm">{text}</span>
  </div>
);

// ===============================
// SAVED PAGE (Home logic copy-pasted)
// ===============================
const Saved = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [posts, setPosts] = useState([]);
  const [savedState, setSavedState] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading] = useState(false);

  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [commentLoading, setCommentLoading] = useState({});

  const [toasts, setToasts] = useState([]);
  const [imageModal, setImageModal] = useState(null);

  // Toast helper
  const addToast = (text) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2800);
  };

  // ===============================
  // FETCH SAVED POSTS (same structure as fetchPosts)
  // ===============================
  const fetchSavedPosts = useCallback(async () => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      const token = await getToken();
      const res = await api.get("/save/saved-posts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const saved = res.data.saved || [];
      setPosts(saved);

      const map = {};
      saved.forEach((p) => (map[p._id] = true));
      setSavedState(map);
    } catch {
      addToast("Failed to fetch saved posts");
    }
    setLoading(false);
  }, [isLoaded, getToken]);

  useEffect(() => {
    fetchSavedPosts();
  }, [fetchSavedPosts]);

  // ===============================
  // LIKE / UNLIKE (identical to Home)
  // ===============================
  const handleLike = async (postId, liked) => {
    try {
      const token = await getToken();

      if (!liked) {
        await api.post(
          `/posts/${postId}/like`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await api.post(
          `/posts/${postId}/unlike`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id !== user.id)
                  : [...p.likes, user.id],
              }
            : p
        )
      );

      addToast(liked ? "Unliked" : "Liked");
    } catch {
      addToast("Failed to like");
    }
  };

  // ===============================
  // SAVE / UNSAVE (unsave removes from list)
  // ===============================
  const handleSave = async (postId) => {
    if (!isSignedIn) return addToast("Sign in");

    try {
      const token = await getToken();
      const isSaved = savedState[postId];

      if (!isSaved) {
        await api.post(
          `/save/${postId}/save`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        addToast("Saved");
      } else {
        await api.post(
          `/save/${postId}/unsave`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        addToast("Removed");

        // remove from UI immediately
        setPosts((prev) => prev.filter((p) => p._id !== postId));
      }

      setSavedState((prev) => ({ ...prev, [postId]: !isSaved }));
    } catch {
      addToast("Failed to save");
    }
  };

  // ===============================
  // COMMENTS (identical to Home)
  // ===============================
const handleAddComment = async (postId) => {
  const text = (commentInputs[postId] || "").trim();
  if (!text) return;

  setCommentLoading((p) => ({ ...p, [postId]: true }));

  try {
    const token = await getToken();
    const res = await api.post(
      `/posts/${postId}/comments`,
      { text },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const newComment = res.data.comment;

    // ⭐ FIX: attach userInfo manually so PostCard doesn't crash
    newComment.userInfo = {
      username:
        user?.username ||
        user?.primaryEmailAddress?.emailAddress?.split("@")[0],
      name: user?.fullName || user?.username,
    };

    // ⭐ Update posts locally
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? { ...p, comments: [...p.comments, newComment] }
          : p
      )
    );

    setCommentInputs((p) => ({ ...p, [postId]: "" }));
    addToast("Comment added");
  } catch {
    addToast("Failed to comment");
  }

  setCommentLoading((p) => ({ ...p, [postId]: false }));
};


  const handleDeleteComment = async (postId, commentId) => {
    try {
      const token = await getToken();

      await api.delete(`/posts/${postId}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: p.comments.filter((c) => c._id !== commentId) }
            : p
        )
      );

      addToast("Comment deleted");
    } catch {
      addToast("Failed to delete");
    }
  };

  // ===============================
  // EDIT POST (identical to Home)
  // ===============================
  const handleEdit = async (postId, data) => {
    try {
      const token = await getToken();

      const form = new FormData();
      form.append("text", data.text);
      form.append("tags", data.tags);

      if (data.newImageFile) {
        form.append("image", data.newImageFile);
      }
      if (data.removeImage) {
        form.append("removeImage", "true");
      }

      const res = await api.patch(`/posts/${postId}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const updated = res.data.post;

      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? updated : p))
      );

      addToast("Updated");
    } catch {
      addToast("Failed to update");
    }
  };

  // ===============================
  // DELETE POST (identical)
  // ===============================
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;

    try {
      const token = await getToken();

      await api.delete(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts((prev) => prev.filter((p) => p._id !== postId));
      addToast("Deleted");
    } catch {
      addToast("Failed to delete");
    }
  };

  // ===============================
  // RENDER POST CARDS (identical to Home)
  // ===============================
const postCards = useMemo(() => {
  return posts.map((post) => {
    const liked = post.likes.includes(user?.id);
    const saved = savedState[post._id] || false;

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
          set: (v) =>
            setCommentInputs((p) => ({ ...p, [post._id]: v })),
          loading: !!commentLoading[post._id],
        }}
        onAddComment={() => handleAddComment(post._id)}
        onDeleteComment={(commentId) =>
          handleDeleteComment(post._id, commentId)
        }

        // ⭐ FIXED — EXACTLY LIKE HOME
        onEdit={(postId, data) => handleEdit(postId, data)}

        onDelete={() => handleDeletePost(post._id)}
        openImage={(url) => setImageModal(url)}
      />
    );
  });
}, [
  posts,
  savedState,
  openCommentsPostId,
  commentInputs,
  commentLoading,
  user,
]);


  // ===============================
  // UI
  // ===============================
  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-[#07101a] via-[#061328] to-[#071428] text-white pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-10">

        <div className="flex items-center gap-3 mb-6">
          <BookmarkCheck size={32} className="text-blue-300" />
          <h1 className="text-3xl font-bold">Saved Posts</h1>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-10">
            Loading posts…
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <BookmarkCheck size={42} className="mx-auto mb-4 text-blue-400" />
            <p>No saved posts found.</p>
          </div>
        ) : (
          <div className="space-y-5">{postCards}</div>
        )}
      </div>

      {/* Image Modal */}
      {imageModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <button
              onClick={() => setImageModal(null)}
              className="mb-2 px-3 py-1 bg-[#16273f] text-white rounded flex items-center gap-2"
            >
              <X size={16} /> Close
            </button>

            <img
              src={imageModal}
              className="rounded-lg shadow-xl w-full object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} text={t.text} />
        ))}
      </div>
    </section>
  );
};

export default Saved;
