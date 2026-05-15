import { Router } from "express";
import { z } from "zod";
import { adjectives, animals, colors, uniqueNamesGenerator } from "unique-names-generator";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router({ mergeParams: true });

function generateRoomSlug(): string {
  const name = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: "-",
    length: 3,
    style: "lowerCase",
  });
  return `${name}-${Math.floor(Math.random() * 90) + 10}`;
}

// POST /api/workspaces/:slug/teams
router.post("/", requireAuth, async (req, res) => {
  const workspaceSlug = String(req.params.slug);
  const parsed = z
    .object({
      name: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) {
    res.status(404).json({ error: "Workspace not found" });
    return;
  }

  const wsMember = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: req.user!.id } },
  });
  if (!wsMember || (wsMember.role !== "OWNER" && wsMember.role !== "ADMIN")) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  let roomSlug = generateRoomSlug();
  let attempts = 0;
  while ((await prisma.room.findUnique({ where: { slug: roomSlug } })) && attempts < 10) {
    roomSlug = generateRoomSlug();
    attempts++;
  }

  const team = await prisma.team.create({
    data: {
      workspaceId: workspace.id,
      name: parsed.data.name,
      description: parsed.data.description,
      members: { create: { userId: req.user!.id, role: "OWNER" } },
      rooms: { create: { slug: roomSlug, name: "General" } },
    },
    include: {
      rooms: true,
      members: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
      _count: { select: { members: true } },
    },
  });

  res.status(201).json({ ...team, userRole: "OWNER" });
});

// GET /api/workspaces/:slug/teams
router.get("/", requireAuth, async (req, res) => {
  const workspaceSlug = String(req.params.slug);
  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) {
    res.status(404).json({ error: "Workspace not found" });
    return;
  }

  const wsMember = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: req.user!.id } },
  });
  if (!wsMember) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const memberships = await prisma.teamMember.findMany({
    where: { userId: req.user!.id, team: { workspaceId: workspace.id } },
    include: {
      team: {
        include: {
          rooms: true,
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  res.json(memberships.map((m) => ({ ...m.team, userRole: m.role })));
});

// GET /api/workspaces/:slug/teams/:teamId
router.get("/:teamId", requireAuth, async (req, res) => {
  const teamId = String(req.params.teamId);

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      workspace: { select: { id: true, name: true, slug: true } },
      rooms: { orderBy: { createdAt: "asc" } },
      members: {
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!team) {
    res.status(404).json({ error: "Team not found" });
    return;
  }

  const member = team.members.find((m) => m.userId === req.user!.id);
  if (!member) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  res.json({ ...team, userRole: member.role });
});

// PATCH /api/workspaces/:slug/teams/:teamId
router.patch("/:teamId", requireAuth, async (req, res) => {
  const teamId = String(req.params.teamId);
  const parsed = z
    .object({
      name: z.string().min(1).max(100).optional(),
      description: z.string().max(500).nullable().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const member = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: req.user!.id } },
  });
  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const team = await prisma.team.update({ where: { id: teamId }, data: parsed.data });
  res.json(team);
});

// DELETE /api/workspaces/:slug/teams/:teamId
router.delete("/:teamId", requireAuth, async (req, res) => {
  const teamId = String(req.params.teamId);
  const workspaceSlug = String(req.params.slug);

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) {
    res.status(404).json({ error: "Workspace not found" });
    return;
  }

  const wsMember = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: req.user!.id } },
  });
  if (!wsMember || wsMember.role !== "OWNER") {
    res.status(403).json({ error: "Only workspace owners can delete teams" });
    return;
  }

  await prisma.team.delete({ where: { id: teamId } });
  res.status(204).send();
});

export default router;
