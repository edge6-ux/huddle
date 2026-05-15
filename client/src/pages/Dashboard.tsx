import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspaceStore } from "../stores/workspaceStore";

export default function Dashboard() {
  const navigate = useNavigate();
  const { workspaces, loading, fetched, fetchWorkspaces } = useWorkspaceStore();

  useEffect(() => {
    if (!fetched) fetchWorkspaces();
  }, [fetched, fetchWorkspaces]);

  useEffect(() => {
    if (!fetched || loading) return;
    if (workspaces.length > 0) {
      navigate(`/w/${workspaces[0].slug}`, { replace: true });
    } else {
      navigate("/onboarding", { replace: true });
    }
  }, [fetched, loading, workspaces, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f0f0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ color: "#6b7280", fontSize: "0.9375rem" }}>Loading…</span>
    </div>
  );
}
