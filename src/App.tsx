
import React, { useState } from "react";

// Optional: set your API base via env var for dev/prod flexibility
// Vite: import.meta.env.VITE_API_BASE_URL
// CRA/Next: process.env.REACT_APP_API_BASE_URL or process.env.NEXT_PUBLIC_API_BASE_URL
const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE_URL ??
  "http://localhost:8080"; // fallback

function ExistingApp() {
  // 👉 Replace the JSX below with your CURRENT APP CONTENT
  // (whatever you already have in App.tsx today).
  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ marginBottom: "0.5rem" }}>Existing App</h2>
      <p>
        Paste your current App.tsx JSX here. This will render on the left side
        exactly as before.
      </p>
    </div>
  );
}

export default function App() {
  // ---- Upload state ----
  const [file, setFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);

  // ---- Ask state ----
  const [questionRag, setQuestionRag] = useState<string>("");
  const [answerRag, setAnswerRag] = useState<string>("");
  const [askLoading, setAskLoading] = useState<boolean>(false);

  const [questionChat, setQuestionChat] = useState("");
  const [answerChat, setAnswerChat] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---- Handlers ----
  const handleUpload = async () => {
    setUploadMessage("");
    if (!file) {
      setUploadMessage("Please choose a PDF file first.");
      return;
    }
    const form = new FormData();
    form.append("file", file); // <-- must match backend @RequestPart/@RequestParam name

    try {
      setUploadLoading(true);
      const res = await fetch(`${API_BASE}/api/rag/upload`, {
        method: "POST",
        body: form,
      });
      const text = await res.text();
      if (!res.ok) {
        setUploadMessage(`Upload failed: ${text || res.statusText}`);
      } else {
        setUploadMessage(text || "PDF ingested successfully!");
        // Clear selection after success
        setFile(null);
      }
    } catch (err: any) {
      setUploadMessage(`Upload error: ${err?.message ?? "Unknown error"}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAskChat = async () => {
    setError(""); 
    setAnswerChat("");
    const q = questionChat.trim();
    if (!q) {
      setError("Please enter a question.");
      return;
    }
    setLoading(true);
    try {
      // Call your Spring Boot endpoint
      const res = await fetch(`/api/chat/ask?question=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const text = await res.text();
      setAnswerChat(text);
    } catch (e) {
      setError("Could not fetch the answer. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleAskRag = async () => {
    setAnswerRag("");
    if (!questionRag.trim()) {
      setAnswerRag("Please enter a question.");
      return;
    }
    try {
      setAskLoading(true);
      const url = `${API_BASE}/api/rag/ask?q=${encodeURIComponent(questionRag)}`;
      const res = await fetch(url, { method: "GET" });
      const text = await res.text();
      if (!res.ok) {
        setAnswerRag(`Query failed: ${text || res.statusText}`);
      } else {
        setAnswerRag(text);
      }
    } catch (err: any) {
      setAnswerRag(`Query error: ${err?.message ?? "Unknown error"}`);
    } finally {
      setAskLoading(false);
    }
  };

  return (
    <div style={styles.appShell}>
      {/* LEFT: your current app */}
      <section style={styles.leftPane}>
        <div className="max-w-xl mx-auto mt-12 p-6 font-sans">
      <h1 className="text-3xl font-bold mb-4 text-center">Gemini-powered Chat</h1>
      <textarea
        rows={3}
        className="w-full p-3 border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type your question..."
        value={questionChat}
        onChange={(e) => setQuestionChat(e.target.value)}
      />
      <button

        onClick={handleAskChat}
        disabled={loading}
        className="mt-4 w-full bg-sky-300 text-white py-2 rounded-md hover:bg-sky-400 disabled:bg-gray-400"
      >
        {loading ? "Thinking..." : "Ask"}
      </button>
      <div className="mt-6 p-4 border rounded-md bg-sky-500 min-h-[100px]">
        {answerChat || "Your answer will appear here."}
      </div>
    </div>
      </section>

      {/* RIGHT: two blocks */}
      <aside style={styles.rightPane}>
        {/* Upload PDF block */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Add a PDF about Movies</h2>
          <p style={styles.cardSubtle}>
            Click here to upload a PDF to ingest into your RAG vector store.
          </p>

          <div style={{ marginTop: "0.75rem" }}>
            <input
              type="file"
              name="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div style={{ marginTop: "0.75rem" }}>
            <button
              style={styles.primaryBtn}
              onClick={handleUpload}
              disabled={uploadLoading || !file}
            >
              {uploadLoading ? "Uploading…" : "Upload"}
            </button>
          </div>

          {uploadMessage && (
            <div
              role="status"
              style={{
                marginTop: "0.75rem",
                color: uploadMessage.toLowerCase().includes("success")
                  ? "#116329"
                  : "#b12020",
              }}
            >
              {uploadMessage}
            </div>
          )}
        </div>

        {/* Ask block */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            Ask about movie making & cinema history
          </h2>
          <p style={styles.cardSubtle}>
            Questions are answered using your ingested knowledge base(vector-store).
          </p>

          <textarea
            placeholder="e.g., Who were the pioneers of montage editing, and how did it influence modern filmmaking?"
            value={questionRag}
            onChange={(e) => setQuestionRag(e.target.value)}
            style={styles.textarea}
          />

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              style={styles.primaryBtn}
              onClick={handleAskRag}
              disabled={askLoading}
            >
              {askLoading ? "Thinking…" : "Ask"}
            </button>
            <button
              style={styles.secondaryBtn}
              onClick={() => {
                setQuestionRag("");
                setAnswerRag("");
              }}
            >
              Clear
            </button>
          </div>

          {!!answerRag && (
            <div style={styles.answerBox}>
              <strong>Answer</strong>
              <div style={{ marginTop: "0.5rem", whiteSpace: "pre-wrap" }}>
                {answerRag}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

// ---- lightweight styles ----
const styles = {
  appShell: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr", // left / right
    minHeight: "100vh",
    background: "#0b0d12",
    color: "#e6edf3",
  } as React.CSSProperties,
  leftPane: {
    borderRight: "1px solid #22272e",
    overflow: "auto",
  } as React.CSSProperties,
  rightPane: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    padding: "1rem",
    overflow: "auto",
  },
  card: {
    background: "#0d1117",
    border: "1px solid #30363d",
    borderRadius: 8,
    padding: "1rem",
    boxShadow: "0 0 0 1px rgba(1,4,9,0.1) inset",
  } as React.CSSProperties,
  cardTitle: { margin: 0, fontSize: "1.25rem" } as React.CSSProperties,
  cardSubtle: { marginTop: "0.25rem", color: "#8b949e" } as React.CSSProperties,
  primaryBtn: {
    background: "#238636",
    border: "1px solid #2ea043",
    color: "white",
    borderRadius: 6,
    padding: "0.5rem 0.75rem",
    cursor: "pointer",
  } as React.CSSProperties,
  secondaryBtn: {
    background: "transparent",
    border: "1px solid #444c56",
    color: "#c9d1d9",
    borderRadius: 6,
    padding: "0.5rem 0.75rem",
    cursor: "pointer",
  } as React.CSSProperties,
  textarea: {
    width: "100%",
    minHeight: 120,
    margin: "0.75rem 0",
    padding: "0.5rem",
    borderRadius: 6,
    border: "1px solid #30363d",
    background: "#0b0d12",
    color: "#e6edf3",
    resize: "vertical" as const,
    fontFamily: "inherit",
  } as React.CSSProperties,
  answerBox: {
    marginTop: "0.75rem",
    padding: "0.75rem",
    borderRadius: 6,
    border: "1px solid #30363d",
    background: "#0b0d12",
  } as React.CSSProperties,
};

 