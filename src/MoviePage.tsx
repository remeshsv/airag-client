import React, { useState } from "react";

type Role = "ROLE_ADMIN" | "ROLE_USER" | "ROLE_DEVELOPER";

export default function MoviePage({ apiBase, token, role, onSignOut }: { apiBase?: string; token?: string | null; role: Role; onSignOut: () => void; }) {
  const API_BASE = apiBase ?? "http://localhost:8080";

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

  const handleUpload = async () => {
    setUploadMessage("");
    if (!file) {
      setUploadMessage("Please choose a PDF file first.");
      return;
    }
    const form = new FormData();
    form.append("file", file);

    try {
      setUploadLoading(true);
      const headers: Record<string,string> = {};
      const t = token ?? localStorage.getItem("token");
      if (t) headers["Authorization"] = `Bearer ${t}`;

      const res = await fetch(`${API_BASE}/api/rag/upload`, {
        method: "POST",
        headers,
        body: form,
      });
      const text = await res.text();
      if (!res.ok) {
        setUploadMessage(`Upload failed: ${text || res.statusText}`);
      } else {
        setUploadMessage(text || "PDF ingested successfully!");
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
    const t = token ?? localStorage.getItem("token");
    if (!t) return;
    if (!q) {
      setError("Please enter a question.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat/ask?question=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
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
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo} aria-hidden>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="4" width="20" height="16" rx="2" stroke="#cbd5e1" strokeWidth="1.2"/>
              <path d="M7 8v8" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M12 8v8" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M17 8v8" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={styles.headerTitle}>Remesh's Super-Duper Movie Encyclopedia(AI and RAG powered)</div>
        </div>

        <nav style={styles.nav} aria-label="Main navigation">
          <div style={styles.roleBadge} aria-hidden>{role}</div>
          <a href="#" style={styles.navLink}>Docs</a>
          <a href="#" style={styles.navLink}>Help</a>
          <button onClick={onSignOut} style={{ ...styles.navLink, background: "transparent", border: "none", cursor: "pointer" }}>
            Sign out
          </button>
        </nav>
      </header>

      <section style={styles.leftPane}>        

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
      </section>

      
        {/* Film strip divider */}
        <div
            style={{
            width: 36,
            background: "#1f2328",
            borderLeft: "2px solid #30363d",
            borderRight: "2px solid #30363d",
            position: "relative",
            }}
        >
            {/* Perforations */}
            {Array.from({ length: 12 }).map((_, i) => (
            <div
                key={i}
                style={{
                width: 16,
                height: 10,
                background: "#0d1117",
                border: "1px solid #30363d",
                borderRadius: 2,
                position: "absolute",
                left: 10,
                top: 10 + i * 48, // adjust spacing based on viewport height
                }}
            />
            ))}
        </div>


      <aside style={styles.rightPane}>
        {role === "ROLE_ADMIN" && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Add a PDF about Movies</h2>
            <p style={styles.cardSubtle}>
              Click here to upload a PDF to ingest into your RAG vector store.
            </p>

            <div style={{ marginTop: "0.75rem" }}>
                
                <label
                    style={{
                    display: "inline-block",
                    padding: "12px 16px",
                    border: "2px dashed #58a6ff", // ✅ Dashed border for clarity
                    borderRadius: "8px",
                    cursor: "pointer",
                    color: "#58a6ff",
                    fontWeight: "bold",
                    textAlign: "center",
                    width: "100%", // ✅ Full width for visibility
                    background: "#0d1117",
                    transition: "background 0.3s ease"
                    }}
                >                
                {file ? `Selected file: ${file.name}` : "Click to select a PDF file"}
              <input
                type="file"
                name="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                style={{ display: "none" }}
              />
              </label>
            </div>

            <div style={{ marginTop: "0.75rem" }}>
              <button
                style={styles.primaryBtn}
                onClick={handleUpload}
                disabled={uploadLoading}
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
        )}

        {/* Film strip divider horizontal*/}
        <div
            style={{
            height: 24,
            background: "#1f2328",
            borderTop: "2px solid #30363d",
            borderBottom: "2px solid #30363d",
            position: "relative",          
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            padding: "0 10px"
            }}
        >
            {/* Perforations */}
            {Array.from({ length: 12 }).map((_, i) => (
            <div
                key={i}
                style={{
                width: 10,
                height: 12,
                background: "#0d1117",
                border: "1px solid #30363d",
                borderRadius: 2,
                }}
            />
            ))}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Gemini-powered Chat</h2>
          <h5 style={styles.cardSubtle}>(Ask Anything)</h5>
          <p style={styles.cardSubtle}>
          <textarea
            style={{ ...styles.textarea, minHeight: 80, marginTop: 0 }}
            placeholder="Type your question..."
            value={questionChat}
            onChange={(e) => setQuestionChat(e.target.value)}
          />
          <button
            onClick={handleAskChat}
            disabled={loading}
            style={{ ...styles.primaryBtn, marginTop: "0.75rem", width: "100%" }}
          >
            {loading ? "Thinking..." : "Ask"}
          </button>
          <div style={{ marginTop: "0.75rem", padding: "0.75rem", borderRadius: 6, border: "1px solid #30363d", background: "#0b87c4", minHeight: 100 }}>
            {answerChat || "Your answer will appear here."}
          </div>
          </p>
        </div>
      </aside>
    </div>
  );
}

// ---- lightweight styles (copied from App) ----
const styles = {
  appShell: {
    display: "grid",
    gridTemplateColumns: "2fr auto 1fr",
    gridTemplateRows: "auto 1fr",
    minHeight: "100vh",
    width: "100vw",
    background: "#0b0d12",
    color: "#e6edf3",
  } as React.CSSProperties,
  leftPane: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    padding: "1rem",
    overflow: "auto",
    borderRight: "1px solid #22272e",
  } as React.CSSProperties,
  header: {
    gridColumn: "1 / -1",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 1.25rem",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    background: "linear-gradient(180deg, rgba(11,13,18,0.95), rgba(11,13,18,0.9))",
  } as React.CSSProperties,
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  } as React.CSSProperties,
  logo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,
  headerTitle: {
    color: "#e6edf3",
    fontSize: "1.25rem",
    fontWeight: 700,
  } as React.CSSProperties,
  nav: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
  } as React.CSSProperties,
  navLink: {
    color: "#9fb0c8",
    textDecoration: "none",
    fontSize: "0.95rem",
    padding: "0.35rem 0.5rem",
    borderRadius: 6,
  } as React.CSSProperties,
  roleBadge: {
    background: "rgba(255,255,255,0.03)",
    color: "#cbd5e1",
    padding: "0.25rem 0.5rem",
    borderRadius: 6,
    fontSize: "0.9rem",
    border: "1px solid rgba(255,255,255,0.04)",
  } as React.CSSProperties,
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(2,6,23,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 60,
  } as React.CSSProperties,
  modalBox: {
    background: "#0d1117",
    border: "1px solid #30363d",
    padding: "1rem",
    borderRadius: 8,
    width: 360,
    boxShadow: "0 10px 30px rgba(2,6,23,0.6)",
  } as React.CSSProperties,
  formInput: {
    width: "100%",
    padding: "0.5rem",
    borderRadius: 6,
    border: "1px solid #30363d",
    background: "#07080a",
    color: "#e6edf3",
  } as React.CSSProperties,
  modalBtnPrimary: {
    background: "#238636",
    border: "1px solid #2ea043",
    color: "white",
    borderRadius: 6,
    padding: "0.5rem 0.75rem",
    cursor: "pointer",
  } as React.CSSProperties,
  modalBtnSecondary: {
    background: "transparent",
    border: "1px solid #444c56",
    color: "#c9d1d9",
    borderRadius: 6,
    padding: "0.5rem 0.75rem",
    cursor: "pointer",
  } as React.CSSProperties,
  rightPane: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    padding: "1rem",
    overflow: "auto",
    borderLeft: "1px solid #22272e", // divider between panes
  },
  card: {
    background: "#0d1117",
    border: "1px solid #30363d",
    borderRadius: 8,
    padding: "1rem",
    boxShadow: "0 0 0 1px rgba(1,4,9,0.1) inset",
  } as React.CSSProperties,
  cardTitle: { margin: 0, fontSize: "1.5rem", marginBottom: "1rem", textAlign: "center", fontWeight: 600 } as React.CSSProperties,
  cardSubtle: { marginTop: "0.25rem", color: "#8b949e", textAlign: "center" } as React.CSSProperties,
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
