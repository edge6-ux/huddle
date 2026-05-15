import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createInstantRoom } from "../lib/api";

export default function HostCallButton() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roomSlug, setRoomSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleHost() {
    setLoading(true);
    try {
      const room = await createInstantRoom();
      setRoomSlug(room.slug);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!roomSlug) return;
    const url = `${window.location.origin}/join?room=${roomSlug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleJoin() {
    if (!roomSlug) return;
    navigate(`/join?room=${roomSlug}`);
  }

  function handleClose() {
    setRoomSlug(null);
    setCopied(false);
  }

  // Invite link ready state
  if (roomSlug) {
    const inviteUrl = `${window.location.origin}/join?room=${roomSlug}`;
    return (
      <div
        style={{
          backgroundColor: "#1a1a1a",
          border: "1px solid #2e2e2e",
          borderRadius: "0.75rem",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.625rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Call ready
          </span>
          <button
            onClick={handleClose}
            style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "1rem", lineHeight: 1, padding: "0 2px" }}
          >
            ×
          </button>
        </div>

        {/* Link row */}
        <div
          style={{
            backgroundColor: "#242424",
            borderRadius: "0.5rem",
            padding: "0.5rem 0.625rem",
            fontSize: "0.75rem",
            color: "#6366f1",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {inviteUrl}
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={handleCopy}
            style={{
              flex: 1,
              backgroundColor: copied ? "#242424" : "transparent",
              border: "1px solid #2e2e2e",
              borderRadius: "0.375rem",
              color: copied ? "#a5b4fc" : "#9ca3af",
              fontSize: "0.8125rem",
              padding: "0.4rem 0",
              cursor: "pointer",
              transition: "background-color 0.15s, color 0.15s",
            }}
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
          <button
            onClick={handleJoin}
            style={{
              flex: 1,
              backgroundColor: "#6366f1",
              border: "none",
              borderRadius: "0.375rem",
              color: "#fff",
              fontSize: "0.8125rem",
              fontWeight: 600,
              padding: "0.4rem 0",
              cursor: "pointer",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4f46e5";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#6366f1";
            }}
          >
            Join now
          </button>
        </div>
      </div>
    );
  }

  // Default button state
  return (
    <button
      onClick={handleHost}
      disabled={loading}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        backgroundColor: "#6366f1",
        border: "none",
        borderRadius: "0.5rem",
        color: "#fff",
        fontSize: "0.875rem",
        fontWeight: 600,
        padding: "0.625rem 0",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
        transition: "background-color 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!loading)
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4f46e5";
      }}
      onMouseLeave={(e) => {
        if (!loading)
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#6366f1";
      }}
    >
      {/* Video icon */}
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
      {loading ? "Starting…" : "Host a call"}
    </button>
  );
}
