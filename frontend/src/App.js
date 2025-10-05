import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "https://resumerag-22xx.onrender.com";

export default function App() {
  const [resumes, setResumes] = useState([]);
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [matchResults, setMatchResults] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  async function fetchResumes() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/resumes`);
      const data = await res.json();
      setResumes(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function uploadResume(e) {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    await fetch(`${API_BASE}/upload`, { method: "POST", body: formData });
    setFile(null);
    await fetchResumes();
    setLoading(false);
  }

  async function deleteResume(filename) {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete/${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Resume deleted successfully!");
        fetchResumes();
      } else {
        alert("Failed to delete resume.");
      }
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Error deleting resume.");
    }
  }

  async function showResume(resume) {
    const res = await fetch(`${API_BASE}/resume/${encodeURIComponent(resume.filename)}`);
    const data = await res.json();
    setModalData(data);
  }

  async function matchJob(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("description", jobDescription);
    const res = await fetch(`${API_BASE}/match`, { method: "POST", body: formData });
    const data = await res.json();
    setMatchResults(data);
    setShowMatchModal(true);
    setLoading(false);
  }

  const filtered = resumes.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.h1
        className="text-4xl font-bold text-center mb-8 text-purple-700"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        Resume<span className="text-indigo-600">RAG</span> — Smart Matcher
      </motion.h1>

      {/* Upload */}
      <div className="bg-white shadow-xl rounded-2xl p-6 mb-8">
        <form onSubmit={uploadResume} className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0])}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-all"
          >
            {loading ? "Uploading..." : "Upload Resume"}
          </button>
        </form>
      </div>

      {/* Job Match */}
      <div className="bg-white shadow-xl rounded-2xl p-6 mb-8">
        <form onSubmit={matchJob} className="flex flex-col gap-4">
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job description here..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-400"
            rows="4"
          ></textarea>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Match Job
          </button>
        </form>
      </div>

      {/* Search */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search resumes by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full sm:w-2/3 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {/* Resume Cards */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400">No resumes found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((r, i) => (
            <motion.div
              key={i}
              className="p-5 bg-white rounded-xl shadow-lg hover:shadow-2xl transition relative"
              whileHover={{ scale: 1.03 }}
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-2">{r.name}</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => showResume(r)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  View
                </button>
                <button
                  onClick={() => deleteResume(r.filename)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Resume Modal */}
      <AnimatePresence>
        {modalData && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-2xl max-w-3xl max-h-[80vh] overflow-y-auto relative shadow-2xl"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                onClick={() => setModalData(null)}
              >
                ✖
              </button>
              <h2 className="text-xl font-bold mb-4">{modalData.name}</h2>
              <pre className="whitespace-pre-wrap text-gray-700">{modalData.content}</pre>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job Match Modal */}
      <AnimatePresence>
        {showMatchModal && matchResults && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-2xl max-w-3xl max-h-[80vh] overflow-y-auto relative shadow-2xl"
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
            >
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                onClick={() => setShowMatchModal(false)}
              >
                ✖
              </button>
              <h2 className="text-2xl font-bold text-purple-700 mb-4">
                Job Match Results
              </h2>
              <p className="mb-3 text-gray-700">
                <strong>Job Skills:</strong>{" "}
                {matchResults.job_skills.join(", ") || "No specific skills detected"}
              </p>

              {matchResults.matches.map((m, i) => (
                <div
                  key={i}
                  className="p-3 mb-3 border rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <p className="font-semibold">{m.filename}</p>
                  <p>Matched Skills: {m.matched_skills.join(", ") || "None"}</p>
                  <p className="text-sm text-gray-600">
                    Match Score: <span className="font-bold">{m.match_score}%</span>
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
