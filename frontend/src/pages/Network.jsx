// Network.jsx
import React, { useEffect, useState, useMemo } from "react";
import api from "../app/api";
import { FaSearch } from "react-icons/fa";
import { useUser, useAuth } from "@clerk/clerk-react";
import { UserRound } from "lucide-react";

export default function Network() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [processing, setProcessing] = useState({});
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      const fetchUsers = async () => {
        setLoading(true);
        try {
          const q =
            search.trim() === "" ? "." : encodeURIComponent(search.trim());
          const res = await api.get(`/users/search?q=${q}`);
          setUsers(Array.isArray(res.data.users) ? res.data.users : []);
        } catch (err) {
          setUsers([]);
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    }, 350);

    return () => clearTimeout(t);
  }, [search]);

  // Fetch current user with Authorization
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLoaded || !isSignedIn) return;
      try {
        const token = await getToken();
        if (!token) {
          setCurrentUser(null);
          return;
        }
        const res = await api.get("/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(res.data.user || null);
      } catch (err) {
        setCurrentUser(null);
        console.error("Profile fetch error:", err);
      }
    };
    fetchProfile();
  }, [isLoaded, isSignedIn, getToken]);

  const handleFollow = async (userId) => {
    if (!currentUser) return;
    setProcessing((p) => ({ ...p, [userId]: true }));
    setCurrentUser((u) => ({
      ...u,
      following: [...(u?.following || []), userId],
    }));
    try {
      const token = await getToken();
      await api.post(
        `/users/${userId}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      setCurrentUser((u) => ({
        ...u,
        following: (u?.following || []).filter((id) => id !== userId),
      }));
    } finally {
      setProcessing((p) => ({ ...p, [userId]: false }));
    }
  };

  const handleUnfollow = async (userId) => {
    if (!currentUser) return;
    setProcessing((p) => ({ ...p, [userId]: true }));
    setCurrentUser((u) => ({
      ...u,
      following: (u?.following || []).filter((id) => id !== userId),
    }));
    try {
      const token = await getToken();
      await api.post(
        `/users/${userId}/unfollow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      setCurrentUser((u) => ({
        ...u,
        following: [...(u?.following || []), userId],
      }));
    } finally {
      setProcessing((p) => ({ ...p, [userId]: false }));
    }
  };

  const isFollowing = (id) =>
    Boolean(
      currentUser &&
        Array.isArray(currentUser.following) &&
        currentUser.following.includes(id)
    );

  const skeletonArray = useMemo(() => new Array(8).fill(0), []);

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-[#07101a] via-[#061328] to-[#071428] text-white pb-20">
      {/* inner container – same idea as Home.jsx, with extra left padding on large screens so it's not under the sidebar */}
      <div className="max-w-4xl mx-auto px-4 pt-10 lg:pl-20">
        {/* ===== Header + Search card (matching Home hero style) ===== */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-[#071428] to-[#0b2136] border border-[#1e3a5e]/40 shadow-lg mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#2f68b6] to-[#1b3a78]">
                <UserRound className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold">
                  Your <span className="text-[#9fc1ff]">Network</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 mt-1">
                  Discover developers to follow and collaborate with on DevVerse.
                </p>
              </div>
            </div>
          </div>

          {/* Search input */}
          <div className="w-full">
            <label htmlFor="network-search" className="sr-only">
              Search users or skills
            </label>
            <div className="relative">
              <input
                id="network-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users, skills or handles..."
                className="
                  w-full
                  pl-10 pr-4 py-2.5 
                  rounded-xl 
                  bg-[#0e1c2f]/60 
                  border border-[#1d3557]/60
                  text-sm text-gray-100
                  placeholder:text-gray-500
                  focus:outline-none
                  focus:border-[#2f6ccb]
                  focus:ring-2
                  focus:ring-[#2f6ccb]/40
                  shadow-sm
                "
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
                <FaSearch />
              </div>
            </div>
          </div>
        </div>

        {/* ===== Content ===== */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {skeletonArray.map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-[#0b1628]/80 border border-[#1d3557]/40 p-5 animate-pulse flex flex-col gap-4"
              >
                <div className="w-14 h-14 rounded-full bg-[#111827] mx-auto" />
                <div className="h-4 bg-[#111827] rounded w-3/4 mx-auto" />
                <div className="h-3 bg-[#111827] rounded w-1/2 mx-auto" />
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  <div className="h-6 w-16 bg-[#111827] rounded-full" />
                  <div className="h-6 w-12 bg-[#111827] rounded-full" />
                </div>
                <div className="h-8 bg-[#111827] rounded-full mt-3" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="mt-4 text-gray-400 text-sm">
            No users found. Try a different search term.
          </div>
        ) : (
          <section className="mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {users
                .filter(
                  (u) => currentUser && u._id !== currentUser._id
                )
                .map((u) => (
                  <article
                    key={u._id}
                    className="
                      bg-[#0b1628]/80
                      border border-[#1d3557]/60
                      rounded-2xl
                      shadow-lg shadow-black/30
                      p-5
                      flex flex-col items-center text-center
                      hover:border-[#2f6ccb]/70
                      hover:shadow-[#0e1a33]/60
                      transition
                    "
                  >
                    {/* Avatar */}
                    <div className="mb-4 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
                        <UserRound className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    {/* Name + handle */}
                    <h2 className="font-semibold text-base sm:text-lg">
                      {u.name || u.username}
                    </h2>
                    <p className="text-xs text-indigo-200 mb-2">@{u.username}</p>

                    {/* Bio */}
                    {u.bio && (
                      <p className="text-xs text-[#b3cfff] mb-3 line-clamp-2">
                        {u.bio}
                      </p>
                    )}

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 justify-center mb-4 min-h-[1.5rem]">
                      {(u.skills || []).length > 0 ? (
                        u.skills.map((skill) => (
                          <span
                            key={skill}
                            className="bg-[#111827]/80 border border-[#1e40af]/70 text-[#9fc1ff] rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-[#9fc1ff]">
                          No skills listed
                        </span>
                      )}
                    </div>

                    {/* Follow / Unfollow button */}
                    {currentUser && (
                      <button
                        onClick={() =>
                          isFollowing(u._id)
                            ? handleUnfollow(u._id)
                            : handleFollow(u._id)
                        }
                        disabled={processing?.[u._id]}
                        aria-pressed={isFollowing(u._id)}
                        className={`
                          mt-auto w-full
                          rounded-full px-4 py-2
                          text-xs font-semibold
                          shadow-md
                          transition
                          ${
                            isFollowing(u._id)
                              ? "bg-white text-[#1e3a8a] hover:bg-zinc-100"
                              : "bg-[#9fc1ff] text-[#111827] hover:bg-[#bfd4ff]"
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        {processing?.[u._id]
                          ? "Processing..."
                          : isFollowing(u._id)
                          ? "Following"
                          : "Follow"}
                      </button>
                    )}
                  </article>
                ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
