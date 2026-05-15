import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import VideoGrid from "../components/VideoGrid";
import ControlBar from "../components/ControlBar";
import ParticipantPanel from "../components/ParticipantPanel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RoomLocationState {
  token?: string;
  livekitUrl?: string;
  roomName?: string;
}

// ---------------------------------------------------------------------------
// Inner component — must be rendered inside <LiveKitRoom> so hooks work
// ---------------------------------------------------------------------------

interface RoomContentProps {
  roomName: string;
  onLeave: () => void;
}

function RoomContent({ roomName, onLeave }: RoomContentProps) {
  const room = useRoomContext();
  const [showParticipants, setShowParticipants] = useState(false);
  const participantCount = room.numParticipants;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#0f0f0f",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Top bar                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          backgroundColor: "#1a1a1a",
          borderBottom: "1px solid #2a2a2a",
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {/* Left — room name */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              color: "#6366f1",
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            huddle
          </span>
          <span
            style={{
              color: "#555",
              fontSize: "14px",
              userSelect: "none",
            }}
          >
            /
          </span>
          <span
            style={{
              color: "#e0e0e0",
              fontSize: "14px",
              fontWeight: 500,
              maxWidth: "280px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {roomName}
          </span>
        </div>

        {/* Right — participant toggle + leave */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setShowParticipants((v) => !v)}
            title="Toggle participant list"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              borderRadius: "8px",
              border: "1px solid #333",
              backgroundColor: showParticipants ? "#242424" : "transparent",
              color: "#ccc",
              fontSize: "13px",
              cursor: "pointer",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!showParticipants)
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#242424";
            }}
            onMouseLeave={(e) => {
              if (!showParticipants)
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "transparent";
            }}
          >
            {/* People icon */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {participantCount}
          </button>

          <button
            onClick={onLeave}
            title="Leave meeting"
            style={{
              padding: "7px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#dc2626",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#b91c1c";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#dc2626";
            }}
          >
            Leave
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Main content area                                                   */}
      {/* ------------------------------------------------------------------ */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Video grid */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            paddingBottom: "88px", // space for fixed control bar
          }}
        >
          <VideoGrid />
        </div>

        {/* Participant side panel */}
        {showParticipants && (
          <ParticipantPanel onClose={() => setShowParticipants(false)} />
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Control bar (fixed bottom)                                          */}
      {/* ------------------------------------------------------------------ */}
      <ControlBar />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function Room() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as RoomLocationState;

  const { token, livekitUrl, roomName } = state;

  // Guard: move navigate into useEffect so it doesn't fire during render
  useEffect(() => {
    if (!token || !livekitUrl) {
      navigate(`/join?room=${slug ?? ""}`, { replace: true });
    }
  }, [token, livekitUrl, slug, navigate]);

  if (!token || !livekitUrl) return null;

  const resolvedRoomName = roomName ?? "Meeting";

  return (
    <LiveKitRoomWithGuard
      token={token}
      livekitUrl={livekitUrl}
      roomName={resolvedRoomName}
      onLeave={() => navigate("/")}
    />
  );
}

function LiveKitRoomWithGuard({
  token,
  livekitUrl,
  roomName,
  onLeave,
}: {
  token: string;
  livekitUrl: string;
  roomName: string;
  onLeave: () => void;
}) {
  const didConnect = useRef(false);
  const [connError, setConnError] = useState<string | null>(null);

  if (connError) {
    return (
      <div style={{ height: "100vh", backgroundColor: "#0f0f0f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
        <p style={{ color: "#f87171", fontSize: "0.9375rem" }}>{connError}</p>
        <button onClick={onLeave} style={{ color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem" }}>
          ← Back
        </button>
      </div>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={livekitUrl}
      token={token}
      connect={true}
      audio={true}
      video={true}
      style={{ height: "100vh", background: "#0f0f0f" }}
      onConnected={() => { didConnect.current = true; }}
      onDisconnected={() => { if (didConnect.current) onLeave(); }}
      onError={(err) => setConnError(err.message ?? "Failed to connect to room")}
    >
      <RoomContent
        roomName={roomName}
        onLeave={onLeave}
      />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
