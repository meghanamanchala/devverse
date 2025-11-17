// src/components/Shared/PostCard.jsx
import React, { useState, useEffect } from "react";
// Simple modal component for report
function ReportModal({ open, onClose, onSubmit }) {
  const [reason, setReason] = useState("");
  useEffect(() => { if (!open) setReason(""); }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#101b2d] border border-[#23385c] rounded-lg p-6 w-full max-w-xs shadow-lg">
        <h3 className="text-lg font-semibold mb-2 text-white">Report Post</h3>
        <textarea
          className="w-full rounded bg-[#081625] border border-[#17314d] px-2 py-1 text-sm text-gray-100 mb-3"
          rows={3}
          placeholder="Why are you reporting this post? (optional)"
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
        <div className="flex gap-2 justify-end">
          <button className="px-3 py-1 rounded bg-[#17314d] text-gray-200 text-sm" onClick={onClose}>Cancel</button>
          <button className="px-3 py-1 rounded bg-[#2d67b8] text-white text-sm" onClick={() => { onSubmit(reason); onClose(); }}>Submit</button>
        </div>
      </div>
    </div>
  );
}
import { FaUserCircle, FaRegComment, FaRegBookmark, FaBookmark, FaShareAlt } from "react-icons/fa";
import { formatDate } from "../../utils/formatDate";

const Avatar = ({ src, alt, size = 8 }) => (
  src ? (
    <img
      src={src}
      alt={alt || "avatar"}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = "/fallback-avatar.png";
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

const PostCard = ({
  post,
  user,
  liked,
  onLike,
  onToggleComments,
  showComments,
  onShare,
  saved,
  onSave,
  onDeleteComment,
  onAddComment,
  commentValue,
  commentLoading,
  commentState,
  onEdit,
  onDelete,
  onReport,
  openImage,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const shortText = post.text?.length > 240 ? post.text.slice(0, 240) + "…" : post.text;
  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text || "");
  const [editTags, setEditTags] = useState(post.tags ? post.tags.join(", ") : "");
  const [editImage, setEditImage] = useState(post.image || null);
  const [editImageFile, setEditImageFile] = useState(null);

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e) => {
      if (!e.target.closest(`#post-menu-${post._id}`)) setShowMenu(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [showMenu, post._id]);

  return (
    <article className="relative rounded-lg p-4 bg-[#081224] border border-[#17314d] shadow-sm mb-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <Avatar src={post.user?.avatar} alt={post.user?.username || "avatar"} size={8} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#cbe0ff] font-medium text-sm truncate">{post.user?.username || "Anonymous"}</span>
              <time className="text-xs text-gray-400 ml-1" dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
            </div>
            <div className="relative" id={`post-menu-${post._id}`}>
              <button
                className="p-1.5 rounded-full hover:bg-[#1b2a49] text-gray-400"
                onClick={() => setShowMenu((v) => !v)}
                aria-label="Post options"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="4" cy="10" r="1.5" fill="currentColor"/><circle cx="10" cy="10" r="1.5" fill="currentColor"/><circle cx="16" cy="10" r="1.5" fill="currentColor"/></svg>
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-[#101b2d] border border-[#23385c] rounded shadow-lg z-20 text-sm">
                  {/* Only show Edit if user is author */}
                  {user && post.author === user.id && (
                    <button className="block w-full text-left px-4 py-2 hover:bg-[#17314d] text-gray-200" onClick={() => { setShowMenu(false); setIsEditing(true); setEditText(post.text || ""); }}>Edit</button>
                  )}
                  {user && post.author === user.id && (
                    <button className="block w-full text-left px-4 py-2 hover:bg-[#17314d] text-red-400" onClick={() => { setShowMenu(false); onDelete && onDelete(); }}>Delete</button>
                  )}
                  <button className="block w-full text-left px-4 py-2 hover:bg-[#17314d] text-gray-200" onClick={() => {
                    setShowMenu(false);
                    setShowReportModal(true);
                  }}>Report</button>
                </div>
              )}
            </div>
          </div>

          {/* Inline editing UI */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                className="w-full rounded bg-[#081625] border border-[#17314d] px-2 py-1 text-sm text-gray-100"
                value={editText}
                onChange={e => setEditText(e.target.value)}
                rows={3}
                autoFocus
              />
              <input
                type="text"
                className="w-full rounded bg-[#081625] border border-[#17314d] px-2 py-1 text-sm text-gray-100"
                value={editTags}
                onChange={e => setEditTags(e.target.value)}
                placeholder="Tags (comma separated)"
              />
              <div className="flex items-center gap-3">
                {editImage && (
                  <div className="relative">
                    <img src={editImage} alt="edit preview" className="w-28 h-20 object-cover rounded border border-[#23385c]/25" />
                    <button type="button" className="absolute top-0 right-0 bg-black/60 text-white rounded px-1 text-xs" onClick={() => { setEditImage(null); setEditImageFile(null); }}>✕</button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setEditImage(URL.createObjectURL(file));
                      setEditImageFile(file);
                    }
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded bg-[#2d67b8] text-white text-sm"
                  onClick={async () => {
                    if (onEdit) await onEdit({
                      text: editText,
                      tags: editTags,
                      imageFile: editImageFile,
                      removeImage: !editImage && post.image
                    }, setIsEditing);
                  }}
                >Save</button>
                <button
                  className="px-3 py-1 rounded bg-[#17314d] text-gray-200 text-sm"
                  onClick={() => setIsEditing(false)}
                >Cancel</button>
              </div>
            </div>
          ) : post.text && (
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
              <img onClick={() => openImage && openImage(post.image)} src={post.image} alt={post.text?.slice(0, 60) || "post image"} className="w-full max-w-xl rounded-md object-cover border border-[#23385c]/25 cursor-pointer" />
            </div>
          )}

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.tags.map((t, i) => (<Tag key={i}>{t}</Tag>))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-4 border-t border-[#17314d] pt-3 text-sm text-[#9fc1ff]">
            <button onClick={() => onLike && onLike(post._id, liked)} className="flex items-center gap-2" aria-pressed={!!liked}>
              {liked ? (
                <svg width="16" height="16" fill="currentColor" className="inline text-pink-400">
                  <path d="M8 14s6-4.35 6-7.5A3.5 3.5 0 0 0 8 3a3.5 3.5 0 0 0-6 3.5C2 9.65 8 14 8 14z" />
                </svg>
              ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" className="inline">
                  <path d="M8 14s6-4.35 6-7.5A3.5 3.5 0 0 0 8 3a3.5 3.5 0 0 0-6 3.5C2 9.65 8 14 8 14z" />
                </svg>
              )}
              <span>{post.likes?.length || 0}</span>
            </button>

            <button onClick={() => onToggleComments && onToggleComments(post._id)} className="flex items-center gap-2">
              <FaRegComment className="inline w-4 h-4" /> <span>{post.comments?.length || 0}</span>
            </button>

            <button onClick={() => onShare && onShare(post)} title="Share" className="p-1.5 rounded hover:bg-[#1b2a49]">
              <FaShareAlt className="w-4 h-4" />
            </button>

            <button onClick={() => onSave && onSave(post._id)} title="Save" className="p-1.5 rounded hover:bg-[#1b2a49] ml-auto">
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
                      {user && (c.user === user.id || post.author === user.id) && (
                        <button onClick={() => onDeleteComment && onDeleteComment(post._id, c._id)} className="text-xs text-red-400">Delete</button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-gray-400">No comments yet.</div>
              )}

              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 rounded bg-[#081625] border border-[#17314d] px-2 py-1 text-sm text-gray-100"
                  placeholder="Add a comment..."
                  value={commentValue ?? commentState?.value ?? ""}
                  onChange={e => commentState?.set ? commentState.set(e.target.value) : onAddComment?.('input', post._id, e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (onAddComment && typeof onAddComment === 'function') {
                        // Explore uses ('submit', postId), Home uses (postId)
                        // we support both: try 'submit' signature first
                        try {
                          onAddComment('submit', post._id);
                        } catch {
                          onAddComment(post._id);
                        }
                      }
                    }
                  }}
                  disabled={commentLoading || commentState?.loading}
                />
                <button onClick={() => {
                  if (onAddComment && typeof onAddComment === 'function') {
                    try {
                      onAddComment('submit', post._id);
                    } catch {
                      onAddComment(post._id);
                    }
                  }
                }} className="px-3 py-1 rounded bg-[#2d67b8] text-white text-sm">{commentLoading || commentState?.loading ? '...' : 'Post'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Report Modal (outside menu for correct toast timing) */}
      <ReportModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={async (reason) => {
          if (onReport) await onReport(reason);
          setShowReportModal(false);
        }}
      />
    </article>
  );

// (Removed duplicate JSX block that caused syntax errors)
};

export default PostCard;
