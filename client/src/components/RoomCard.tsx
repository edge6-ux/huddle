import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { type Room } from "../lib/api";

interface RoomCardProps {
  room: Room;
  onDelete: (id: string) => void;
}

export default function RoomCard({ room, onDelete }: RoomCardProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const meetingLink = `${window.location.origin}/meet/${room.slug}`;

  function handleCopyLink() {
    navigator.clipboard.writeText(meetingLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleStartCall() {
    navigate(`/join?room=${room.slug}`);
  }

  return (
    <div
      style={{
        backgroundColor: "#1a1a1a",
        border: "1px solid #2e2e2e",
        borderRadius: "0.75rem",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      {/* Room name */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3
          style={{
            color: "#ffffff",
            fontSize: "1.125rem",
            fontWeight: 600,
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {room.name}
        </h3>
        {room.meetings && (
          <span
            style={{
              fontSize: "0.75rem",
              color: "#6b7280",
              whiteSpace: "nowrap",
              marginLeft: "0.5rem",
              flexShrink: 0,
            }}
          >
            {room.meetings.length} meeting{room.meetings.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Meeting link */}
      <button
        onClick={handleCopyLink}
        title="Click to copy link"
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          textAlign: "left",
          color: copied ? "#a5b4fc" : "#6366f1",
          fontSize: "0.8125rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          transition: "color 0.15s",
        }}
      >
        {copied ? "Copied!" : `/meet/${room.slug}`}
      </button>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginTop: "0.25rem" }}>
        <button
          onClick={handleStartCall}
          style={{
            backgroundColor: "#6366f1",
            color: "#ffffff",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 500,
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
          Start call
        </button>

        {/* Delete flow */}
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{
              background: "none",
              border: "none",
              padding: "0.5rem 0.25rem",
              cursor: "pointer",
              color: "#f87171",
              fontSize: "0.875rem",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
            }}
          >
            Delete
          </button>
        ) : (
          <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem" }}>
            <span style={{ color: "#f87171" }}>Delete?</span>
            <button
              onClick={() => {
                setConfirmDelete(false);
                onDelete(room.id);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#f87171",
                fontWeight: 600,
                fontSize: "0.875rem",
                padding: "0 0.125rem",
              }}
            >
              Yes
            </button>
            <span style={{ color: "#4b5563" }}>/</span>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9ca3af",
                fontSize: "0.875rem",
                padding: "0 0.125rem",
              }}
            >
              No
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
