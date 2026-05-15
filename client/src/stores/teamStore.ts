import { create } from "zustand";
import { getTeams, type Team, type TeamMember } from "../lib/api";

interface TeamStore {
  teams: Team[];
  activeTeam: Team | null;
  members: TeamMember[];
  loading: boolean;
  currentWorkspaceSlug: string | null;
  fetchTeams: (workspaceSlug: string) => Promise<void>;
  setActiveTeam: (team: Team | null) => void;
  setMembers: (members: TeamMember[]) => void;
  addTeam: (team: Team) => void;
  updateTeam: (teamId: string, data: Partial<Team>) => void;
  removeTeam: (teamId: string) => void;
  addRoom: (teamId: string, room: import("../lib/api").Room) => void;
  removeRoom: (teamId: string, roomId: string) => void;
}

export const useTeamStore = create<TeamStore>((set) => ({
  teams: [],
  activeTeam: null,
  members: [],
  loading: false,
  currentWorkspaceSlug: null,

  fetchTeams: async (workspaceSlug) => {
    set({ loading: true, currentWorkspaceSlug: workspaceSlug });
    try {
      const teams = await getTeams(workspaceSlug);
      set({ teams, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setActiveTeam: (team) => set({ activeTeam: team }),

  setMembers: (members) => set({ members }),

  addTeam: (team) => set((s) => ({ teams: [...s.teams, team] })),

  updateTeam: (teamId, data) =>
    set((s) => ({
      teams: s.teams.map((t) => (t.id === teamId ? { ...t, ...data } : t)),
      activeTeam:
        s.activeTeam?.id === teamId ? { ...s.activeTeam, ...data } : s.activeTeam,
    })),

  removeTeam: (teamId) =>
    set((s) => ({
      teams: s.teams.filter((t) => t.id !== teamId),
      activeTeam: s.activeTeam?.id === teamId ? null : s.activeTeam,
    })),

  addRoom: (teamId, room) =>
    set((s) => ({
      teams: s.teams.map((t) =>
        t.id === teamId ? { ...t, rooms: [...(t.rooms ?? []), room] } : t
      ),
      activeTeam:
        s.activeTeam?.id === teamId
          ? { ...s.activeTeam, rooms: [...(s.activeTeam.rooms ?? []), room] }
          : s.activeTeam,
    })),

  removeRoom: (teamId, roomId) => {
    const filterRooms = (rooms?: import("../lib/api").Room[]) =>
      (rooms ?? []).filter((r) => r.id !== roomId);
    set((s) => ({
      teams: s.teams.map((t) =>
        t.id === teamId ? { ...t, rooms: filterRooms(t.rooms) } : t
      ),
      activeTeam:
        s.activeTeam?.id === teamId
          ? { ...s.activeTeam, rooms: filterRooms(s.activeTeam.rooms) }
          : s.activeTeam,
    }));
  },
}));
