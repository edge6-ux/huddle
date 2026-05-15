import {
  GridLayout,
  ParticipantTile,
  useTracks,
  useTrackRefContext,
  useIsSpeaking,
} from "@livekit/components-react";
import { Track } from "livekit-client";

function CustomTile() {
  const trackRef = useTrackRefContext();
  const participant = trackRef.participant;
  const isSpeaking = useIsSpeaking(participant);

  let isGuest = false;
  try {
    isGuest = JSON.parse(participant.metadata ?? "{}").isGuest === true;
  } catch {
    // malformed metadata — treat as non-guest
  }

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        outline: isSpeaking ? "2px solid #6366f1" : "2px solid transparent",
        outlineOffset: "-2px",
        transition: "outline-color 0.15s",
      }}
    >
      <ParticipantTile style={{ height: "100%", width: "100%" }} />

      {isGuest && (
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            left: "8px",
            backgroundColor: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            color: "#9ca3af",
            fontSize: "11px",
            fontWeight: 500,
            padding: "2px 8px",
            borderRadius: "999px",
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          Guest
        </div>
      )}
    </div>
  );
}

export default function VideoGrid() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  if (tracks.length === 0) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#4b5563", fontSize: "0.875rem" }}>Connecting…</p>
      </div>
    );
  }

  return (
    <GridLayout
      tracks={tracks}
      style={{ height: "100%", padding: "12px", gap: "12px" }}
    >
      <CustomTile />
    </GridLayout>
  );
}
