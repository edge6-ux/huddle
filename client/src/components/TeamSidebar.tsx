import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { useTeamStore } from "../stores/teamStore";
import { createTeam } from "../lib/api";
import HostCallButton from "./HostCallButton";

export default function TeamSidebar() {
  const { slug, teamId: activeTeamId } = useParams<{ slug?: string; teamId?: string }>();
  const navigate = useNavigate();

  const { activeWorkspace } = useWorkspaceStore();
  const { teams, addTeam } = useTeamStore();

  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [creating, setCreating] = useState(false);

  const canManage =
    activeWorkspace?.role === "OWNER" || activeWorkspace?.role === "ADMIN";

  function toggleTeam(id: string) {
    setExpandedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!slug || !newTeamName.trim()) return;
    setCreating(true);
    try {
      const team = await createTeam(slug, newTeamName.trim());
      addTeam(team);
      setNewTeamName("");
      setShowCreateTeam(false);
      navigate(`/w/${slug}/teams/${team.id}`);
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  }

  if (!activeWorkspace) return null;

  return (
    <div
      style={{
        width: "220px",
        flexShrink: 0,
        backgroundColor: "#161616",
        borderRight: "1px solid #1f1f1f",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Workspace header */}
      <div
        style={{
          padding: "14px 16px 10px",
          borderBottom: "1px solid #1f1f1f",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#e5e7eb",
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {activeWorkspace.name}
        </span>
        <span
          style={{ fontSize: "11px", color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          {activeWorkspace.role}
        </span>
      </div>

      {/* Teams list */}
      <div style={{ flex: 1, overflowY: "auto", paddingTop: "8px" }}>
        {teams.map((team) => {
          const isActive = team.id === activeTeamId;
          const isExpanded = expandedTeams.has(team.id) || isActive;

          return (
            <div key={team.id}>
              {/* Team row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 8px",
                  gap: "4px",
                  height: "32px",
                }}
              >
                {/* Expand chevron */}
                <button
                  onClick={() => toggleTeam(team.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#555",
                    padding: "2px",
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                    fontSize: "10px",
                    transition: "color 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "#555";
                  }}
                >
                  {isExpanded ? "▼" : "▶"}
                </button>

                {/* Team name */}
                <button
                  onClick={() => {
                    navigate(`/w/${slug}/teams/${team.id}`);
                    if (!isExpanded) toggleTeam(team.id);
                  }}
                  style={{
                    flex: 1,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: isActive ? "#e5e7eb" : "#9ca3af",
                    fontSize: "13px",
                    fontWeight: isActive ? 600 : 400,
                    textAlign: "left",
                    padding: "4px 4px",
                    borderRadius: "4px",
                    backgroundColor: isActive ? "#242424" : "transparent",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    transition: "color 0.1s, background-color 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1e1e1e";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                  }}
                >
                  {team.name}
                </button>
              </div>

              {/* Rooms under team */}
              {isExpanded && team.rooms && team.rooms.length > 0 && (
                <div style={{ paddingLeft: "24px" }}>
                  {team.rooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => navigate(`/join?room=${room.slug}`)}
                      title={`Join ${room.name}`}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#6b7280",
                        fontSize: "12px",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        transition: "color 0.1s, background-color 0.1s",
                      }}
                      onMouseEnter={(e) => {
                        const btn = e.currentTarget as HTMLButtonElement;
                        btn.style.color = "#d1d5db";
                        btn.style.backgroundColor = "#1e1e1e";
                      }}
                      onMouseLeave={(e) => {
                        const btn = e.currentTarget as HTMLButtonElement;
                        btn.style.color = "#6b7280";
                        btn.style.backgroundColor = "transparent";
                      }}
                    >
                      # {room.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Host a call */}
        <div style={{ padding: "8px 8px 4px" }}>
          <HostCallButton />
        </div>

        {/* Create team */}
        {canManage && (
          <div style={{ padding: "4px 8px 8px" }}>
            {!showCreateTeam ? (
              <button
                onClick={() => setShowCreateTeam(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#555",
                  fontSize: "12px",
                  padding: "6px 4px",
                  width: "100%",
                  transition: "color 0.1s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#555";
                }}
              >
                <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span>
                Add team
              </button>
            ) : (
              <form onSubmit={handleCreateTeam} style={{ marginTop: "4px" }}>
                <input
                  autoFocus
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Team name"
                  disabled={creating}
                  style={{
                    width: "100%",
                    backgroundColor: "#242424",
                    border: "1px solid #6366f1",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "12px",
                    padding: "6px 8px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setShowCreateTeam(false);
                      setNewTeamName("");
                    }
                  }}
                />
                <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                  <button
                    type="submit"
                    disabled={creating || !newTeamName.trim()}
                    style={{
                      flex: 1,
                      backgroundColor: "#6366f1",
                      border: "none",
                      borderRadius: "4px",
                      color: "#fff",
                      fontSize: "11px",
                      padding: "4px",
                      cursor: creating ? "not-allowed" : "pointer",
                      opacity: creating ? 0.6 : 1,
                    }}
                  >
                    {creating ? "…" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateTeam(false);
                      setNewTeamName("");
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: "transparent",
                      border: "1px solid #333",
                      borderRadius: "4px",
                      color: "#9ca3af",
                      fontSize: "11px",
                      padding: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
