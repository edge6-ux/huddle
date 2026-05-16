import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router({ mergeParams: true });

router.get("/", requireAuth, async (req, res) => {
  const teamId = req.params.teamId as string;
  const before = typeof req.query.before === "string" ? req.query.before : undefined;
  const limit = 50;

  const member = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: req.user!.id } },
  });
  if (!member) {
    res.status(403).json({ error: "Not a member of this team" });
    return;
  }

  const messages = await prisma.message.findMany({
    where: {
      teamId,
      ...(before ? { createdAt: { lt: new Date(before) } } : {}),
    },
    include: { sender: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  res.json(messages.reverse());
});

const sendSchema = z.object({ content: z.string().min(1).max(4000) });

router.post("/", requireAuth, async (req, res) => {
  const teamId = req.params.teamId as string;
  const parsed = sendSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid message" });
    return;
  }

  const member = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: req.user!.id } },
  });
  if (!member) {
    res.status(403).json({ error: "Not a member of this team" });
    return;
  }

  const message = await prisma.message.create({
    data: { teamId, senderId: req.user!.id, content: parsed.data.content },
    include: { sender: { select: { id: true, name: true, image: true } } },
  });

  res.status(201).json(message);
});

export default router;
