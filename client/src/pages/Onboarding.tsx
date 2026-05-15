import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createWorkspace } from "../lib/api";
import { useWorkspaceStore } from "../stores/workspaceStore";
import HostCallButton from "../components/HostCallButton";

export default function Onboarding() {
  const navigate = useNavigate();
  const addWorkspace = useWorkspaceStore((s) => s.addWorkspace);

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const workspace = await createWorkspace(name.trim());
      addWorkspace(workspace);
      navigate(`/w/${workspace.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f0f0f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <span
        style={{ fontSize: "1.5rem", fontWeight: 700, color: "#6366f1", marginBottom: "2.5rem" }}
      >
        huddle
      </span>

      <div
        style={{
          backgroundColor: "#1a1a1a",
          border: "1px solid #2e2e2e",
          borderRadius: "1rem",
          padding: "2.5rem",
          width: "100%",
          maxWidth: "28rem",
        }}
      >
        <h1
          style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", margin: "0 0 0.5rem" }}
        >
          Create your workspace
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.9375rem", margin: "0 0 2rem" }}>
          A workspace is where your teams and rooms live.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label
              htmlFor="wsName"
              style={{ fontSize: "0.875rem", fontWeight: 500, color: "#9ca3af" }}
            >
              Workspace name
            </label>
            <input
              id="wsName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
              required
              autoFocus
              disabled={loading}
              style={{
                backgroundColor: "#242424",
                border: "1px solid #2e2e2e",
                borderRadius: "0.5rem",
                color: "#fff",
                padding: "0.625rem 0.875rem",
                fontSize: "0.9375rem",
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLInputElement).style.borderColor = "#6366f1";
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLInputElement).style.borderColor = "#2e2e2e";
              }}
            />
          </div>

          {error && (
            <p style={{ color: "#f87171", fontSize: "0.875rem", margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            style={{
              backgroundColor: loading || !name.trim() ? "#3730a3" : "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.75rem",
              fontSize: "0.9375rem",
              fontWeight: 600,
              cursor: loading || !name.trim() ? "not-allowed" : "pointer",
              opacity: loading || !name.trim() ? 0.65 : 1,
              transition: "background-color 0.15s",
              marginTop: "0.5rem",
            }}
            onMouseEnter={(e) => {
              if (!loading && name.trim())
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4f46e5";
            }}
            onMouseLeave={(e) => {
              if (!loading && name.trim())
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#6366f1";
            }}
          >
            {loading ? "Creating…" : "Create workspace"}
          </button>
        </form>
      </div>

      {/* Quick-start: host a call without setting up a workspace */}
      <div style={{ width: "100%", maxWidth: "28rem", marginTop: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#2e2e2e" }} />
          <span style={{ color: "#4b5563", fontSize: "0.75rem" }}>or</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#2e2e2e" }} />
        </div>
        <HostCallButton />
      </div>

      <Link
        to="/dashboard"
        style={{ color: "#4b5563", fontSize: "0.875rem", marginTop: "1.25rem" }}
      >
        ← Back
      </Link>
    </div>
  );
}
