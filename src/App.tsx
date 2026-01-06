
import React, { useState, useEffect } from "react";

// Optional: set your API base via env var for dev/prod flexibility
// Vite: import.meta.env.VITE_API_BASE_URL
// CRA/Next: process.env.REACT_APP_API_BASE_URL or process.env.NEXT_PUBLIC_API_BASE_URL
const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE_URL ??
  "http://localhost:8080"; // fallback

export default function App() {
  type Role = "ROLE_ADMIN" | "ROLE_USER" | "ROLE_DEVELOPER";
  const [role, setRole] = useState<Role>("ROLE_USER");
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginUser, setLoginUser] = useState<string>("");
  const [loginPass, setLoginPass] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
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
      const headers: Record<string,string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

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
    const t = localStorage.getItem("token");
    if (!t) return;
    if (!q) {
      setError("Please enter a question.");
      return;
    }
    setLoading(true);
    try {
      // Call your Spring Boot endpoint
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

  // Restore token and role from localStorage on mount
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) return;
    (async () => {
      try {
        // Verify token and get role
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (!res.ok) {
          localStorage.removeItem("token");
          return;
        }
        const info = await res.json();
        // expected { username: '...', role: 'ADMIN' }
        if (info?.role) setRole(info.role as Role);
        setToken(t);
        setLoggedIn(true);
      } catch (err) {
        localStorage.removeItem("token");
      }
    })();
  }, []);

  // ---- Auth handlers (simple client-side demo) ----
  const handleLogin = () => {
    setLoginError("");
    if (!loginUser.trim() || !loginPass) {
      setLoginError("Please enter username and password.");
      return;
    }

    // Call backend auth endpoint
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: loginUser.trim(), password: loginPass }),
        });
        if (!res.ok) {
          const txt = await res.text();
          setLoginError(txt || `Login failed (${res.status})`);
          return;
        }
        const data = await res.json();
        // Expected response: { token: "..jwt..", role: "ADMIN" }
        if (data?.token) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
        }
        if (data?.role) setRole(data.role as Role);
        setLoggedIn(true);
        setShowLoginModal(false);
        setLoginPass("");
        setLoginError("");
      } catch (err: any) {
        setLoginError(err?.message ?? "Login error");
      }
    })();
  };


  return (
    <div style={styles.appShell}>
      {/* TOP: polished header / top nav */}
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
          <div style={styles.headerTitle}>AI-RAG Movie Data</div>
        </div>

        <nav style={styles.nav} aria-label="Main navigation">
          {loggedIn ? (
            <div style={styles.roleBadge} aria-hidden>{role}</div>
          ) : null}
          <a href="#" style={styles.navLink}>Docs</a>
          <a href="#" style={styles.navLink}>Help</a>
          {loggedIn ? (
            <button onClick={() => { setLoggedIn(false); setToken(null); localStorage.removeItem("token"); setRole("ROLE_USER"); }} style={{ ...styles.navLink, background: "transparent", border: "none", cursor: "pointer" }}>
              Sign out
            </button>
          ) : (
            <button onClick={() => { setShowLoginModal(true); }} style={{ ...styles.navLink, background: "transparent", border: "none", cursor: "pointer" }}>
              Sign in
            </button>
          )}
        </nav>
      </header>

      {/* LEFT: your current app */}
      <section style={styles.leftPane}>
        <div className="max-w-xl mx-auto mt-12 p-6 font-sans">
      <h1 className="text-3xl font-bold mb-4 text-center" style={{ fontSize: "2rem", marginBottom: "1rem", fontWeight: 600 }}>
        Gemini-powered Chat
      </h1>
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
        {/* Upload PDF block (only visible to ADMIN) */}
        {role === "ROLE_ADMIN" && (
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
        )}

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
      {/* Login modal */}
      {showLoginModal && (
        <div style={styles.modalOverlay} role="dialog" aria-modal="true">
          <div style={styles.modalBox}>
            <h3 style={{ marginTop: 0 }}>Sign in</h3>
            <div style={{ marginTop: "0.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.25rem" }}>Username</label>
              <input
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                style={styles.formInput}
                autoFocus
              />
            </div>
            <div style={{ marginTop: "0.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.25rem" }}>Password</label>
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                style={styles.formInput}
              />
            </div>
            {loginError && <div style={{ color: "#f87171", marginTop: "0.5rem" }}>{loginError}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
              <button onClick={() => setShowLoginModal(false)} style={styles.modalBtnSecondary}>Cancel</button>
              <button onClick={handleLogin} style={styles.modalBtnPrimary}>Sign in</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- lightweight styles ----
const styles = {
  appShell: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gridTemplateRows: "auto 1fr",
    minHeight: "100vh",
    background: "#0b0d12",
    color: "#e6edf3",
  } as React.CSSProperties,
  leftPane: {
    borderRight: "1px solid #22272e",
    overflow: "auto",
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
  roleSelect: {
    background: "transparent",
    color: "#cbd5e1",
    border: "1px solid rgba(255,255,255,0.04)",
    padding: "0.25rem 0.5rem",
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
  },
  card: {
    background: "#0d1117",
    border: "1px solid #30363d",
    borderRadius: 8,
    padding: "1rem",
    boxShadow: "0 0 0 1px rgba(1,4,9,0.1) inset",
  } as React.CSSProperties,
  cardTitle: { margin: 0, fontSize: "1.25rem", textAlign: "center" } as React.CSSProperties,
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

 