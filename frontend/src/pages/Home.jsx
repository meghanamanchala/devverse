// Home.jsx
// Hero section for DevVerse Home Page
import React from "react";
import { CodeXml } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <section className="relative flex flex-col items-center justify-center h-screen w-full bg-gradient-to-br from-[#0a0f1c] via-[#0b1628] to-[#0d1b33] text-white overflow-hidden">

      <div className="relative z-10 text-center px-6">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-br from-[#2959a6] to-[#1e3c72] p-3 rounded-xl shadow-lg">
            <CodeXml size={48} className="text-white" />
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
          Welcome to <span className="text-[#3b5b9a]">DevVerse</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg md:text-xl mb-8">
          A community where developers connect, collaborate, and share their coding journeys.
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-[#1b2a49] hover:bg-[#23385c] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-md">
            Join the Community
          </button>
          <button
            className="bg-transparent border border-[#3b5b9a] hover:bg-[#1b2a49] text-[#3b5b9a] hover:text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            onClick={() => navigate("/posts")}
          >
            Explore Posts
          </button>
        </div>
      </div>

      {/* Bottom subtle line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#3b5b9a]/50 to-transparent"></div>
    </section>
  );
};

export default Home;