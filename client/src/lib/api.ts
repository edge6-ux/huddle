// ─── Types ───────────────────────────────────────────────────────────────────

export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";
export type TeamRole = "OWNER" | "ADMIN" | "MEMBER";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  createdAt: string;
  role: WorkspaceRole;
  _count?: { teams: number; members: number };
  teams?: Team[];
  members?: WorkspaceMember[];
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
  user: { id: string; name: string; email: string; image: string | null };
}

export interface Team {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  createdAt: string;
  userRole?: TeamRole;
  rooms?: Room[];
  members?: TeamMember[];
  _count?: { members: number; rooms: number };
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: string;
  user: { id: string; name: string; email: string; image: string | null };
}

export interface Room {
  id: string;
  teamId: string;
  slug: string;
  name: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  roomId: string;
  startedAt: string;
  endedAt: string | null;
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

const BASE_URL = "/api";

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
      else if (body?.message) message = body.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response;
}

// ─── Token / LiveKit ──────────────────────────────────────────────────────────

export async function createInstantRoom(): Promise<{ slug: string; name: string }> {
  const response = await apiFetch("/instant-room", { method: "POST" });
  return response.json();
}

export async function getToken(
  slug: string,
  displayName: string
): Promise<{ token: string; livekitUrl: string; roomName: string; slug: string }> {
  const response = await apiFetch("/token", {
    method: "POST",
    body: JSON.stringify({ slug, displayName }),
  });
  return response.json();
}

export async function getRoomInfo(slug: string): Promise<{ slug: string; name: string }> {
  const response = await apiFetch(`/rooms/${slug}/info`);
  return response.json();
}

// ─── Workspaces ───────────────────────────────────────────────────────────────

export async function getWorkspaces(): Promise<Workspace[]> {
  const response = await apiFetch("/workspaces");
  return response.json();
}

export async function createWorkspace(name: string): Promise<Workspace> {
  const response = await apiFetch("/workspaces", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return response.json();
}

export async function getWorkspace(slug: string): Promise<Workspace> {
  const response = await apiFetch(`/workspaces/${slug}`);
  return response.json();
}

export async function updateWorkspace(slug: string, data: { name?: string }): Promise<Workspace> {
  const response = await apiFetch(`/workspaces/${slug}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteWorkspace(slug: string): Promise<void> {
  await apiFetch(`/workspaces/${slug}`, { method: "DELETE" });
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export async function getTeams(workspaceSlug: string): Promise<Team[]> {
  const response = await apiFetch(`/workspaces/${workspaceSlug}/teams`);
  return response.json();
}

export async function createTeam(
  workspaceSlug: string,
  name: string,
  description?: string
): Promise<Team> {
  const response = await apiFetch(`/workspaces/${workspaceSlug}/teams`, {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
  return response.json();
}

export async function getTeam(workspaceSlug: string, teamId: string): Promise<Team> {
  const response = await apiFetch(`/workspaces/${workspaceSlug}/teams/${teamId}`);
  return response.json();
}

export async function updateTeam(
  workspaceSlug: string,
  teamId: string,
  data: { name?: string; description?: string | null }
): Promise<Team> {
  const response = await apiFetch(`/workspaces/${workspaceSlug}/teams/${teamId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteTeam(workspaceSlug: string, teamId: string): Promise<void> {
  await apiFetch(`/workspaces/${workspaceSlug}/teams/${teamId}`, { method: "DELETE" });
}

// ─── Team Members ─────────────────────────────────────────────────────────────

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const response = await apiFetch(`/teams/${teamId}/members`);
  return response.json();
}

export async function updateTeamMemberRole(
  teamId: string,
  userId: string,
  role: "ADMIN" | "MEMBER"
): Promise<TeamMember> {
  const response = await apiFetch(`/teams/${teamId}/members/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
  return response.json();
}

export async function removeTeamMember(teamId: string, userId: string): Promise<void> {
  await apiFetch(`/teams/${teamId}/members/${userId}`, { method: "DELETE" });
}

// ─── Rooms ────────────────────────────────────────────────────────────────────

export async function getTeamRooms(teamId: string): Promise<Room[]> {
  const response = await apiFetch(`/teams/${teamId}/rooms`);
  return response.json();
}

export async function createTeamRoom(teamId: string, name: string): Promise<Room> {
  const response = await apiFetch(`/teams/${teamId}/rooms`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return response.json();
}

export async function deleteTeamRoom(teamId: string, roomId: string): Promise<void> {
  await apiFetch(`/teams/${teamId}/rooms/${roomId}`, { method: "DELETE" });
}

// ─── Invites ──────────────────────────────────────────────────────────────────

export async function generateInvite(
  teamId: string,
  opts?: { expiresInDays?: number; maxUses?: number }
): Promise<{ token: string; expiresAt: string | null }> {
  const response = await apiFetch(`/teams/${teamId}/invite`, {
    method: "POST",
    body: JSON.stringify(opts ?? {}),
  });
  return response.json();
}

export async function getInviteInfo(token: string): Promise<{
  teamId: string;
  teamName: string;
  workspaceName: string;
  workspaceSlug: string;
}> {
  const response = await apiFetch(`/invite/${token}`);
  return response.json();
}

export async function acceptInvite(
  token: string
): Promise<{ teamId: string; workspaceSlug: string }> {
  const response = await apiFetch(`/invite/${token}/accept`, { method: "POST" });
  return response.json();
}
