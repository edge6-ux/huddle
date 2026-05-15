import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getInviteInfo, acceptInvite } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

interface InviteInfo {
  teamId: string;
  teamName: string;
  workspaceName: string;
  workspaceSlug: string;
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getInviteInfo(token)
      .then(setInfo)
      .catch((err) => setFetchError(err.message ?? "Invite not found"));
  }, [token]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated && token) {
      navigate(`/login?redirect=/invite/${token}`, { replace: true });
    }
  }, [authLoading, isAuthenticated, token, navigate]);

  async function handleAccept() {
    if (!token) return;
    setAccepting(true);
    setAcceptError(null);
    try {
      const result = await acceptInvite(token);
      navigate(`/w/${result.workspaceSlug}/teams/${result.teamId}`);
    } catch (err) {
      setAcceptError(err instanceof Error ? err.message : "Failed to accept invite");
      setAccepting(false);
    }
  }

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0f0f0f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
        }}
      >
        Loading…
      </div>
    );
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
          maxWidth: "26rem",
          textAlign: "center",
        }}
      >
        {fetchError ? (
          <>
            <p style={{ color: "#f87171", fontSize: "0.9375rem", marginBottom: "1.5rem" }}>
              {fetchError}
            </p>
            <button
              onClick={() => navigate("/")}
              style={{
                background: "none",
                border: "none",
                color: "#6366f1",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              ← Back to home
            </button>
          </>
        ) : !info ? (
          <p style={{ color: "#6b7280" }}>Checking invite…</p>
        ) : (
          <>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                backgroundColor: "#6366f1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#fff",
                margin: "0 auto 1.25rem",
              }}
            >
              {info.workspaceName[0].toUpperCase()}
            </div>

            <h1
              style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", margin: "0 0 0.5rem" }}
            >
              You&apos;ve been invited
            </h1>
            <p style={{ color: "#9ca3af", fontSize: "0.9375rem", margin: "0 0 0.375rem" }}>
              to join{" "}
              <span style={{ color: "#e5e7eb", fontWeight: 500 }}>{info.teamName}</span>
            </p>
            <p style={{ color: "#6b7280", fontSize: "0.8125rem", margin: "0 0 2rem" }}>
              {info.workspaceName}
            </p>

            {acceptError && (
              <p style={{ color: "#f87171", fontSize: "0.875rem", marginBottom: "1rem" }}>
                {acceptError}
              </p>
            )}

            <button
              onClick={handleAccept}
              disabled={accepting}
              style={{
                width: "100%",
                backgroundColor: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.75rem",
                fontSize: "0.9375rem",
                fontWeight: 600,
                cursor: accepting ? "not-allowed" : "pointer",
                opacity: accepting ? 0.65 : 1,
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!accepting)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4f46e5";
              }}
              onMouseLeave={(e) => {
                if (!accepting)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#6366f1";
              }}
            >
              {accepting ? "Joining…" : "Accept invite"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
