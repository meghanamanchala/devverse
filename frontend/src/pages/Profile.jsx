// Profile.jsx
// User profile page (styled to match Home.jsx theme)
import React, { useEffect, useState } from "react";
import api from "../app/api";
import PostCard from "../components/Shared/PostCard";
import { useUser, useAuth } from "@clerk/clerk-react";
import { UserRound, X as XIcon } from "lucide-react";

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

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
    <div className="bg-gradient-to-br from-[#071428] to-[#0b2136] border border-[#1e3a5e]/40 rounded-2xl shadow-xl p-6 text-white min-w-[320px] max-w-md w-full">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <button
          onClick={onClose}
          aria-label="Close"
          className="ml-4 -mt-2 -mr-2 p-2 rounded-full hover:bg-[#0f2038] transition"
        >
          <XIcon className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      <div className="divide-y divide-[#12243a]/40">{children}</div>
    </div>
  </div>
);

// Helper to fetch user details by ID
const fetchUserDetails = async (id, getToken) => {
  const token = await getToken();
  const res = await api.get(`/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.user;
};

const Profile = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedState, setSavedState] = useState({});

  // Fetch saved posts for the signed-in user (to build savedState map)
  const fetchSavedPosts = async () => {
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
  };
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  const [toasts, setToasts] = useState([]);
  const [imageModal, setImageModal] = useState(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [activeSection, setActiveSection] = useState("posts");
  const [followersDetails, setFollowersDetails] = useState([]);
  const [followingDetails, setFollowingDetails] = useState([]);

  // Toast helper
  const addToast = (text) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2800);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLoaded || !isSignedIn) return;
      const token = await getToken();
      const res = await api.get("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data.user);
    };
    fetchProfile();
    fetchSavedPosts();
  }, [isLoaded, isSignedIn, getToken]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      if (!isLoaded || !isSignedIn) return;
      const token = await getToken();
      const res = await api.get(`/posts?user=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data.posts || []);
      setLoading(false);
    };
    if (activeSection === "posts") fetchPosts();
  }, [activeSection, isLoaded, isSignedIn, getToken, user]);

  // Like/unlike
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

  // Save / Unsave Post
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
      // Always re-fetch saved posts after save/unsave to sync state and avoid duplicates
      fetchSavedPosts();
    } catch {
      addToast("Failed to save");
    }
  };

  // Comments
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
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: [...p.comments, newComment] }
            : p
        )
      );
      addToast("Comment added");
      setCommentInputs((p) => ({ ...p, [postId]: "" }));
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
  useEffect(() => {
    const loadFollowers = async () => {
      if (showFollowers && profile?.followers?.length) {
        const details = await Promise.all(
          profile.followers.map((id) => fetchUserDetails(id, getToken))
        );
        setFollowersDetails(details);
      }
    };
    loadFollowers();
  }, [showFollowers, profile, getToken]);

  useEffect(() => {
    const loadFollowing = async () => {
      if (showFollowing && profile?.following?.length) {
        const details = await Promise.all(
          profile.following.map((id) => fetchUserDetails(id, getToken))
        );
        setFollowingDetails(details);
      }
    };
    loadFollowing();
  }, [showFollowing, profile, getToken]);

  if (!profile) return <div className="text-center py-10">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-6 mb-8">
        <Avatar src={profile.profileImageUrl} size={20} />
        <div>
          <div className="font-bold text-2xl">{profile.name || profile.username}</div>
          <div className="text-gray-400">@{profile.username}</div>
        </div>
      </div>

      <div className="flex gap-8 mb-8">
        <div
          className="cursor-pointer text-center"
          onClick={() => setActiveSection("posts")}
        >
          <div className="font-bold text-xl">{posts.length}</div>
          <div className="text-gray-400">Posts</div>
        </div>

        <div
          className="cursor-pointer text-center"
          onClick={() => setShowFollowers(true)}
        >
          <div className="font-bold text-xl">{profile.followers?.length || 0}</div>
          <div className="text-gray-400">Followers</div>
        </div>

        <div
          className="cursor-pointer text-center"
          onClick={() => setShowFollowing(true)}
        >
          <div className="font-bold text-xl">{profile.following?.length || 0}</div>
          <div className="text-gray-400">Following</div>
        </div>
      </div>

      {/* Posts Section */}
      {activeSection === "posts" && (
        <div className="space-y-5">
          {loading ? (
            <div className="text-center text-gray-400 py-10">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-center text-gray-400">No posts yet.</div>
          ) : (
            posts.map((post) => {
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
                    setOpenCommentsPostId(openCommentsPostId === id ? null : id)
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
                      const updated = res.data.post;
                      setPosts((prev) =>
                        prev.map((p) => (p._id === postId ? updated : p))
                      );
                      addToast("Updated!");
                    } catch (err) {
                      addToast("Failed to update");
                    }
                  }}
                  onDelete={async () => {
                    const token = await getToken();
                    await api.delete(`/posts/${post._id}`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    addToast("Deleted");
                    setPosts((prev) => prev.filter((p) => p._id !== post._id));
                  }}
                  openImage={(url) => setImageModal(url)}
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
            })
          )}
        </div>
      )}
      {/* ===== Image Modal ===== */}
      {imageModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <button
              onClick={() => setImageModal(null)}
              className="mb-2 px-3 py-1 bg-[#16273f] text-white rounded flex items-center gap-2"
            >
              <XIcon size={16} /> Close
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
          <div key={t.id} className="flex items-center gap-2 bg-[#081829] border border-[#17314d] text-white px-4 py-2 rounded shadow animate-fade-in">
            <span className="text-green-400">✔</span>
            <span className="text-sm">{t.text}</span>
          </div>
        ))}
      </div>

      {/* Followers Modal */}
      {showFollowers && (
        <Modal title="Followers" onClose={() => setShowFollowers(false)}>
          <div className="py-2">
            {followersDetails.length === 0 ? (
              <div className="text-gray-400 p-4">No followers yet.</div>
            ) : (
              <ul>
                {followersDetails.map((follower) => (
                  <li
                    key={follower._id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#0f2038] transition"
                  >
                    <div className="shrink-0">
                      <Avatar src={follower.profileImageUrl} size={10} />
                    </div>

                    <div className="flex-1">
                      <div className="font-semibold">{follower.name || follower.username}</div>
                      <div className="text-gray-400 text-sm">@{follower.username}</div>
                    </div>

                    {/* placeholder area for action (follow/unfollow) */}
                    <div>
                      {/* If you want follow/unfollow buttons, wire them up here */}
                      <button className="px-3 py-1 rounded-md border border-[#23385c]/30 text-sm text-gray-200 hover:bg-[#12304a] transition">
                        View
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Modal>
      )}

      {/* Following Modal */}
      {showFollowing && (
        <Modal title="Following" onClose={() => setShowFollowing(false)}>
          <div className="py-2">
            {followingDetails.length === 0 ? (
              <div className="text-gray-400 p-4">Not following anyone yet.</div>
            ) : (
              <ul>
                {followingDetails.map((followed) => (
                  <li
                    key={followed._id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#0f2038] transition"
                  >
                    <div className="shrink-0">
                      <Avatar src={followed.profileImageUrl} size={10} />
                    </div>

                    <div className="flex-1">
                      <div className="font-semibold">{followed.name || followed.username}</div>
                      <div className="text-gray-400 text-sm">@{followed.username}</div>
                    </div>

                    <div>
                      <button className="px-3 py-1 rounded-md border border-[#23385c]/30 text-sm text-gray-200 hover:bg-[#12304a] transition">
                        View
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Profile;
