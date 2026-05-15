import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router({ mergeParams: true });

// GET /api/teams/:teamId/members
router.get("/", requireAuth, async (req, res) => {
  const teamId = String(req.params.teamId);

  const member = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: req.user!.id } },
  });
  if (!member) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { joinedAt: "asc" },
  });

  res.json(members);
});

// PATCH /api/teams/:teamId/members/:userId
router.patch("/:userId", requireAuth, async (req, res) => {
  const teamId = String(req.params.teamId);
  const targetUserId = String(req.params.userId);

  const parsed = z.object({ role: z.enum(["ADMIN", "MEMBER"]) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid role" });
    return;
  }

  const requester = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: req.user!.id } },
  });
  if (!requester || (requester.role !== "OWNER" && requester.role !== "ADMIN")) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const target = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: targetUserId } },
  });
  if (!target) {
    res.status(404).json({ error: "Member not found" });
    return;
  }
  if (target.role === "OWNER") {
    res.status(400).json({ error: "Cannot change owner role" });
    return;
  }

  const updated = await prisma.teamMember.update({
    where: { teamId_userId: { teamId, userId: targetUserId } },
    data: { role: parsed.data.role },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  });

  res.json(updated);
});

// DELETE /api/teams/:teamId/members/:userId
router.delete("/:userId", requireAuth, async (req, res) => {
  const teamId = String(req.params.teamId);
  const targetUserId = String(req.params.userId);

  const isSelf = req.user!.id === targetUserId;

  if (!isSelf) {
    const requester = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: req.user!.id } },
    });
    if (!requester || (requester.role !== "OWNER" && requester.role !== "ADMIN")) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
  }

  const target = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: targetUserId } },
  });
  if (!target) {
    res.status(404).json({ error: "Member not found" });
    return;
  }
  if (target.role === "OWNER" && !isSelf) {
    res.status(400).json({ error: "Cannot remove the team owner" });
    return;
  }

  await prisma.teamMember.delete({ where: { teamId_userId: { teamId, userId: targetUserId } } });
  res.status(204).send();
});

export default router;
