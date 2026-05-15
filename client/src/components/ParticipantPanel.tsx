import { useParticipants, useLocalParticipant } from "@livekit/components-react";
import type { Participant } from "livekit-client";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ParticipantPanelProps {
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Camera / mic status icons
// ---------------------------------------------------------------------------

function MicIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#6366f1" : "#555"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={active ? "Mic on" : "Mic off"}
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function CameraIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#6366f1" : "#555"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={active ? "Camera on" : "Camera off"}
    >
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Single participant row
// ---------------------------------------------------------------------------

interface ParticipantRowProps {
  participant: Participant;
  isLocal: boolean;
}

function ParticipantRow({ participant, isLocal }: ParticipantRowProps) {
  const displayName =
    participant.name?.trim() || participant.identity || "Unknown";
  const isGuest = participant.identity.startsWith("guest_");
  const isSpeaking = participant.isSpeaking;

  // Derive media state from publication flags
  const micEnabled = !participant.isMicrophoneEnabled
    ? false
    : participant.isMicrophoneEnabled;
  const cameraEnabled = !participant.isCameraEnabled
    ? false
    : participant.isCameraEnabled;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 16px",
        borderRadius: "8px",
        backgroundColor: isSpeaking ? "rgba(99,102,241,0.08)" : "transparent",
        transition: "background-color 0.2s",
      }}
    >
      {/* Speaking indicator / avatar placeholder */}
      <div
        style={{
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Avatar circle */}
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            backgroundColor: "#2a2a2a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#aaa",
            fontSize: "14px",
            fontWeight: 600,
            userSelect: "none",
          }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>

        {/* Pulsing speaking dot */}
        {isSpeaking && (
          <span
            style={{
              position: "absolute",
              bottom: "0px",
              right: "0px",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#22c55e",
              border: "2px solid #1a1a1a",
              animation: "speakPulse 1s ease-in-out infinite",
            }}
          />
        )}
      </div>

      {/* Name + badges */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              color: "#e0e0e0",
              fontSize: "13px",
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "130px",
            }}
          >
            {displayName}
          </span>

          {isLocal && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                padding: "1px 6px",
                borderRadius: "999px",
                backgroundColor: "rgba(99,102,241,0.2)",
                color: "#818cf8",
              }}
            >
              You
            </span>
          )}

          {isGuest && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 500,
                padding: "1px 6px",
                borderRadius: "999px",
                backgroundColor: "#2a2a2a",
                color: "#888",
              }}
            >
              Guest
            </span>
          )}
        </div>
      </div>

      {/* Media status icons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flexShrink: 0,
        }}
      >
        <MicIcon active={micEnabled} />
        <CameraIcon active={cameraEnabled} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ParticipantPanel
// ---------------------------------------------------------------------------

export default function ParticipantPanel({ onClose }: ParticipantPanelProps) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  return (
    <>
      {/* Keyframe for speaking dot pulse — injected as a style tag */}
      <style>{`
        @keyframes speakPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "288px", // w-72
          backgroundColor: "#1a1a1a",
          borderLeft: "1px solid #2a2a2a",
          display: "flex",
          flexDirection: "column",
          zIndex: 30,
          boxShadow: "-4px 0 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 16px 12px",
            borderBottom: "1px solid #2a2a2a",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: "#e0e0e0",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Participants ({participants.length})
          </span>

          <button
            onClick={onClose}
            title="Close panel"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "transparent",
              color: "#888",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#242424";
              (e.currentTarget as HTMLButtonElement).style.color = "#ccc";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#888";
            }}
          >
            {/* X icon */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Participant list */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "8px 0",
          }}
        >
          {participants.length === 0 ? (
            <p
              style={{
                color: "#555",
                fontSize: "13px",
                textAlign: "center",
                marginTop: "32px",
              }}
            >
              No participants yet
            </p>
          ) : (
            participants.map((participant) => (
              <ParticipantRow
                key={participant.sid}
                participant={participant}
                isLocal={participant.sid === localParticipant?.sid}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
