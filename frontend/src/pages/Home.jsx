// ===============================
// src/pages/Home.jsx
// Cleaned UI + Lucide Icons + Smooth Animations
// ===============================

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";

import {
  CodeXml,
  Camera,
  Heart,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  Share2,
  UserRound,
  MoreVertical,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import api from "../app/api";
import { useUser, useAuth } from "@clerk/clerk-react";

import PostCard from "../components/Shared/PostCard";

//
// ===============================
// Save user to MongoDB
// ===============================
const saveUserToDB = async (user, getToken) => {
  try {
    const token = await getToken();

    await fetch("http://localhost:5000/api/auth/save-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        clerkId: user.id,
        email: user.primaryEmailAddress.emailAddress,
        name: user.fullName,
        username:
          user.username ||
          user.primaryEmailAddress.emailAddress.split("@")[0],
      }),
    });
  } catch (err) {
    console.error("❌ Error saving user:", err);
  }
};

//
// ===============================
// Avatar Component (Lucide-based)
// ===============================
const Avatar = ({ src, size = 10 }) => (
  <div
    className={`w-${size} h-${size} rounded-full overflow-hidden border border-[#23385c] bg-[#16223a] flex items-center justify-center`}
  >
    {src ? (
      <img
        src={src}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/fallback-avatar.png";
        }}
        alt="avatar"
      />
    ) : (
      <UserRound className="text-gray-300 w-6 h-6" />
    )}
  </div>
);


//
// ===============================
// Composer Component (clean)
// ===============================
// =========================================
// ✨ BEAUTIFIED COMPOSER COMPONENT — FINAL
// =========================================
const Composer = ({ user, isSignedIn, onPost, uploading }) => {
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const clearForm = () => {
    setText("");
    setTags("");
    setImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return;
    await onPost({ text, tags, image, clearForm });
  };

  return (
    <div
      className="
        bg-[#0b1628]/80 
        border border-[#1d3557]/40 
        rounded-2xl 
        backdrop-blur-md 
        p-6 
        shadow-xl 
        shadow-black/30
        transition 
        hover:border-[#2f6ccb]/60 
        hover:shadow-[#0e1a33]/50
        duration-300
        mb-10
      "
    >
      {/* Top Section */}
      <div className="flex gap-4 mb-4">
        {/* Avatar */}
        <div className="shrink-0">
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              className="w-11 h-11 rounded-full border border-[#24456c] object-cover"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-[#16223a] border border-[#24456c] flex items-center justify-center">
              <UserRound className="text-gray-300" size={20} />
            </div>
          )}
        </div>

        {/* Textarea */}
<textarea
  className="
    flex-1 
    bg-[#0e1c2f]/40 
    border border-[#1d3557]/40     /* ⭐ default visible border */
    focus:border-[#2f6ccb] 
    focus:ring-2 
    focus:ring-[#2f6ccb]/40 
    rounded-xl 
    p-4 
    text-gray-100 
    placeholder-gray-400 
    min-h-[90px] 
    outline-none
    transition
  "
  placeholder={
    isSignedIn
      ? 'What are you building today?'
      : 'Sign in to share something...'
  }
  value={text}
  onChange={(e) => setText(e.target.value)}
  disabled={!isSignedIn}
/>

      </div>

      {/* Image Preview */}
      {preview && (
        <div className="relative w-fit mb-4">
          <img
            src={preview}
            className="w-36 h-36 object-cover rounded-xl border border-[#2f4a6d]/40 shadow-lg"
          />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              setImage(null);
            }}
            className="
              absolute 
              -top-2 
              -right-2 
              w-7 
              h-7 
              rounded-full 
              bg-red-600 
              text-white 
              flex 
              items-center 
              justify-center 
              shadow 
              hover:bg-red-700
              transition
            "
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Bottom Row */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Left controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Upload Image */}
          <label
            className="
              flex items-center gap-2 
              bg-[#0f2038] 
              border border-[#2a3f5e]/40 
              px-3 py-2 
              rounded-lg 
              text-gray-200 
              cursor-pointer 
              hover:bg-[#143057]/70 
              transition
              text-sm
            "
          >
            <Camera size={15} />
            Image
            <input
              type="file"
              ref={fileRef}
              accept="image/*"
              className="hidden"
              onChange={handleImage}
            />
          </label>

          {/* Tags */}
          <input
            className="
              bg-[#0e1c2f]/40
              border border-transparent
              focus:border-[#2f6ccb]
              focus:ring-2
              focus:ring-[#2f6ccb]/40
              text-gray-200
              text-sm
              px-3
              py-2
              rounded-lg
              outline-none
              transition
              placeholder-gray-400
              flex-1
            "
            placeholder="Tag : React, UI, Design"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            disabled={!isSignedIn}
          />

          {/* Clear */}
          <button
            type="button"
            onClick={clearForm}
            className="
              px-3 
              py-2 
              rounded-lg 
              border border-[#2a3f5e]/40 
              text-gray-300 
              text-sm 
              hover:bg-[#143057]/50 
              transition
            "
          >
            Clear
          </button>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isSignedIn || uploading || (!text.trim() && !image)}
          className="
            w-full sm:w-auto
            px-6 
            py-2.5 
            bg-gradient-to-br 
            from-[#2d67b8] 
            to-[#1b3a78] 
            rounded-xl 
            text-white 
            font-medium 
            shadow-md 
            hover:scale-[1.03] 
            hover:shadow-lg 
            active:scale-[0.97] 
            transition 
            disabled:opacity-50 
            disabled:cursor-not-allowed
          "
        >
          {uploading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
};


//
// ===============================
// Toast System (Modern, Clean)
// ===============================
const Toast = ({ text }) => (
  <div className="flex items-center gap-2 bg-[#081829] border border-[#17314d] text-white px-4 py-2 rounded shadow animate-fade-in">
    <CheckCircle size={18} className="text-green-400" />
    <span className="text-sm">{text}</span>
  </div>
);


//
// ===============================
// Main Home Component (logic part)
// ===============================
const Home = () => {
  const navigate = useNavigate();
  const { user, isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [posts, setPosts] = useState([]);
  const [savedState, setSavedState] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  const [toasts, setToasts] = useState([]);
  const [imageModal, setImageModal] = useState(null);

  //
  // Toast helper
  //
  const addToast = (text) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2800);
  };

  //
  // Sync user once
  //
  const [synced, setSynced] = useState(false);
  useEffect(() => {
    if (!isLoaded || !user || synced) return;
    saveUserToDB(user, getToken);
    setSynced(true);
  }, [isLoaded, user, synced]);


  //
  // Fetch posts
  //
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/posts");
      setPosts(res.data.posts || []);
    } catch {
      addToast("Failed to fetch posts");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);


  //
  // Create Post
  //
  const handlePost = async ({ text, tags, image, clearForm }) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("text", text);
      form.append("tags", tags);
      if (image) form.append("image", image);

      const token = await getToken();
      await api.post("/posts", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      addToast("Posted!");
      clearForm();
      fetchPosts();
    } catch {
      addToast("Failed to post");
    }
    setUploading(false);
  };


  //
  // Like/unlike
  //
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

      addToast(liked ? "Unliked" : "Liked");

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
    } catch {
      addToast("Failed to like post");
    }
  };

  //
  // Save / Unsave Post
  //
  const handleSave = async (postId) => {
    if (!isSignedIn) return addToast("Sign in to save");

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
      }

      setSavedState((prev) => ({
        ...prev,
        [postId]: !isSaved,
      }));
    } catch {
      addToast("Failed to save");
    }
  };

  //
  // Comments
  //
const handleAddComment = async (postId) => {
  const text = (commentInputs[postId] || "").trim();
  if (!text) return;

  setCommentLoading(p => ({ ...p, [postId]: true }));

  try {
    const token = await getToken();

    const res = await api.post(
      `/posts/${postId}/comments`,
      { text },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const newComment = res.data.comment;

    // local update instead of fetchPosts()
    setPosts(prev =>
      prev.map(p =>
        p._id === postId
          ? { ...p, comments: [...p.comments, newComment] }
          : p
      )
    );

    addToast("Comment added");
    setCommentInputs(p => ({ ...p, [postId]: "" }));
  } catch {
    addToast("Failed to comment");
  }

  setCommentLoading(p => ({ ...p, [postId]: false }));
};


const handleDeleteComment = async (postId, commentId) => {
  try {
    const token = await getToken();

    await api.delete(`/posts/${postId}/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setPosts(prev =>
      prev.map(p =>
        p._id === postId
          ? { ...p, comments: p.comments.filter(c => c._id !== commentId) }
          : p
      )
    );

    addToast("Comment deleted");
  } catch {
    addToast("Failed to delete");
  }
};


  //
  // Post Cards Rendering
  //
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
            addToast("Copied to clipboard");
          }}
          showComments={openCommentsPostId === post._id}
          onToggleComments={(id) =>
            setOpenCommentsPostId(
              openCommentsPostId === id ? null : id
            )
          }
          commentState={{
            value: commentInputs[post._id] || "",
            set: (v) =>
              setCommentInputs((p) => ({
                ...p,
                [post._id]: v,
              })),
            loading: !!commentLoading[post._id],
          }}
          onAddComment={() => handleAddComment(post._id)}
          onDeleteComment={(commentId) =>
            handleDeleteComment(post._id, commentId)
          }
onEdit={async (postId, data) => {
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

    // DO NOT FETCH POSTS — update locally to avoid scroll jump
    const updated = res.data.post;

    setPosts(prev =>
      prev.map(p => (p._id === postId ? updated : p))
    );

    addToast("Updated!");
  } catch (err) {
    addToast("Failed to update");
  }
}}


          onDelete={async () => {
            if (!window.confirm("Delete this post?")) return;
            const token = await getToken();
            await api.delete(`/posts/${post._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            addToast("Deleted");
            fetchPosts();
          }}
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

  //
  // UI RENDER
  //
  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-[#07101a] via-[#061328] to-[#071428] text-white pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-10">

        {/* ===== Hero Banner ===== */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-[#071428] to-[#0b2136] border border-[#1e3a5e]/40 shadow-lg flex flex-col md:flex-row items-center gap-4 mb-10">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#2f68b6] to-[#1b3a78]">
            <CodeXml size={48} />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold">
              Welcome to <span className="text-[#9fc1ff]">DevVerse</span>
            </h1>
            <p className="text-gray-300 mt-1 text-sm md:text-base">
              A friendly community for developers — share projects and collaborate.
            </p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={() =>
                window.scrollTo({ top: 700, behavior: "smooth" })
              }
              className="px-4 py-2 rounded-lg border border-[#2d4f7a] hover:bg-[#142644] transition"
            >
              Explore
            </button>
          </div>
        </div>

        {/* Composer */}
        <Composer
          user={user}
          isSignedIn={isSignedIn}
          onPost={handlePost}
          uploading={uploading}
        />

        {/* Posts */}
        {loading ? (
          <div className="text-center text-gray-400 py-10">
            Loading posts...
          </div>
        ) : (
          <div className="space-y-5">{postCards}</div>
        )}
      </div>

      {/* ===== Image Modal ===== */}
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

      {/* ===== Toasts ===== */}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} text={t.text} />
        ))}
      </div>
    </section>
  );
};

export default Home;
