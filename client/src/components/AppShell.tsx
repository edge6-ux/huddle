import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { useTeamStore } from "../stores/teamStore";
import WorkspaceSidebar from "./WorkspaceSidebar";
import TeamSidebar from "./TeamSidebar";

export default function AppShell() {
  const { slug, teamId } = useParams<{ slug?: string; teamId?: string }>();

  const { workspaces, fetchWorkspaces, setActiveWorkspace, fetched } = useWorkspaceStore();
  const { fetchTeams, setActiveTeam, teams } = useTeamStore();

  useEffect(() => {
    if (!fetched) fetchWorkspaces();
  }, [fetched, fetchWorkspaces]);

  useEffect(() => {
    if (!slug) return;
    const ws = workspaces.find((w) => w.slug === slug) ?? null;
    setActiveWorkspace(ws);
    if (ws) fetchTeams(slug);
  }, [workspaces, slug, setActiveWorkspace, fetchTeams]);

  useEffect(() => {
    if (!teamId) {
      setActiveTeam(null);
      return;
    }
    const team = teams.find((t) => t.id === teamId) ?? null;
    setActiveTeam(team);
  }, [teams, teamId, setActiveTeam]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#0f0f0f",
      }}
    >
      <WorkspaceSidebar />
      <TeamSidebar />
      <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        <Outlet />
      </main>
    </div>
  );
}
