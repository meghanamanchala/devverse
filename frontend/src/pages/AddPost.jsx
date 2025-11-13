import React, { useState } from "react";
import { Camera } from "lucide-react";
import api from "../app/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const AddPost = () => {
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearForm = () => {
    setText("");
    setTags("");
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("text", text);
      formData.append("tags", tags);
      if (image) formData.append("image", image);

      const token = await getToken();
      console.log("🔑 Clerk token:", token);
      console.log("✅ FormData Contents:");
      for (let entry of formData.entries()) {
        console.log(entry[0], entry[1]);
      }

      await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      clearForm();
      navigate("/posts");
    } catch (err) {
      console.error("💥 ERROR WHILE POSTING:", err);
      alert("Failed to create post");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[70vh] w-full bg-gradient-to-br from-[#0a0f1c] via-[#0b1628] to-[#0d1b33] text-white py-12">
      <div className="relative z-10 w-full max-w-3xl px-6">
        <div className="mb-6 px-2">
          <h2 className="text-2xl font-bold">Create a Post</h2>
          <p className="text-gray-400 text-sm">Share something with the DevVerse community</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#121622] border border-[#1e2a3b] rounded-2xl shadow-md p-6 flex flex-col gap-4">
          <textarea
            className="bg-[#0f1722] text-gray-100 rounded-lg p-4 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-[#3b5b9a] placeholder-gray-400 border border-[#3b5b9a]/30"
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />

          <input
            className="bg-[#0f1722] text-gray-100 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#3b5b9a] placeholder-gray-400 border border-[#3b5b9a]/30"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="cursor-pointer flex items-center gap-2 text-gray-300 hover:text-white bg-[#0f1722] px-3 py-2 rounded-md border border-transparent hover:border-[#2b466f] transition-colors">
                <Camera size={18} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                <span className="text-sm">Add Image</span>
              </label>

              <button
                type="button"
                onClick={clearForm}
                className="text-sm px-3 py-2 rounded-md bg-transparent border border-[#2b3a50] hover:bg-[#1b2a49] transition-colors"
              >
                Clear
              </button>
            </div>

            <div>
              {imagePreview ? (
                <div className="flex items-center gap-3">
                  <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-md border border-[#3b5b9a]/30" />
                  <div className="text-xs text-gray-300">{image?.name}</div>
                </div>
              ) : (
                <div className="text-xs text-gray-500">No image selected</div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={clearForm}
              className="bg-transparent border border-[#2b3a50] hover:bg-[#1b2a49] px-5 py-2 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={uploading}
              className={`bg-gradient-to-br from-[#2959a6] to-[#1e3c72] hover:from-[#234f87] hover:to-[#19345a] text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200 shadow-md ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {uploading ? "Uploading..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AddPost;
