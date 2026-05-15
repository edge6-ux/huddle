import { Router } from "express";
import { z } from "zod";
import { adjectives, animals, colors, uniqueNamesGenerator } from "unique-names-generator";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

// Team-scoped room routes — mounted at /api/teams/:teamId/rooms
const router = Router({ mergeParams: true });

function generateSlug(): string {
  const name = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: "-",
    length: 3,
    style: "lowerCase",
  });
  return `${name}-${Math.floor(Math.random() * 90) + 10}`;
}

// POST /api/teams/:teamId/rooms
router.post("/", requireAuth, async (req, res) => {
  const teamId = String(req.params.teamId);
  const parsed = z.object({ name: z.string().min(1).max(100) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const member = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: req.user!.id } },
  });
  if (!member) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  let slug = generateSlug();
  let attempts = 0;
  while ((await prisma.room.findUnique({ where: { slug } })) && attempts < 10) {
    slug = generateSlug();
    attempts++;
  }

  const room = await prisma.room.create({
    data: { teamId, slug, name: parsed.data.name },
  });

  res.status(201).json(room);
});

// GET /api/teams/:teamId/rooms
router.get("/", requireAuth, async (req, res) => {
  const teamId = String(req.params.teamId);

  const member = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: req.user!.id } },
  });
  if (!member) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const rooms = await prisma.room.findMany({
    where: { teamId },
    orderBy: { createdAt: "asc" },
  });

  res.json(rooms);
});

// DELETE /api/teams/:teamId/rooms/:roomId
router.delete("/:roomId", requireAuth, async (req, res) => {
  const teamId = String(req.params.teamId);
  const roomId = String(req.params.roomId);

  const member = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: req.user!.id } },
  });
  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room || room.teamId !== teamId) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  await prisma.room.delete({ where: { id: roomId } });
  res.status(204).send();
});

export default router;

// Public room info — mounted at /api/rooms
export const roomInfoRouter = Router();

roomInfoRouter.get("/:slug/info", async (req, res) => {
  const slug = String(req.params.slug);
  const room = await prisma.room.findUnique({
    where: { slug },
    select: { slug: true, name: true },
  });

  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  res.json(room);
});
