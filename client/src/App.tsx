import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Join from "./pages/Join";
import Room from "./pages/Room";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import WorkspaceHome from "./pages/WorkspaceHome";
import TeamHome from "./pages/TeamHome";
import InvitePage from "./pages/InvitePage";
import DMPage from "./pages/DMPage";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/join" element={<Join />} />
        <Route path="/room/:slug" element={<Room />} />
        <Route path="/invite/:token" element={<InvitePage />} />

        {/* Protected — no shell */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* Protected — with AppShell */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/w/:slug" element={<WorkspaceHome />} />
          <Route path="/w/:slug/teams/:teamId" element={<TeamHome />} />
          <Route path="/w/:slug/dm/:userId" element={<DMPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
