import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getRoomInfo } from "../lib/api";
import { useToken } from "../hooks/useToken";
import { useAuth } from "../hooks/useAuth";

const DISPLAY_NAME_KEY = "huddle_display_name";

export default function Join() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const slugFromQuery = searchParams.get("room") ?? "";

  const [meetingId, setMeetingId] = useState(slugFromQuery);
  const [displayName, setDisplayName] = useState(
    () => localStorage.getItem(DISPLAY_NAME_KEY) ?? ""
  );
  const [roomName, setRoomName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { fetchToken } = useToken();
  const autoJoinFired = useRef(false);

  // Fetch room name for display
  useEffect(() => {
    if (!slugFromQuery) return;
    let cancelled = false;
    getRoomInfo(slugFromQuery)
      .then((info) => { if (!cancelled) setRoomName(info.name ?? null); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [slugFromQuery]);

  // Auto-join for authenticated users arriving via a direct room link
  useEffect(() => {
    if (!slugFromQuery || authLoading || !isAuthenticated || !user) return;
    if (autoJoinFired.current) return;
    autoJoinFired.current = true;

    const name = user.name || localStorage.getItem(DISPLAY_NAME_KEY) || "";
    if (!name) return; // fall through to form if somehow no name

    setSubmitting(true);
    fetchToken({ roomSlug: slugFromQuery, displayName: name })
      .then((result) => {
        navigate(`/room/${slugFromQuery}`, {
          state: {
            token: result.token,
            livekitUrl: result.livekitUrl,
            roomName: result.roomName ?? roomName ?? slugFromQuery,
          },
        });
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to join room.");
        setSubmitting(false);
      });
  }, [slugFromQuery, authLoading, isAuthenticated, user, fetchToken, navigate, roomName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const slug = meetingId.trim();
    const name = displayName.trim();

    if (!slug) { setError("Please enter a Meeting ID."); return; }
    if (!name) { setError("Please enter a display name."); return; }

    localStorage.setItem(DISPLAY_NAME_KEY, name);
    setSubmitting(true);
    try {
      const result = await fetchToken({ roomSlug: slug, displayName: name });
      navigate(`/room/${slug}`, {
        state: {
          token: result.token,
          livekitUrl: result.livekitUrl,
          roomName: result.roomName ?? roomName ?? slug,
        },
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to join room.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase: React.CSSProperties = { backgroundColor: "#242424", border: "1px solid #333" };
  const onFocusBorder = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.border = "1px solid #6366f1";
  };
  const onBlurBorder = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.border = "1px solid #333";
  };

  // Show a minimal loading screen while auto-joining
  if (slugFromQuery && (authLoading || (isAuthenticated && submitting && !error))) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0f0f0f",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <span style={{ color: "#6366f1", fontSize: "1.5rem", fontWeight: 700 }}>huddle</span>
        <p style={{ color: "#6b7280", fontSize: "0.9375rem" }}>
          {roomName ? `Joining ${roomName}…` : "Joining call…"}
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#0f0f0f" }}
    >
      <Link to="/" className="mb-8 text-3xl font-bold tracking-tight" style={{ color: "#6366f1" }}>
        huddle
      </Link>

      <div
        className="w-full max-w-md rounded-xl p-8 flex flex-col gap-6"
        style={{ backgroundColor: "#1a1a1a" }}
      >
        <div>
          <h1 className="text-2xl font-semibold text-white">
            {slugFromQuery ? "You're invited to a call" : "Join a meeting"}
          </h1>
          {roomName ? (
            <p className="mt-1 text-sm text-gray-400">
              Joining <span className="text-indigo-400 font-medium">{roomName}</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-400">
              {slugFromQuery ? "Enter your name to jump in." : "Enter your details to join."}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Meeting ID — only shown when no room is pre-specified */}
          {!slugFromQuery && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="meetingId" className="text-sm font-medium text-gray-300">
                Meeting ID
              </label>
              <input
                id="meetingId"
                type="text"
                required
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                placeholder="e.g. my-meeting-room"
                className="rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
                style={inputBase}
                onFocus={onFocusBorder}
                onBlur={onBlurBorder}
              />
            </div>
          )}

          {/* Display name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="displayName" className="text-sm font-medium text-gray-300">
              Your name
            </label>
            <input
              id="displayName"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How others will see you"
              className="rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
              style={inputBase}
              onFocus={onFocusBorder}
              onBlur={onBlurBorder}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400" role="alert">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg py-3 font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#6366f1" }}
            onMouseEnter={(e) => {
              if (!submitting)
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4f46e5";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#6366f1";
            }}
          >
            {submitting ? "Joining…" : "Join meeting"}
          </button>
        </form>

        <div className="text-center text-sm">
          <Link to="/" className="text-gray-500 hover:text-gray-300">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
