// src/components/Shared/PostCard.jsx
import React, { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  Share2,
  MoreHorizontal,
  X,
  Image as ImageIcon,
  Pencil,
  Trash2,
  Flag,
  Camera,
} from "lucide-react";
import { formatDate } from "../../utils/formatDate";

//
// ===============================
// ✨ EDIT POST MODAL
// ===============================
function EditPostModal({ open, post, onSave, onClose }) {
  const [text, setText] = useState(post?.text || "");
  const [tags, setTags] = useState(post?.tags?.join(", ") || "");
  const [image, setImage] = useState(post?.image || null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (open) {
      setText(post.text);
      setTags(post.tags?.join(", ") || "");
      setImage(post.image);
      setFile(null);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-md flex items-center justify-center p-5 animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0c1624] border border-[#1c2f4d] rounded-2xl shadow-2xl p-6 animate-scaleIn">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-white font-semibold">Edit Post</h2>
          <button className="text-gray-300 hover:text-white" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Text area */}
        <textarea
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-[#081625] text-gray-200 border border-[#17314d] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2d67b8]"
        />

        {/* Tags */}
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tags: react, ui"
          className="w-full bg-[#081625] text-gray-200 border border-[#17314d] rounded-lg px-3 py-2 mt-3 focus:ring-2 focus:ring-[#2d67b8]"
        />

        {/* Image preview */}
        {image && (
          <div className="relative w-fit mt-4 mb-2">
            <img
              src={typeof image === "string" ? image : URL.createObjectURL(image)}
              className="w-40 h-40 object-cover rounded-xl border border-[#23385c]/40"
            />
            <button
              className="absolute -top-2 -right-2 bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center"
              onClick={() => {
                setImage(null);
                setFile(null);
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Replace Image */}
        <label className="flex items-center gap-2 text-gray-200 bg-[#0f2038] border border-[#23385c] px-3 py-2 mt-3 rounded-lg cursor-pointer hover:bg-[#142c4d] transition">
          <Camera size={18} />
          Replace Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files[0]) {
                setFile(e.target.files[0]);
                setImage(URL.createObjectURL(e.target.files[0]));
              }
            }}
          />
        </label>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#132235] text-gray-300 rounded-lg hover:bg-[#1c2f49]"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                text,
                tags,
                newImageFile: file,
                removeImage: !image,
              })
            }
            className="px-5 py-2 bg-[#2d67b8] text-white rounded-lg hover:bg-[#234f87]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

//
// ===============================
// Report Modal
// ===============================
function ReportModal({ open, onClose, onSubmit }) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0c1624] border border-[#23385c] rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-3">Report Post</h3>

        <textarea
          className="w-full bg-[#081625] border border-[#17314d] rounded-md px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-[#2d67b8]"
          rows={3}
          placeholder="Describe the issue"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm rounded bg-[#132235] text-gray-300 hover:bg-[#1c2f49]"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onSubmit(reason);
              onClose();
            }}
            className="px-3 py-1 text-sm rounded bg-[#2d67b8] text-white hover:bg-[#244f8e]"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

//
// ===============================
// Avatar Component
// ===============================
const Avatar = ({ src, size = 9 }) =>
  src ? (
    <img
      src={src}
      className={`w-${size} h-${size} rounded-full object-cover border border-[#23385c]`}
      onError={(e) => (e.currentTarget.src = "/fallback-avatar.png")}
    />
  ) : (
    <div
      className={`w-${size} h-${size} rounded-full bg-[#16223a] text-gray-300 flex items-center justify-center border border-[#23385c]`}
    >
      <ImageIcon size={18} />
    </div>
  );

//
// ===============================
// TAG
// ===============================
const Tag = ({ children }) => (
  <span className="text-xs px-2 py-0.5 rounded-full bg-[#0f1b2d] text-[#9fc1ff] border border-[#23385c]/40 mr-1">
    #{children}
  </span>
);

//
// ===============================
// MAIN POST CARD
// ===============================
const PostCard = ({
  post,
  user,
  liked,
  saved,
  onLike,
  onSave,
  onShare,
  onToggleComments,
  onAddComment,
  onDeleteComment,
  showComments,
  commentState,
  onEdit,
  onDelete,
  onReport,
  openImage,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isAuthor = user && post.author === user.id;

  return (
    <>
      <article className="bg-[#081224] border border-[#17314d] rounded-xl p-5 shadow-md hover:shadow-lg duration-300">

        {/* HEADER */}
        <div className="flex items-center gap-3">
          <Avatar src={post.user?.avatar} size={9} />

          <div className="flex-1">
            <div className="text-sm font-semibold text-[#cbe0ff]">
              {post.user?.username}
            </div>
            <div className="text-xs text-gray-400">
              {formatDate(post.createdAt)}
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              className="p-1.5 rounded-full text-gray-300 hover:bg-[#1a2847]"
              onClick={() => setMenuOpen((p) => !p)}
            >
              <MoreHorizontal size={18} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-[#0d1a2b] border border-[#23385c] rounded-md shadow-xl z-20 overflow-hidden animate-fadeIn">

                {isAuthor && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setEditOpen(true);
                    }}
                    className="w-full px-4 py-2 flex gap-2 text-left text-gray-200 hover:bg-[#15253c]"
                  >
                    <Pencil size={15} /> Edit
                  </button>
                )}

                {isAuthor && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete?.();
                    }}
                    className="w-full px-4 py-2 flex gap-2 text-left text-red-400 hover:bg-[#15253c]"
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                )}

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setShowReportModal(true);
                  }}
                  className="w-full px-4 py-2 flex gap-2 text-left text-gray-200 hover:bg-[#15253c]"
                >
                  <Flag size={15} /> Report
                </button>
              </div>
            )}
          </div>
        </div>

        {/* TEXT */}
        {post.text && (
          <p className="text-sm text-gray-200 mt-3 leading-relaxed whitespace-pre-wrap">
            {expanded ? post.text : post.text.slice(0, 240)}
            {post.text.length > 240 && (
              <button
                className="ml-2 text-xs text-[#7fb1ff] underline"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </p>
        )}

        {/* IMAGE */}
        {post.image && (
          <img
            src={post.image}
            onClick={() => openImage(post.image)}
            className="mt-3 rounded-lg border border-[#23385c]/30 cursor-pointer hover:opacity-90 max-h-96 object-cover"
          />
        )}

        {/* TAGS */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap mt-3">
            {post.tags.map((t, i) => (
              <Tag key={i}>{t}</Tag>
            ))}
          </div>
        )}

        {/* ACTION BAR */}
        <div className="flex items-center gap-6 text-sm text-[#9fc1ff] mt-4 border-t border-[#17314d] pt-3">

          {/* Like */}
          <button
            onClick={() => onLike(post._id, liked)}
            className="flex items-center gap-1 hover:text-white"
          >
            {liked ? (
              <Heart className="text-pink-500 fill-pink-500" size={18} />
            ) : (
              <Heart size={18} />
            )}
            {post.likes?.length}
          </button>

          {/* Comments */}
          <button
            onClick={() => onToggleComments(post._id)}
            className="flex items-center gap-1 hover:text-white"
          >
            <MessageCircle size={18} /> {post.comments?.length}
          </button>

          {/* Share */}
          <button onClick={() => onShare(post)} className="hover:text-white">
            <Share2 size={18} />
          </button>

          {/* Save */}
          <button onClick={() => onSave(post._id)} className="ml-auto hover:text-white">
            {saved ? <BookmarkCheck className="text-blue-400" size={18} /> : <Bookmark size={18} />}
          </button>
        </div>

        {/* COMMENTS SECTION */}
{showComments && (
  <div className="mt-4 bg-[#0a1624] border border-[#1f2d45] rounded-xl p-4">
    <div className="text-sm text-[#9fc1ff] font-semibold mb-3">
      Comments
    </div>

    {/* Comment List */}
    <div className="max-h-48 overflow-y-auto custom-scroll space-y-3 pr-1">
      {post.comments.length > 0 ? (
        post.comments.map((c) => (
          <div
            key={c._id}
            className="flex items-start gap-3 bg-[#0e1b2f] border border-[#223757]/40 rounded-lg p-3"
          >
            <div className="flex-1">
              <div className="text-xs font-semibold text-[#b9d9ff]">
                {c.userInfo?.username}
              </div>

              <div className="text-sm text-gray-200 mt-1 whitespace-pre-wrap">
                {c.text}
              </div>
            </div>

            {(c.user === user?.id || post.author === user?.id) && (
              <button
                className="text-red-400 hover:text-red-300 p-1 rounded-md bg-[#1a273d]/50 hover:bg-[#243757]/60 transition"
                onClick={() => onDeleteComment(c._id)}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))
      ) : (
        <div className="text-xs text-gray-400">No comments yet.</div>
      )}
    </div>

    {/* Add Comment */}
    <div className="flex items-center gap-2 mt-4">
      <input
        className="flex-1 bg-[#0d1a2b] text-gray-100 border border-[#1c2f4d] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2d67b8]"
        value={commentState.value}
        onChange={(e) => commentState.set(e.target.value)}
        placeholder="Write a comment..."
        onKeyDown={(e) => e.key === 'Enter' && onAddComment()}
      />

      <button
        onClick={onAddComment}
        className="px-4 py-2 bg-[#2d67b8] text-white rounded-lg text-sm hover:bg-[#224d8a] transition"
      >
        {commentState.loading ? "…" : "Post"}
      </button>
    </div>
  </div>
)}


        {/* Modals */}
        <ReportModal
          open={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={(reason) => onReport(reason)}
        />
      </article>

      {/* EDIT MODAL */}
      <EditPostModal
        open={editOpen}
        post={post}
        onClose={() => setEditOpen(false)}
        onSave={(data) => {
          onEdit(post._id, data);
          setEditOpen(false);
        }}
      />
    </>
  );
};

export default PostCard;
