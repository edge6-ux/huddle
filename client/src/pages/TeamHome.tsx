import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTeamStore } from "../stores/teamStore";
import { useAuth } from "../hooks/useAuth";
import {
  getTeam,
  generateInvite,
  removeTeamMember,
  updateTeamMemberRole,
  createTeamRoom,
  deleteTeamRoom,
  type TeamMember,
  type TeamRole,
} from "../lib/api";
import TeamChat from "../components/TeamChat";

const ROLE_LABEL: Record<TeamRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
};

export default function TeamHome() {
  const { slug, teamId } = useParams<{ slug: string; teamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { activeTeam, setActiveTeam, addRoom, removeRoom, setMembers, members } = useTeamStore();

  const [tab, setTab] = useState<"rooms" | "members" | "chat">("rooms");
  const [loading, setLoading] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [copiedRoomId, setCopiedRoomId] = useState<string | null>(null);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [addingRoom, setAddingRoom] = useState(false);

  useEffect(() => {
    if (!slug || !teamId) return;
    setLoading(true);
    getTeam(slug, teamId)
      .then((team) => {
        setActiveTeam(team);
        setMembers(team.members ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, teamId, setActiveTeam, setMembers]);

  const team = activeTeam?.id === teamId ? activeTeam : null;
  const myMembership = members.find((m) => m.userId === user?.id);
  const canManage = myMembership?.role === "OWNER" || myMembership?.role === "ADMIN";

  async function handleInvite() {
    if (!teamId) return;
    try {
      const { token } = await generateInvite(teamId);
      setInviteToken(token);
    } catch (err) {
      console.error(err);
    }
  }

  function handleCopyInvite() {
    if (!inviteToken) return;
    const url = `${window.location.origin}/invite/${inviteToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    });
  }

  async function handleRemoveMember(member: TeamMember) {
    if (!teamId) return;
    if (!confirm(`Remove ${member.user.name} from this team?`)) return;
    await removeTeamMember(teamId, member.userId);
    setMembers(members.filter((m) => m.userId !== member.userId));
  }

  async function handleRoleChange(member: TeamMember, role: "ADMIN" | "MEMBER") {
    if (!teamId) return;
    const updated = await updateTeamMemberRole(teamId, member.userId, role);
    setMembers(members.map((m) => (m.userId === member.userId ? updated : m)));
  }

  async function handleAddRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!teamId || !newRoomName.trim()) return;
    setAddingRoom(true);
    try {
      const room = await createTeamRoom(teamId, newRoomName.trim());
      addRoom(teamId, room);
      setNewRoomName("");
      setShowAddRoom(false);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingRoom(false);
    }
  }

  function handleCopyRoomLink(roomId: string, roomSlug: string) {
    const url = `${window.location.origin}/join?room=${roomSlug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedRoomId(roomId);
      setTimeout(() => setCopiedRoomId(null), 2000);
    });
  }

  async function handleDeleteRoom(roomId: string) {
    if (!teamId) return;
    await deleteTeamRoom(teamId, roomId);
    removeRoom(teamId, roomId);
  }

  if (loading || !team) {
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
        {loading ? "Loading…" : "Team not found"}
      </div>
    );
  }

  const rooms = team.rooms ?? [];

  const tabStyle = (t: typeof tab) => ({
    padding: "0.375rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer" as const,
    backgroundColor: tab === t ? "#6366f1" : "transparent",
    color: tab === t ? "#fff" : "#6b7280",
    transition: "background-color 0.15s, color 0.15s",
  });

  return (
    <div style={{ padding: "2rem 2.5rem", maxWidth: "860px" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", margin: "0 0 0.375rem" }}>
          {team.name}
        </h1>
        {team.description && (
          <p style={{ color: "#6b7280", fontSize: "0.9375rem", margin: 0 }}>{team.description}</p>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem" }}>
        <button style={tabStyle("rooms")} onClick={() => setTab("rooms")}>Rooms</button>
        <button style={tabStyle("members")} onClick={() => setTab("members")}>Members</button>
        <button style={tabStyle("chat")} onClick={() => setTab("chat")}>Chat</button>
      </div>

      {tab === "chat" && teamId && <TeamChat teamId={teamId} />}

      {/* Rooms section */}
      {tab === "rooms" && <section style={{ marginBottom: "2.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
            Rooms
          </h2>
          {canManage && (
            <button
              onClick={() => setShowAddRoom(true)}
              style={{
                background: "none",
                border: "none",
                color: "#6366f1",
                fontSize: "0.8125rem",
                cursor: "pointer",
                padding: 0,
              }}
            >
              + Add room
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {rooms.map((room) => (
            <div
              key={room.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#1a1a1a",
                border: "1px solid #2e2e2e",
                borderRadius: "0.625rem",
                padding: "0.75rem 1rem",
              }}
            >
              <div>
                <span style={{ color: "#e5e7eb", fontSize: "0.9375rem", fontWeight: 500 }}>
                  # {room.name}
                </span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button
                  onClick={() => handleCopyRoomLink(room.id, room.slug)}
                  title="Copy invite link"
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #2e2e2e",
                    borderRadius: "0.375rem",
                    color: copiedRoomId === room.id ? "#a5b4fc" : "#6b7280",
                    fontSize: "0.8125rem",
                    padding: "0.375rem 0.75rem",
                    cursor: "pointer",
                    transition: "border-color 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (copiedRoomId !== room.id) {
                      const btn = e.currentTarget as HTMLButtonElement;
                      btn.style.borderColor = "#6366f1";
                      btn.style.color = "#a5b4fc";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (copiedRoomId !== room.id) {
                      const btn = e.currentTarget as HTMLButtonElement;
                      btn.style.borderColor = "#2e2e2e";
                      btn.style.color = "#6b7280";
                    }
                  }}
                >
                  {copiedRoomId === room.id ? "Copied!" : "Copy link"}
                </button>
                <button
                  onClick={() => navigate(`/join?room=${room.slug}`)}
                  style={{
                    backgroundColor: "#6366f1",
                    color: "#fff",
                    border: "none",
                    borderRadius: "0.375rem",
                    padding: "0.375rem 0.875rem",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4f46e5";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#6366f1";
                  }}
                >
                  Join
                </button>
                {canManage && rooms.length > 1 && (
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#f87171",
                      cursor: "pointer",
                      fontSize: "0.8125rem",
                      padding: "0.375rem 0.25rem",
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}

          {rooms.length === 0 && (
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>No rooms yet.</p>
          )}
        </div>

        {/* Add room form */}
        {showAddRoom && (
          <form
            onSubmit={handleAddRoom}
            style={{
              display: "flex",
              gap: "0.5rem",
              marginTop: "0.75rem",
              alignItems: "center",
            }}
          >
            <input
              autoFocus
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Room name"
              disabled={addingRoom}
              style={{
                flex: 1,
                backgroundColor: "#242424",
                border: "1px solid #6366f1",
                borderRadius: "0.5rem",
                color: "#fff",
                padding: "0.5rem 0.75rem",
                fontSize: "0.875rem",
                outline: "none",
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setShowAddRoom(false);
                  setNewRoomName("");
                }
              }}
            />
            <button
              type="submit"
              disabled={addingRoom || !newRoomName.trim()}
              style={{
                backgroundColor: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                cursor: addingRoom ? "not-allowed" : "pointer",
                opacity: addingRoom ? 0.6 : 1,
              }}
            >
              {addingRoom ? "…" : "Add"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddRoom(false);
                setNewRoomName("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "#6b7280",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Cancel
            </button>
          </form>
        )}
      </section>}

      {/* Members section */}
      {tab === "members" && <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
            Members ({members.length})
          </h2>
          {canManage && (
            <button
              onClick={handleInvite}
              style={{
                backgroundColor: "transparent",
                border: "1px solid #2e2e2e",
                borderRadius: "0.375rem",
                color: "#9ca3af",
                fontSize: "0.8125rem",
                padding: "0.3rem 0.75rem",
                cursor: "pointer",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.borderColor = "#6366f1";
                btn.style.color = "#a5b4fc";
              }}
              onMouseLeave={(e) => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.borderColor = "#2e2e2e";
                btn.style.color = "#9ca3af";
              }}
            >
              Invite members
            </button>
          )}
        </div>

        {/* Invite link box */}
        {inviteToken && (
          <div
            style={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #2e2e2e",
              borderRadius: "0.625rem",
              padding: "0.875rem 1rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <span
              style={{
                flex: 1,
                fontSize: "0.8125rem",
                color: "#6366f1",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {window.location.origin}/invite/{inviteToken}
            </span>
            <button
              onClick={handleCopyInvite}
              style={{
                backgroundColor: inviteCopied ? "#242424" : "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: "0.375rem",
                padding: "0.375rem 0.875rem",
                fontSize: "0.8125rem",
                cursor: "pointer",
                flexShrink: 0,
                transition: "background-color 0.15s",
              }}
            >
              {inviteCopied ? "Copied!" : "Copy link"}
            </button>
            <button
              onClick={() => setInviteToken(null)}
              style={{
                background: "none",
                border: "none",
                color: "#6b7280",
                cursor: "pointer",
                fontSize: "1rem",
                padding: "0 0.25rem",
              }}
            >
              ×
            </button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {members.map((member) => {
            const isMe = member.userId === user?.id;
            return (
              <div
                key={member.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #2e2e2e",
                  borderRadius: "0.625rem",
                  padding: "0.625rem 1rem",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: "#6366f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {(member.user.name ?? member.user.email ?? "?")
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "#e5e7eb",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {member.user.name}
                    {isMe && (
                      <span style={{ color: "#6b7280", fontWeight: 400, marginLeft: "0.375rem" }}>
                        (you)
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{member.user.email}</div>
                </div>

                {/* DM button */}
                {!isMe && (
                  <button
                    onClick={() => navigate(`/w/${slug}/dm/${member.userId}`)}
                    title={`Message ${member.user.name}`}
                    style={{
                      background: "none",
                      border: "1px solid #2e2e2e",
                      borderRadius: "0.375rem",
                      color: "#6b7280",
                      fontSize: "0.75rem",
                      padding: "0.25rem 0.5rem",
                      cursor: "pointer",
                      transition: "border-color 0.15s, color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      const btn = e.currentTarget as HTMLButtonElement;
                      btn.style.borderColor = "#6366f1";
                      btn.style.color = "#a5b4fc";
                    }}
                    onMouseLeave={(e) => {
                      const btn = e.currentTarget as HTMLButtonElement;
                      btn.style.borderColor = "#2e2e2e";
                      btn.style.color = "#6b7280";
                    }}
                  >
                    DM
                  </button>
                )}

                {/* Role + actions */}
                {canManage && !isMe && member.role !== "OWNER" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member, e.target.value as "ADMIN" | "MEMBER")
                      }
                      style={{
                        backgroundColor: "#242424",
                        border: "1px solid #333",
                        borderRadius: "0.375rem",
                        color: "#9ca3af",
                        fontSize: "0.75rem",
                        padding: "0.25rem 0.5rem",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <button
                      onClick={() => handleRemoveMember(member)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#f87171",
                        cursor: "pointer",
                        fontSize: "0.8125rem",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: member.role === "OWNER" ? "#a5b4fc" : "#6b7280",
                      fontWeight: member.role === "OWNER" ? 600 : 400,
                    }}
                  >
                    {ROLE_LABEL[member.role]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>}
    </div>
  );
}
