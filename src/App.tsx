import React, { useState, useEffect } from "react";
import MoviePage from "./MoviePage.tsx";

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
  const [loginUser, setLoginUser] = useState<string>("");
  const [loginPass, setLoginPass] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");

  // Restore token and role from localStorage on mount
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (!res.ok) {
          localStorage.removeItem("token");
          return;
        }
        const info = await res.json();
        if (info?.role) setRole(info.role as Role);
        setToken(t);
        setLoggedIn(true);
      } catch (err) {
        localStorage.removeItem("token");
      }
    })();
  }, []);

  const handleLogin = () => {
    setLoginError("");
    if (!loginUser.trim() || !loginPass) {
      setLoginError("Please enter username and password.");
      return;
    }

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
        if (data?.token) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
        }
        if (data?.role) setRole(data.role as Role);
        setLoggedIn(true);
        setLoginPass("");
        setLoginError("");
      } catch (err: any) {
        setLoginError(err?.message ?? "Login error");
      }
    })();
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setToken(null);
    setLoggedIn(false);
    setRole("ROLE_USER");
  };

  if (!loggedIn) {
    // Simple login-only page
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", width: "100vw", margin: 0, padding: 0, background: "#07080a", color: "#e6edf3" }}>
        
        <h1 style={{ marginBottom: 74, fontSize: 32, color: "#58a6ff", fontWeight: "bold" }}>
            Remesh's Super-Duper Movie Encyclopedia
        </h1>
        <div style={{ width: 380, padding: 20, borderRadius: 8, background: "#0d1117", border: "1px solid #30363d" }}>
          <h2 style={{ marginTop: 0, marginBottom: 12 }}>Sign in</h2>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", marginBottom: 6 }}>Username</label>
            <input value={loginUser} onChange={(e) => setLoginUser(e.target.value)} style={styles.formInput} autoFocus />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", marginBottom: 6 }}>Password</label>
            <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} style={styles.formInput} />
          </div>
          {loginError && <div style={{ color: "#f87171", marginBottom: 8 }}>{loginError}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button onClick={handleLogin} style={styles.modalBtnPrimary}>Sign in</button>
          </div>
        </div>
      </div>
    );
  }

  return <MoviePage apiBase={API_BASE} token={token} role={role} onSignOut={handleSignOut} />;
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
    // divider moved to right pane for a single clear border
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
    borderLeft: "1px solid #22272e",
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

