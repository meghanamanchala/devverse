import React, { useEffect, useState } from "react";
import api from "../app/api";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
    const res = await api.get("/posts");
    setPosts(Array.isArray(res.data.posts) ? res.data.posts : []);
      } catch (err) {
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">All Posts</h1>
      {loading && <div className="text-gray-400">Loading...</div>}
      {error && <div className="text-red-400">{error}</div>}
      {!loading && !error && posts.length === 0 && (
        <div className="text-gray-500">No posts yet.</div>
      )}
      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post._id}
            className="bg-[#181f2e] border border-[#3b5b9a]/20 rounded-xl p-5 shadow-sm"
          >
            <div className="mb-2 text-gray-200 whitespace-pre-line">{post.text}</div>
            {post.image && (
              <img
                src={post.image}
                alt="Post"
                className="w-full max-w-xs rounded-md border border-[#3b5b9a]/30 mb-2"
              />
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-[#23385c] text-xs text-[#b3cdf6] px-2 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-2">
              Posted {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Posts;
