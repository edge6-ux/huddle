import { useTrackToggle, useDisconnectButton } from "@livekit/components-react";
import { Track } from "livekit-client";

// ── Icons ──────────────────────────────────────────────────────────────────

function MicOnIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function CameraOnIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function CameraOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06A2 2 0 0 1 12.5 17H3" />
      <polygon points="23 7 16 12 23 17 23 7" />
    </svg>
  );
}

function ScreenShareIcon({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function LeaveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

// ── Shared button style ────────────────────────────────────────────────────

const btnBase: React.CSSProperties = {
  width: "52px",
  height: "52px",
  borderRadius: "50%",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "background-color 0.15s",
  flexShrink: 0,
  color: "#fff",
};

// ── Individual buttons ─────────────────────────────────────────────────────

function MicButton() {
  const { buttonProps, enabled } = useTrackToggle({ source: Track.Source.Microphone });
  return (
    <button
      {...buttonProps}
      title={enabled ? "Mute microphone" : "Unmute microphone"}
      style={{ ...btnBase, backgroundColor: enabled ? "#242424" : "#b91c1c" }}
    >
      {enabled ? <MicOnIcon /> : <MicOffIcon />}
    </button>
  );
}

function CameraButton() {
  const { buttonProps, enabled } = useTrackToggle({ source: Track.Source.Camera });
  return (
    <button
      {...buttonProps}
      title={enabled ? "Turn off camera" : "Turn on camera"}
      style={{ ...btnBase, backgroundColor: enabled ? "#242424" : "#b91c1c" }}
    >
      {enabled ? <CameraOnIcon /> : <CameraOffIcon />}
    </button>
  );
}

function ScreenShareButton() {
  const { buttonProps, enabled } = useTrackToggle({ source: Track.Source.ScreenShare });
  return (
    <button
      {...buttonProps}
      title={enabled ? "Stop sharing" : "Share screen"}
      style={{ ...btnBase, backgroundColor: enabled ? "#4f46e5" : "#242424" }}
    >
      <ScreenShareIcon active={enabled} />
    </button>
  );
}

function LeaveButton() {
  const { buttonProps } = useDisconnectButton({});
  return (
    <button
      {...buttonProps}
      title="Leave call"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "0 20px",
        height: "52px",
        borderRadius: "999px",
        border: "none",
        backgroundColor: "#dc2626",
        color: "#fff",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background-color 0.15s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#b91c1c"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#dc2626"; }}
    >
      <LeaveIcon />
      Leave
    </button>
  );
}

// ── ControlBar ─────────────────────────────────────────────────────────────

export default function ControlBar() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "12px",
        padding: "14px 24px",
        backgroundColor: "rgba(26,26,26,0.92)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid #2a2a2a",
        zIndex: 20,
      }}
    >
      <MicButton />
      <CameraButton />
      <ScreenShareButton />
      <div style={{ width: "1px", height: "32px", backgroundColor: "#2e2e2e", margin: "0 4px" }} />
      <LeaveButton />
    </div>
  );
}
