import { useEffect, useRef, useState } from "react";
import { getTeamMessages, sendTeamMessage, type Message } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

interface TeamChatProps {
  teamId: string;
}

function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: "#6366f1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

export default function TeamChat({ teamId }: TeamChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const msgs = await getTeamMessages(teamId);
        if (!cancelled) setMessages(msgs);
      } catch {
        // ignore
      }
    }

    load();
    const interval = setInterval(load, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [teamId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const msg = await sendTeamMessage(teamId, content);
      setMessages((prev) => [...prev, msg]);
      setInput("");
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "500px",
        backgroundColor: "#111",
        border: "1px solid #2e2e2e",
        borderRadius: "0.75rem",
        overflow: "hidden",
      }}
    >
      {/* Message list */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: "#4b5563", fontSize: "0.875rem", margin: "auto", textAlign: "center" }}>
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user?.id;
          const prevMsg = messages[i - 1];
          const grouped = prevMsg?.senderId === msg.senderId;

          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                gap: "0.625rem",
                alignItems: "flex-start",
                marginTop: grouped ? 0 : "0.25rem",
              }}
            >
              {grouped ? (
                <div style={{ width: 28, flexShrink: 0 }} />
              ) : (
                <Avatar name={msg.sender.name} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                {!grouped && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "0.5rem",
                      marginBottom: "0.125rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: isMe ? "#a5b4fc" : "#e5e7eb",
                      }}
                    >
                      {isMe ? "You" : msg.sender.name}
                    </span>
                    <span style={{ fontSize: "0.6875rem", color: "#4b5563" }}>
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                )}
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.875rem",
                    color: "#d1d5db",
                    lineHeight: 1.5,
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        style={{
          display: "flex",
          gap: "0.5rem",
          padding: "0.75rem 1rem",
          borderTop: "1px solid #2e2e2e",
          backgroundColor: "#161616",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message the team…"
          disabled={sending}
          style={{
            flex: 1,
            backgroundColor: "#242424",
            border: "1px solid #333",
            borderRadius: "0.5rem",
            color: "#fff",
            fontSize: "0.875rem",
            padding: "0.5rem 0.75rem",
            outline: "none",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e as unknown as React.FormEvent);
            }
          }}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          style={{
            backgroundColor: "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: sending || !input.trim() ? "not-allowed" : "pointer",
            opacity: sending || !input.trim() ? 0.5 : 1,
            transition: "opacity 0.15s",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
