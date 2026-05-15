import { create } from "zustand";
import { getWorkspaces, type Workspace } from "../lib/api";

interface WorkspaceStore {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  loading: boolean;
  fetched: boolean;
  fetchWorkspaces: () => Promise<void>;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (slug: string, data: Partial<Workspace>) => void;
  removeWorkspace: (slug: string) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  workspaces: [],
  activeWorkspace: null,
  loading: false,
  fetched: false,

  fetchWorkspaces: async () => {
    set({ loading: true });
    try {
      const workspaces = await getWorkspaces();
      set({ workspaces, loading: false, fetched: true });
    } catch {
      set({ loading: false, fetched: true });
    }
  },

  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),

  addWorkspace: (workspace) =>
    set((s) => ({ workspaces: [workspace, ...s.workspaces] })),

  updateWorkspace: (slug, data) =>
    set((s) => ({
      workspaces: s.workspaces.map((w) => (w.slug === slug ? { ...w, ...data } : w)),
      activeWorkspace:
        s.activeWorkspace?.slug === slug
          ? { ...s.activeWorkspace, ...data }
          : s.activeWorkspace,
    })),

  removeWorkspace: (slug) =>
    set((s) => ({
      workspaces: s.workspaces.filter((w) => w.slug !== slug),
      activeWorkspace: s.activeWorkspace?.slug === slug ? null : s.activeWorkspace,
    })),
}));
