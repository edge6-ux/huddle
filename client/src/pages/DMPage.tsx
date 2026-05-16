import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getDMs, sendDM, type DirectMessage } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

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

export default function DMPage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [otherName, setOtherName] = useState("Direct Message");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function load() {
      try {
        const msgs = await getDMs(userId!);
        if (!cancelled) {
          setMessages(msgs);
          if (msgs.length > 0) {
            const other = msgs[0].senderId === user?.id ? msgs[0].receiver : msgs[0].sender;
            setOtherName(other.name);
          }
        }
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
  }, [userId, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending || !userId) return;
    setSending(true);
    try {
      const msg = await sendDM(userId, content);
      setMessages((prev) => [...prev, msg]);
      setInput("");
      if (otherName === "Direct Message") setOtherName(msg.receiver.name);
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
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          padding: "1rem 1.5rem",
          borderBottom: "1px solid #2e2e2e",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexShrink: 0,
        }}
      >
        <Avatar name={otherName} size={32} />
        <span style={{ fontSize: "1rem", fontWeight: 600, color: "#e5e7eb" }}>{otherName}</span>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {messages.length === 0 && (
          <p
            style={{
              color: "#4b5563",
              fontSize: "0.875rem",
              margin: "auto",
              textAlign: "center",
            }}
          >
            No messages yet. Start the conversation!
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
          padding: "1rem 1.5rem",
          borderTop: "1px solid #2e2e2e",
          backgroundColor: "#161616",
          flexShrink: 0,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${otherName}…`}
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
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
