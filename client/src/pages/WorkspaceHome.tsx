import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { useTeamStore } from "../stores/teamStore";

export default function WorkspaceHome() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { activeWorkspace, loading: wsLoading } = useWorkspaceStore();
  const { teams, loading: teamsLoading, fetchTeams } = useTeamStore();

  useEffect(() => {
    if (slug) fetchTeams(slug);
  }, [slug, fetchTeams]);

  const canManage =
    activeWorkspace?.role === "OWNER" || activeWorkspace?.role === "ADMIN";

  if (wsLoading || !activeWorkspace) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
        }}
      >
        Loading…
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem 2.5rem", maxWidth: "900px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            {activeWorkspace.name}
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
            {activeWorkspace._count?.members ?? activeWorkspace.members?.length ?? 0} member
            {(activeWorkspace._count?.members ?? 1) !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Teams */}
      {teamsLoading ? (
        <p style={{ color: "#6b7280" }}>Loading teams…</p>
      ) : teams.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 0",
            color: "#6b7280",
          }}
        >
          <p style={{ fontSize: "1rem", marginBottom: "1rem" }}>
            {canManage
              ? "No teams yet. Create your first team using the sidebar."
              : "You haven't been added to any teams yet."}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1rem",
          }}
        >
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => navigate(`/w/${slug}/teams/${team.id}`)}
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #2e2e2e",
                borderRadius: "0.75rem",
                padding: "1.25rem",
                cursor: "pointer",
                textAlign: "left",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#6366f1";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#2e2e2e";
              }}
            >
              <div
                style={{ fontSize: "1rem", fontWeight: 600, color: "#fff", marginBottom: "0.375rem" }}
              >
                {team.name}
              </div>
              {team.description && (
                <div
                  style={{
                    fontSize: "0.8125rem",
                    color: "#6b7280",
                    marginBottom: "0.75rem",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {team.description}
                </div>
              )}
              <div style={{ display: "flex", gap: "1rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                  {team._count?.members ?? team.members?.length ?? 0} member
                  {(team._count?.members ?? 1) !== 1 ? "s" : ""}
                </span>
                <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                  {team._count?.rooms ?? team.rooms?.length ?? 0} room
                  {(team._count?.rooms ?? 1) !== 1 ? "s" : ""}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
