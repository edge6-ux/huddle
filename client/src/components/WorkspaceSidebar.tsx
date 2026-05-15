import { useNavigate, useParams } from "react-router-dom";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { useAuth } from "../hooks/useAuth";

const PALETTE = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#f97316",
];

function avatarColor(str: string): string {
  let h = 0;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) % PALETTE.length;
  return PALETTE[Math.abs(h)];
}

export default function WorkspaceSidebar() {
  const { workspaces } = useWorkspaceStore();
  const { slug: activeSlug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const initials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div
      style={{
        width: "60px",
        flexShrink: 0,
        backgroundColor: "#111111",
        borderRight: "1px solid #1f1f1f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "12px",
        paddingBottom: "12px",
        gap: "6px",
        overflowY: "auto",
      }}
    >
      {/* Workspace icons */}
      {workspaces.map((ws) => {
        const isActive = ws.slug === activeSlug;
        const color = avatarColor(ws.id);
        return (
          <button
            key={ws.id}
            title={ws.name}
            onClick={() => navigate(`/w/${ws.slug}`)}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: isActive ? "12px" : "20px",
              backgroundColor: color,
              border: isActive ? `2px solid #fff` : "2px solid transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: 700,
              color: "#fff",
              transition: "border-radius 0.15s, border-color 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!isActive)
                (e.currentTarget as HTMLButtonElement).style.borderRadius = "12px";
            }}
            onMouseLeave={(e) => {
              if (!isActive)
                (e.currentTarget as HTMLButtonElement).style.borderRadius = "20px";
            }}
          >
            {initials(ws.name)}
          </button>
        );
      })}

      {/* Divider */}
      {workspaces.length > 0 && (
        <div style={{ width: "32px", height: "1px", backgroundColor: "#2a2a2a", margin: "4px 0" }} />
      )}

      {/* Create workspace */}
      <button
        title="Create workspace"
        onClick={() => navigate("/onboarding")}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "20px",
          backgroundColor: "transparent",
          border: "2px dashed #333",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#555",
          fontSize: "22px",
          lineHeight: 1,
          transition: "border-color 0.15s, color 0.15s, border-radius 0.15s",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          const btn = e.currentTarget as HTMLButtonElement;
          btn.style.borderColor = "#6366f1";
          btn.style.color = "#6366f1";
          btn.style.borderRadius = "12px";
        }}
        onMouseLeave={(e) => {
          const btn = e.currentTarget as HTMLButtonElement;
          btn.style.borderColor = "#333";
          btn.style.color = "#555";
          btn.style.borderRadius = "20px";
        }}
      >
        +
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User avatar */}
      {user && (
        <div
          title={user.name ?? user.email}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: avatarColor(user.id),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {initials(user.name ?? user.email ?? "?")}
        </div>
      )}
    </div>
  );
}
