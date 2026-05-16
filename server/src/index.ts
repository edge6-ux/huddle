import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import tokenRouter from "./routes/token.js";
import instantRoomRouter from "./routes/instantRoom.js";
import roomsRouter, { roomInfoRouter } from "./routes/rooms.js";
import workspacesRouter from "./routes/workspaces.js";
import teamsRouter from "./routes/teams.js";
import membersRouter from "./routes/members.js";
import { teamInviteRouter, inviteRouter } from "./routes/invites.js";

const app = express();
const port = parseInt(process.env.PORT ?? "3001", 10);

const corsOptions = {
  origin: process.env.CLIENT_URL ?? "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Handle preflight for all routes before Better Auth intercepts them
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

// Better Auth must be before express.json()
app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json());

app.use("/api/token", tokenRouter);
app.use("/api/instant-room", instantRoomRouter);
app.use("/api/rooms", roomInfoRouter);
app.use("/api/workspaces", workspacesRouter);
app.use("/api/workspaces/:slug/teams", teamsRouter);
app.use("/api/teams/:teamId/rooms", roomsRouter);
app.use("/api/teams/:teamId/members", membersRouter);
app.use("/api/teams/:teamId", teamInviteRouter);
app.use("/api/invite", inviteRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Huddle server running on http://localhost:${port}`);
});
