import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

function generateSlug(name: string): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "workspace";
  const suffix = Math.floor(Math.random() * 9000) + 1000;
  return `${base}-${suffix}`;
}

// POST /api/workspaces
router.post("/", requireAuth, async (req, res) => {
  const parsed = z.object({ name: z.string().min(1).max(100) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  let slug = generateSlug(parsed.data.name);
  let attempts = 0;
  while ((await prisma.workspace.findUnique({ where: { slug } })) && attempts < 10) {
    slug = generateSlug(parsed.data.name);
    attempts++;
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: parsed.data.name,
      slug,
      members: { create: { userId: req.user!.id, role: "OWNER" } },
    },
    include: { _count: { select: { teams: true, members: true } } },
  });

  res.status(201).json({ ...workspace, role: "OWNER" });
});

// GET /api/workspaces
router.get("/", requireAuth, async (req, res) => {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: req.user!.id },
    include: {
      workspace: { include: { _count: { select: { teams: true, members: true } } } },
    },
    orderBy: { joinedAt: "asc" },
  });

  res.json(memberships.map((m) => ({ ...m.workspace, role: m.role })));
});

// GET /api/workspaces/:slug
router.get("/:slug", requireAuth, async (req, res) => {
  const slug = String(req.params.slug);
  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
      },
      teams: {
        include: { _count: { select: { members: true, rooms: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!workspace) {
    res.status(404).json({ error: "Workspace not found" });
    return;
  }

  const member = workspace.members.find((m) => m.userId === req.user!.id);
  if (!member) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  res.json({ ...workspace, role: member.role });
});

// PATCH /api/workspaces/:slug
router.patch("/:slug", requireAuth, async (req, res) => {
  const slug = String(req.params.slug);
  const parsed = z
    .object({ name: z.string().min(1).max(100).optional() })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const workspace = await prisma.workspace.findUnique({ where: { slug } });
  if (!workspace) {
    res.status(404).json({ error: "Workspace not found" });
    return;
  }

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: req.user!.id } },
  });
  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const updated = await prisma.workspace.update({ where: { id: workspace.id }, data: parsed.data });
  res.json(updated);
});

// DELETE /api/workspaces/:slug
router.delete("/:slug", requireAuth, async (req, res) => {
  const slug = String(req.params.slug);
  const workspace = await prisma.workspace.findUnique({ where: { slug } });
  if (!workspace) {
    res.status(404).json({ error: "Workspace not found" });
    return;
  }

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: req.user!.id } },
  });
  if (!member || member.role !== "OWNER") {
    res.status(403).json({ error: "Only the owner can delete a workspace" });
    return;
  }

  await prisma.workspace.delete({ where: { id: workspace.id } });
  res.status(204).send();
});

export default router;
